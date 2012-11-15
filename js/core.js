var interact = window.interact,
	document = window.document,
	console = window.console,
	Element = window.Element,
	HTMLElement = window.HTMLElement,
	SVGElement = window.SVGElement,
	svgNs = 'http://www.w3.org/2000/svg',
	optionAttributes = [
		'min',
		'max',
		'step',
		'length',
		'readonly',
		'orientation',
		'value',
		'list',
		'handle-ratio'
	],
	sliders = [],
	toggles = [],
	colorPickers = [],
	events = (function () {
		'use strict';

		var elements = [],
			targets = [];

		function add (element, type, listener, useCapture) {
			if (!(element instanceof window.Element) && element !== window.document) {
				return;
			}

			var target = targets[elements.indexOf(element)];

			if (!target) {
				target = {
					events: {}
				}
				target.events[type] = [];
				elements.push(element);
				targets.push(target);
			}
			if (typeof target.events[type] !== 'array') {
				target.events[type] = [];
			}
			target.events[type].push(listener);

			return element.addEventListener(type, listener, useCapture || false);
		}

		function remove (element, type, listener, useCapture) {
			var i,
				target = targets(elements.indexOf(element));

			if (index === -1) {
				return;
			}

			if (target && target.events && target.events[type]) {

				if (listener === 'all') {
					for (i = 0; i < target.events[type].length; i++) {
						element[removeEvent](type, target.events[type][i], useCapture || false);
						target.events[type].splice(i, 1);
					}
				} else {
					for (i = 0; i < target.events[type].length; i++) {
						if (target.events[type][i] === listener) {
							element[removeEvent](type, target.events[type][i], useCapture || false);
							target.events[type].splice(i, 1);
						}
					}
				}
			}
		}

		function removeAll (element) {
			var type,
				target = targets(elements.indexOf(element));

			for (type in target.events) {
				if (target.events.hasOwnProperty(type)) {
					events.remove(target, type, 'all');
				}
			}
		}

		return {
			add: add,
			remove: remove,
			removeAll: removeAll
		};
	}()),
	onDomReady = [];

function make (nodeName) {
	return document.createElement(nodeName);
}

function makeNs (nodeName) {
	return document.createElementNS(svgNs, nodeName);
}

function init (event) {
	var elements = document.body.querySelectorAll('*'),
		i = 0;

	for (i = 0; i < onDomReady.length; i++) {
		onDomReady[i](event);
	}
	for (i = 0; i < elements.length; i++) {
		var newTool;

		if (elements[i].getAttribute('i-slider') === 'true') {
			newTool = new interact.Slider(elements[i]);
		}
		else if (elements[i].getAttribute('i-toggle') === 'true') {
			newTool = new interact.Toggle(elements[i]);
		}
		else if (elements[i].getAttribute('i-color-picker') === 'true') {
			newTool = new interact.ColorPicker(elements[i]);
		}
		
		if (newTool) {
			var onchangeAttribute = newTool.element.getAttribute('onchange'),
				onchangeProperty;

			if (onchangeAttribute && !newTool.element.onchange) {
				try {
					onchangeProperty = Function(onchangeAttribute);
					newTool.element.onchange = onchangeProperty;
				}
				catch (error) {
					console.log(error);
				}
			}
		}
	}
}

function attributeGetter (element) {
	return 	function (attribute) {
			return element.getAttribute(attribute);
		};
}

function getAttributeOptions (element) {
	var options = {},
		get = attributeGetter(element),
		i;

	for (i = 0; i < optionAttributes.length; i++) {
		options[optionAttributes[i]] = get(optionAttributes[i]);
	}
	return options;
}

function setReadonly (newValue) {
	if (newValue == true) {
		this.readonly = true;
		this.element.readonly = true;
		this.element.setAttribute('readonly', 'readonly');
	}
	else if (newValue == false) {
		this.readonly = false;
		this.element.readonly = false;
		this.element.removeAttribute('readonly');
	}
}

events.add(document, 'DOMContentLoaded', init);

interact.ui = {
	make: make,
	makeNs: makeNs
};

