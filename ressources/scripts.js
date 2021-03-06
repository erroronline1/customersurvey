const global = {
	restart: 20, // seconds to restart, 0 disables
	sheets: null, // actual number of sheets will be set with init function
	report: undefined // scripts behaviour if survey or report
};

function jump(steps) { // scroll to relative sheet 
	let sheet = document.getElementsByTagName('section');
	window.scrollBy({
		top: steps * (1 + 1 / (global.sheets - 1)) * sheet[0].clientHeight,
		behavior: 'smooth'
	});
}

let api = {
	url: 'http://localhost/customersurvey/ressources/api.php',
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
	getSelected: function () {
		let payload = [];
		// input radio button handler	
		let inputs = document.getElementsByTagName('input');
		Object.keys(inputs).forEach(element => {
			if (inputs[element].checked) {
				payload.push(inputs[element].value);
			}
		});
		return payload;
	},
	show: async function (displaytarget) {
		let method = 'get',
			payload = {};
		_.api(method, api.url, payload)
			.then(data => {
				let output = '';
				data.forEach(item => {
					output += '<div>'
					Object.keys(item).forEach(key => {
						if (key == 'id') output += '<em>' + key + ':</em> ' + item[key] + ' | delete: <input type="checkbox" value="' + item['id'] + '" /><br />';
						else if (item[key]) output += '<em>' + key + ':</em> ' + item[key] + ' | ';
					});
					output += '</div>';
				});
				_.el(displaytarget).innerHTML = output;
			})
			.catch(error => {
				this.error(error);
			});
		console.log(method + ' request sent', Date.now());
	},
	save: async function () { // process inputs and textareas and transfer to api
		// make server request and await result
		let payload = this.getInputs();
		if (Object.keys(payload).length) {
			let method = (this.currentId !== null) ? 'PUT' : 'POST';
			_.api(method, api.url, payload)
				.then(data => {
					api.currentId = data;
					console.log('current id: ' + api.currentId);
				})
				.catch(error => {
					this.error(error);
				});
			console.log(method + ' request sent', Date.now());
		}
	},
	delete: async function (what) {
		let method = 'DELETE',
			payload = {},
			confirm = null;
		if (what == 'all') confirm = prompt('enter confirmation to permanently delete all entries: ');
		else {
			payload['selection'] = this.getSelected();
			if (payload['selection'].length) confirm = prompt('enter confirmation to permanently delete ' + payload['selection'].length + ' selected entries: ');
		}
		if (confirm !== null) {
			payload['confirm'] = confirm;
			_.api(method, api.url, payload)
				.then(data => {
					growlNotif(what == 'all' ? 'table was successfully erased' : 'entries were sucessfully deleted, you may have to reload.');
				})
				.catch(error => {
					this.error(error);
				});
			console.log(method + ' request sent', Date.now());
		}
	},
	error: function (error) {
		growlNotif(error);
	}
}

function initjskeyboard(identifier, target) { //initiates the keyboard and assigns to target-input
	if (!_.el(identifier).hasChildNodes()) window[identifier] = new jskeyboard(target, _.el(identifier));
	//window.whatever defines global variables outside of a functions scope
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
		use.setAttribute('href', 'ressources/sprite.svg#svg_arrow-up');
		svg.appendChild(use);
		svg.setAttribute('id', parent.id + 'shiftkey');
		key.appendChild(svg);
		key.onclick = function () {
			eval(parent.id + '.shift=' + parent.id + '.shift==true ? false : true; this.classList.toggle(\'activeshiftkey\')');
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
		use.setAttribute('href', 'ressources/sprite.svg#svg_backspace');
		svg.appendChild(use);
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
		use.setAttribute('href', 'ressources/sprite.svg#svg_enter');
		svg.appendChild(use);
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
	if (global.report == undefined) {
		let t;
		window.onfocus = window.onmousemove = window.onmousedown = window.onclick = window.onscroll = window.onkeypress = resetTimer;

		function resetTimer() {
			window.clearTimeout(t);
			if (Object.keys(api.getInputs()).length || window.scrollY > 256) // restart only if filled form or not on first page 
				t = window.setTimeout(() => {
					api.save();
					window.setTimeout(() => { // give a litte time to store just in case
						window.location.href = 'index.html';
					}, 512);
				}, global.restart * 1000);
		}
	}
}

let scrollHandler; // initiate ajax storage request after scrolling stops
window.addEventListener('scroll', event => {
	if (global.report == undefined) {
		window.clearTimeout(scrollHandler);
		scrollHandler = setTimeout(() => {
			_.el('recommend').style.display = _.el('general2').checked ? 'block' : 'none';
			api.save();
		}, 512); // less than that results in more than one requests messing up the database and id-handling
	}
});

function init(report) {
	global.report = report;
	global.sheets = Object.keys(document.getElementsByTagName('section')).length;
	document.documentElement.style.setProperty('--sheets', global.sheets - 1);
	if (global.restart && global.report == undefined) restart();
	if (global.report) api.show('report');
}

function growlNotif(text) { // short popups for status information
	if (typeof text !== 'undefined') {
		_.el('growlNotif').innerHTML = text;
		_.el('growlNotif').classList.add('show');
		window.setTimeout(growlNotif, 3000);
	} else _.el('growlNotif').classList.remove('show');
}