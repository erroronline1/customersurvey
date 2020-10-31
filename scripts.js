const sheets = 7, // actual number of sheets
	reload = 0; //seconds
let text1keyboard, text2keyboard, text3keyboard; // define possible keyboards for text input


let currentID; 

function jump(steps) { // scroll to relative sheet 
	let sheet = document.getElementsByTagName('section');
	window.scrollBy({
		top: steps * (1 + 1 / (sheets - 1)) * sheet[0].clientHeight,
		behavior: 'smooth'
	});
}

function save() { // process inputs and textareas and transfer to api by ajax-call
	let payload = {};
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
//	console.log(payload);
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

function idleLogout() { // reload entire survey after timeout unless some interaction is detected
	var t;
	window.onfocus = window.onmousemove = window.onmousedown = window.onclick = window.onscroll = window.onkeypress = resetTimer;

	function resetTimer() {
		clearTimeout(t);
		t = setTimeout(() => {
			window.location.href = 'index.html';
		}, reload * 1000);
	}
}
if (reload) idleLogout();

/*!
 * Run a callback function after scrolling has stopped
 * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Function} callback The function to run after scrolling
 */
const scrollStop = callback => {
	if (!callback || typeof callback !== 'function') return; // Make sure a valid callback was provided
	let isScrolling; // Setup scrolling variable
	window.addEventListener('scroll', event => { // Listen for scroll events
		window.clearTimeout(isScrolling); // Clear our timeout throughout the scroll
		isScrolling = setTimeout(() => {
			callback();
		}, 100); // Set a timeout to run after scrolling ends
	});
};
scrollStop(save);