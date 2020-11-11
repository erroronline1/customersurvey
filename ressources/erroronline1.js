// personal usecase framework by error on line 1 (erroronline.one)
// this is not underscore.js!

Array.prototype.contains = function (values) {
	return _.contains(this, values);
} // to use intitive with arrays
String.prototype.contains = function (values) {
	return _.contains(this, values);
} // to use intitive with string

const _ = {
	el: function (x) { // shortcut for readabilities sake: _.el('element')
		return document.getElementById(x);
	},
	contains: function (obj, values) { // searches if at least one element of values (string or array) occurs in obj (string or array)
		return Array.isArray(values) ?
			values.some(value => obj.includes(value)) :
			obj.includes(values);
	},
	api: async function (method, destination, payload) {
		method = method.toUpperCase();
		let query = '';
		if (method == 'GET') {
			query = '?',
				Object.keys(payload).forEach(key => {
					query += '&' + key + '=' + payload[key];
				});
		}
		const response = await fetch(destination + query, {
			method: method, // *GET, POST, PUT, DELETE, etc.
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			body: (method == 'GET' ? null : JSON.stringify(payload)) // body data type must match "Content-Type" header
		}).then(response => {
			if (response.ok) return response.json();
			else throw new Error('server error, response ' + response.status);
		});
		return response;
		/* use like 
			_.api.call(method, url, payload-object)
				.then(data => { do something with data })
				.catch((error) => { do something with error });
		*/
	},
	insertChars: function (characters, input) { // fills or deletes text on cursor position (textareas or inputs) 
		let el = document.getElementById(input)
		oldCPos = el.selectionStart;
		if (characters == '\b') { // backspace to delete
			el.value = el.value.substring(0, el.selectionStart - 1) + el.value.substring(el.selectionStart, el.value.length);
			el.selectionStart = el.selectionEnd = oldCPos - 1;
		} else {
			el.value = el.value.substring(0, el.selectionStart) + characters + el.value.substring(el.selectionStart, el.value.length);
			el.selectionStart = el.selectionEnd = oldCPos + characters.length;
		}
		el.focus();
	},
	dragNdrop: {
		// add following to draggable elements:
		// draggable="true" ondragstart="dragndrop.drag(event)" ondragover="dragndrop.allowDrop(event)" ondrop="dragndrop.drop(event,this)"
		// or call following method passing the object itself (not just the id)
		add2DragCollection: function (element) {
			element.setAttribute('draggable', 'true');
			element.setAttribute('ondragstart', '_.dragndrop.drag(event)');
			element.setAttribute('ondragover', '_.dragndrop.allowDrop(event)');
			element.setAttribute('ondrop', '_.dragndrop.drop(event,this)');
		},
		allowDrop: function (evnt) {
			evnt.preventDefault();
		},
		drag: function (evnt) {
			evnt.dataTransfer.setData("text", evnt.currentTarget.id)
		},
		drop: function (evnt, that) {
			evnt.preventDefault();
			var data = evnt.dataTransfer.getData("text");
			document.getElementById(data).parentNode.insertBefore(document.getElementById(data), that);
		}
	}
}