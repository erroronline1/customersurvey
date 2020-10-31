// personal usecase framework by error on line 1 (erroronline.one)
// this is not underscore.js!

Array.prototype.contains = values => {
	return _.contains(this, values);
} // to use intitive with arrays
String.prototype.contains = values => {
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
	ajax: { // use like _.ajax.request('GET'||'POST', 'ajax.php', {object});
		xhr: new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP"),
		request: function (method, destination, payload) {
			method = method.toUpperCase();
			let query = '',
				response = false;
			if (method == 'GET') {
				Object.keys(payload).forEach((key, value) => {
					query += '&' + key + '=' + value;
				});
			}
			if ([0, 4].contains(this.xhr.readyState)) {
				this.xhr.open(method, destination + '?cache=' + Math.round(Math.random() * 100000 + 1) + query, true);
				this.xhr.setRequestHeader('Content-type', method == 'GET' ? 'application/x-www-form-urlencoded' : 'application/json');
				this.xhr.onreadystatechange = function () {
					response = ajax.xhr.readyState == 4 && ajax.xhr.status == 200 ? ajax.xhr.responseText : false;
				};
				this.xhr.send(method == 'GET' ? null : JSON.stringify(payload));
			}
			return response;
		},
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