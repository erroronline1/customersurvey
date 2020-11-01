const global = {
	restart: 0, // seconds to restart, 0 disables
	sheets: null // actual number of sheets will be set with init function
};
let text1keyboard, text2keyboard, text3keyboard; // initiate possible keyboards for text input

function jump(steps) { // scroll to relative sheet 
	let sheet = document.getElementsByTagName('section');
	window.scrollBy({
		top: steps * (1 + 1 / (global.sheets - 1)) * sheet[0].clientHeight,
		behavior: 'smooth'
	});
}

let api = {
	url: 'http://localhost/customersurvey/api.php',
	currentId: null,
	getInputs: function () {
		let payload = {};
		if (this.currentId) payload.id = this.currentId;
		// input radio button handler	
		let inputs = document.getElementsByTagName('input');
		Object.keys(inputs).forEach(element => {
			if (inputs[element].checked) {
				payload[inputs[element].name] = inputs[element].value;
			}
		});
		// textarea value handler
		inputs = document.getElementsByTagName('textarea');
		Object.keys(inputs).forEach(element => {
			if (inputs[element].value) {
				payload[inputs[element].name] = encodeURI(inputs[element].value.replace(/^\s+/, '').replace(/\s+$/, ''));
			}
		});
		return payload;
	},
	save: function () { // process inputs and textareas and transfer to api by ajax-call
		// make server request and await result
		let payload = this.getInputs();
		if (Object.keys(payload).length) {
			var d = new Date();
			var n = d.getTime();
			console.log('request sent', n);
			_.ajax.request('post', api.url, payload).then(api.save_result, api.error);
		}
	},
	error: function (error) {
		console.log('ajax error, server responded: ' + error);
	},
	save_result: function (payload) {
		api.currentId = payload; // this.currentId doesn't work, maybe because this is used as a callback function?
		console.log(api.currentId);
	}
}

class jskeyboard { // construct a keyboard and handle key-presses
	constructor(typeto, parent) {
		this.typeto = typeto;
		this.parentId = parent.id;
		const layout = [
			['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ß'],
			['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
			['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
			['y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-', '?']
		];
		layout.forEach(row => {
			var keyrow = document.createElement('div');
			keyrow.className = 'keyrow';
			row.forEach(char => {
				var key = document.createElement('div');
				key.className = 'key';
				key.appendChild(document.createTextNode(char));
				key.onclick = function () {
					eval(parent.id + '.insertChars(\'' + char + '\')');
				};
				keyrow.appendChild(key);
			});
			parent.appendChild(keyrow);
		});
		var keyrow = document.createElement('div');
		keyrow.className = 'keyrow';

		// shift
		var key = document.createElement('div');
		key.className = 'key';
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		use.setAttribute('href', '#svg_arrow-up');
		svg.appendChild(use);
		svg.setAttribute('class', 'svgkey');
		svg.setAttribute('id', parent.id + 'shiftkey');
		key.appendChild(svg);
		key.onclick = function () {
			eval(parent.id + '.shift=true; this.classList.add(\'activeshiftkey\')');
		};
		keyrow.appendChild(key);

		// add spacebar
		var key = document.createElement('div');
		key.className = 'key spacekey';
		key.appendChild(document.createTextNode(' '));
		key.onclick = function () {
			eval(parent.id + '.insertChars(\' \')');
		};
		keyrow.appendChild(key);

		// backspace
		var key = document.createElement('div');
		key.className = 'key';
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		use.setAttribute('href', '#svg_backspace');
		svg.appendChild(use);
		svg.setAttribute('class', 'svgkey');
		key.appendChild(svg);
		key.onclick = function () {
			eval(parent.id + '.insertChars(\'\\b\')');
		};
		keyrow.appendChild(key);

		// enter
		var key = document.createElement('div');
		key.className = 'key';
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		use.setAttribute('href', '#svg_enter');
		svg.appendChild(use);
		svg.setAttribute('class', 'svgkey');
		key.appendChild(svg);
		key.onclick = function () {
			eval(parent.id + '.insertChars(\'\\n\')');
		};
		keyrow.appendChild(key);

		parent.appendChild(keyrow);
	}
	insertChars(characters) { // fills or deletes text on cursor position (textareas or inputs) 
		let oldCPos = this.typeto.selectionStart;
		if (characters == '\b') { // backspace to delete
			this.typeto.value = this.typeto.value.substring(0, this.typeto.selectionStart - 1) + this.typeto.value.substring(this.typeto.selectionStart, this.typeto.value.length);
			this.typeto.selectionStart = this.typeto.selectionEnd = oldCPos - 1;
		} else if (characters == '\n') { // backspace to delete
			this.typeto.value = this.typeto.value.substring(0, this.typeto.selectionStart) + '\n' + this.typeto.value.substring(this.typeto.selectionStart, this.typeto.value.length);
			this.typeto.selectionStart = this.typeto.selectionEnd = oldCPos + characters.length;
		} else {
			if (this.shift) {
				characters = characters.toUpperCase();
				this.shift = false;
				document.getElementById(this.parentId + 'shiftkey').parentNode.classList.remove('activeshiftkey');
			}
			this.typeto.value = this.typeto.value.substring(0, this.typeto.selectionStart) + characters + this.typeto.value.substring(this.typeto.selectionStart, this.typeto.value.length);
			this.typeto.selectionStart = this.typeto.selectionEnd = oldCPos + characters.length;
		}
		this.typeto.focus();
	}
}

function restart() { // restart entire survey after timeout unless some interaction is detected
	let t;
	window.onfocus = window.onmousemove = window.onmousedown = window.onclick = window.onscroll = window.onkeypress = resetTimer;

	function resetTimer() {
		window.clearTimeout(t);
		if (Object.keys(api.getInputs()).length || window.scrollY > 256) // restart only if filled form or not on first page 
			t = window.setTimeout(() => {
				window.location.href = 'index.html';
			}, global.restart * 1000);
	}
}

let scrollHandler; // initiate ajax storage request after scrolling stops
window.addEventListener('scroll', event => {
	window.clearTimeout(scrollHandler);
	scrollHandler = setTimeout(() => {
		api.save();
	}, 512); // less than that results in more than one requests messing up the database and id-handling
});

function init() {
	global.sheets = Object.keys(document.getElementsByTagName('section')).length;
	if (global.restart) restart();
}