/*
 * Copyright (c) 2012 Taye Adeyemi
 * Open source under the MIT License.
 * https://raw.github.com/taye/interact-tools/master/LICENSE
 */


(function (window) {
	'use strict';

	var interact = window.interact,
		document = window.document,
		console = window.console,
		Elemeny = window.Element,
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
		events = {
			add: function (target, type, listener, useCapture) {
				if (target.events === undefined) {
					target.events = [];
				}
				if (target.events[type] === undefined) {
					target.events[type] = [];
				}

				target.addEventListener(type, listener, useCapture || false);
				target.events[type].push(listener);

				return listener;
			},
			remove: function (target, type, listener, useCapture) {
				var i;

				if (!(target && target.events)) {
					if (type === 'all') {
						for (i = 0; i < target.events.length; i++) {
							events.remove(target, target.events[i]);
						}
					} else if (target.events[type].length) {
						if (!listener) {
							for (i = 0; i<target.events[type].length; i++) {
								target.removeEventListener(type, target.events[type][i], useCapture || false);
								target.events[type].splice(i, 1);
							}
						} else {
							for (i = 0; i<target.events[type].length; i++) {
								if (target.events[type][i] === listener) {
									target.removeEventListener(type, listener, useCapture || false);
									target.events[type].splice(i, 1);
								}
							}
						}
					}
				}
			}
		};
		
	function make (nodeName) {
		return document.createElement(nodeName);
	}

	function makeNs (nodeName) {
		return document.createElementNS(svgNs, nodeName);
	}

	function init () {
		var elements = document.body.querySelectorAll('*'),
			i = 0;

		for (i = 0; i < elements.length; i++) {
			var newTool;

			if (elements[i].getAttribute('i-slider') === 'true') {
				newTool = new Slider(elements[i]);
				sliders.push(newTool);
			}
			else if (elements[i].getAttribute('i-toggle') === 'true') {
				newTool = new Toggle(elements[i]);
				toggles.push(newTool);
			}
			
			if (newTool) {
				var onchangeAttribute = newTool.element.getAttribute('onchange');
				if (onchangeAttribute && !newTool.element.onchange) {
					newTool.element.onchange = Function(onchangeAttribute);
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

	function Slider (element, options) {
		if (element instanceof Element) {	
			options = options || getAttributeOptions(element);

			this.step = Number(options.step) || 10;
			this.min = Number(options.min) || 0;
			this.max = Number(options.max) || this.min + 10 * this.step;
			this.value = Number(options.value) || 0;
			this.value = (this.value < this.min)?
				this.value = this.min: (this.value > this.max)?
					this.max: this.value;
			this.orientation = (options.orientation == 'vertical' || options.orientation === 'horizontal')?
					options.orientation: 'horizontal';
			this.length = Number(options.length) || 200;
			this.readonly = (options.readonly === 'true');

			if (element instanceof HTMLElement) {
				this.element = element;
				this.container = make('div')
				this.bar = make('div');
				this.handle = make('div');

                if (this.orientation === 'vertical') {
                    this.element.style.height = this.length + 'px';
                    this.element.classList.add('i-vertical');
                }
                else {
                    this.element.style.width = this.length + 'px';
                    this.element.classList.add('i-horizontal');
                }
			}
			else if (element instanceof SVGElement) {
				this.element = element;
				this.container = make('g')
				this.background = make('rect');
				this.bar = make('rect');
				this.handle = make('rect');

				this.background.classList.add('i-background');
				this.container.appendChild(this.background);
			}

			this.set(this.value);
			this.element.readonly = this.readonly;

			this.element.classList.add('i-slider');
			this.container.classList.add('i-container');
			this.bar.classList.add('i-bar');
			this.handle.classList.add('i-handle');

			this.container.appendChild(this.bar);
			this.container.appendChild(this.handle);
			this.element.appendChild(this.container);

			this.interactable = interact.set(this.handle, Slider.interactOptions);
			
			sliders.push(this);
		}
	}

	Slider.interactOptions = {
		drag: true,
		autoScroll: false,
		actionChecker: function (event) {
				event.preventDefault();
				/*
				 * If either the readonly attribute or property of the element
				 * was changed, make the slider readonly or not accordingly
				 */
				var slider = getSliderFromHandle(event.target),
					readonlyAttribute = slider.element.getAttribute('readonly') === 'true';

				if (readonlyAttribute !== slider.readonly) {
					slider.readonly = slider.element.readonly = readonlyAttribute;
				}
				else if (slider.element.readonly !== slider.readonly) {
					slider.readonly =
						slider.element.readonly =
							(slider.element.readonly === true);
					slider.element.setAttribute('readonly', slider.readonly);
				}

				if (!slider.readonly) {
					return 'drag';
				}
			},
        checkOnHover: false
	};

	Slider.handleSize = 20;

	Slider.prototype = {
		set: function (newValue) {
			var range = this.max - this.min,
				length = this.length - Slider.handleSize,
				position = (newValue - this.min) * length / range;

			if (this.orientation === 'horizontal') {
				this.handle.style.left = position + 'px';
			}
			else {
				this.handle.style.top = position + 'px';
			}

			if (newValue !== this.value) {
				var changeEvent = document.createEvent('Event');

				this.element.value = this.value = newValue;
				this.element.setAttribute('value', this.value);

				changeEvent.initEvent('change', true, true);
				this.element.dispatchEvent(changeEvent);
			}
		}
	};

	function Toggle (element, options) {
		if (element instanceof Element) {
			options = options || getAttributeOptions(element);

			this.value = (options.value == true)? 1: 0;
			this.orientation = (options.orientation == 'vertical' || options.orientation === 'horizontal')?
					options.orientation: 'horizontal';
			this.length = Number(options.length) || 80;
			this.handleRatio = options['handle-ratio'] || Toggle.handleRatio;

			if (element instanceof HTMLElement) {
				this.element = element;
				this.container = make('div')
				this.bar = make('div');
				this.handle = make('div');

                if (this.orientation === 'vertical') {
                    this.element.style.height = this.length + 'px';
                    this.element.classList.add('i-vertical');
					this.handle.style.height= this.length * this.handleRatio + 'px';
                }
                else {
                    this.element.style.width = this.length + 'px';
                    this.element.classList.add('i-horizontal');
					this.handle.style.width = this.length * this.handleRatio + 'px';
                }
			}
			else if (element instanceof SVGElement) {
				this.element = element;
				this.container = make('g')
				this.bar = make('rect');
				this.handle = make('rect');

				this.container.appendChild(this.background);
			}

			this.set(this.value);
			events.add(this.element, 'click', toggleClick);

			this.element.classList.add('i-toggle');
			this.container.classList.add('i-container');
			this.bar.classList.add('i-bar');
			this.handle.classList.add('i-handle');

			this.container.appendChild(this.bar);
			this.container.appendChild(this.handle);
			this.element.appendChild(this.container);

			this.interactable = interact.set(this.handle, Toggle.interactOptions);
			
			toggles.push(this);
		}
	}

	Toggle.interactOptions = {
		drag: true,
		autoScroll: false,
		actionChecker: function (event) {
				event.preventDefault();
				/*
				 * If either the readonly attribute or property of the element
				 * was changed, make the toggle readonly or not accordingly
				 */
				var toggle = getToggleFromHandle(event.target),
					readonlyAttribute = toggle.element.getAttribute('readonly') === 'true';

				if (readonlyAttribute !== toggle.readonly) {
					toggle.readonly = toggle.element.readonly = readonlyAttribute;
				}
				else if (toggle.element.readonly !== toggle.readonly) {
					toggle.readonly =
						toggle.element.readonly =
							(toggle.element.readonly === true);
					toggle.element.setAttribute('readonly', toggle.readonly);
				}

				if (!toggle.readonly) {
					return 'drag';
				}
			},
        checkOnHover: false
	};

	Toggle.handleRatio = 0.6;

	Toggle.prototype = {
		set: function (newValue) {
			newValue = (newValue == true)? 1: 0;

			if (this.orientation === 'horizontal') {
				if (newValue === 0) {
					this.handle.style.left = 0;
					this.handle.style.right = "";
				}
				else {
					this.handle.style.left = "";
					this.handle.style.right = -(this.length * (1 - this.handleRatio) - 6) + 'px';
				}
			}
			else {
				if (newValue === 0) {
					this.handle.style.top = 0;
					this.handle.style.bottom = "";
				}
				else {
					this.handle.style.top = "";
					this.handle.style.bottom = -(this.length * (1 - this.handleRatio) - 6) + 'px';
				}

			}
			if (newValue !== this.value) {
				var changeEvent = document.createEvent('Event');

				this.element.value = this.value = newValue;
				this.element.setAttribute('value', this.value);

				changeEvent.initEvent('change', true, true);
				this.element.dispatchEvent(changeEvent);
			}
		}
	};


	function getSliderFromHandle (element) {
		var i;

		for (i = 0; i < sliders.length; i++) {
			if (sliders[i].handle === element) {
				return sliders[i];
			}
		}
		return null;
	}

	function getSliderFromBar (element) {
		var i;

		for (i = 0; i < sliders.length; i++) {
			if (sliders[i].bar === element) {
				return sliders[i];
			}
		}
		return null;
	}

	function getToggleFromElement (element) {
		var i;

		for (i = 0; i < toggles.length; i++) {
			if (toggles[i].element === element) {
				return toggles[i];
			}
		}
		return null;
	}

	function getToggleFromHandle (element) {
		var i;

		for (i = 0; i < toggles.length; i++) {
			if (toggles[i].handle === element) {
				return toggles[i];
			}
		}
		return null;
	}

	function getToggleFromBar (element) {
		var i;

		for (i = 0; i < toggles.length; i++) {
			if (toggles[i].bar === element) {
				return toggles[i];
			}
		}
		return null;
	}

	function toolTypeMove (event) {
		if (event.target.parentNode.parentNode.getAttribute('i-slider') === 'true') {
			sliderDragMove(event);
		}
		else if (event.target.parentNode.parentNode.getAttribute('i-toggle') === 'true') {
			toggleDragMove(event);
		}
	}

	function sliderDragMove (event) {
		var handle = event.target,
			slider = getSliderFromHandle(handle),
            horizontal = (slider.orientation === 'horizontal'),

			top = slider.element.offsetTop,
			left = slider.element.offsetLeft,
			length = slider.length - Slider.handleSize,
			position = (horizontal)?
                event.detail.pageX - left:
                event.detail.pageY - top,
			range = slider.max - slider.min,

			// scale the cursor position according to slider range and dimensions
			value = position * range / slider.length + slider.min,
			offset = value % slider.step || 0,
			steps = Math.floor(value / slider.step);

		value = slider.step * steps;
		if (offset > slider.step / 2) {
			value += slider.step;
		}

		value = (value < slider.min)?
			slider.min: (value > slider.max)?
				slider.max: value;

		slider.set(value);
	}

	function toggleDragMove (event) {
		var handle = event.target,
			toggle = getToggleFromHandle(handle),
            horizontal = (toggle.orientation === 'horizontal'),

			top = toggle.element.offsetTop,
			left = toggle.element.offsetLeft,
			length = toggle.length,
			position = (horizontal)?
                event.detail.pageX - left:
                event.detail.pageY - top,
			value = (position < length * 0.3)?
				0: (position > length * 0.6)?
					1: toggle.value;

		toggle.set(value);
	}

	function toggleClick (event) {
		var toggle = getToggleFromElement(this);

		toggle.set(!toggle.value);
	}

    function sliderBarDrag (event) {
       getSliderFromBar(event.target)
           .interactable.simulate('drag');
    }

	events.add(document, 'interactdragmove', toolTypeMove);
	events.add(document, 'DOMContentLoaded', init);

	interact.tools = {
		Slider: Slider,
		Toggle: Toggle,

		make: make,
		makeNs: makeNs
	}
}(window));


