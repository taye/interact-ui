/*
 * Copyright (c) 2012 Taye Adeyemi
 * Open source under the MIT License.
 * https://raw.github.com/taye/interact-ui/master/LICENSE
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
		}());

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
			}
			else if (elements[i].getAttribute('i-toggle') === 'true') {
				newTool = new Toggle(elements[i]);
			}
			else if (elements[i].getAttribute('i-color-picker') === 'true') {
				newTool = new ColorPicker(elements[i]);
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

	function Slider (element, options) {
		if (!element) {
			element = make('div');
			element.setAttribute('i-slider', 'true');
		}
		element.setAttribute('i-slider', 'true');

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
			this.readonly = (options.readonly == true);

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
			this.setReadonly(this.readonly);

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
					readonlyAttribute = slider.element.getAttribute('readonly') !== null; 

				if (readonlyAttribute !== slider.readonly) {
					slider.setReadonly(readonlyAttribute);
				}
				else if (slider.element.readonly !== slider.readonly) {
					slider.setReadonly(slider.element.readonly === true);
				}

				if (!slider.readonly && slider.element.getAttribute('disabled') === null) {
					return 'drag';
				}
			},
        checkOnHover: false
	};

	Slider.handleSize = 20;

	Slider.prototype = {
		set: function (newValue) {
			var range = this.max - this.min,
				length = this.length,// - Slider.handleSize,
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
                this.handle.setAttribute('value', this.value);

				changeEvent.initEvent('change', true, true);
				this.element.dispatchEvent(changeEvent);
			}
		},
        setReadonly: setReadonly
	};

	function Toggle (element, options) {
		if (!element) {
			element = make('div');
			element.setAttribute('i-toggle', 'true');
		}
		element.setAttribute('i-toggle', 'true');

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
					readonlyAttribute = toggle.element.getAttribute('readonly') !== null;

				if (readonlyAttribute !== toggle.readonly) {
					toggle.setReadonly(readonlyAttribute);
				}
				else if (toggle.element.readonly !== toggle.readonly) {
					toggle.setReadonly(toggle.element.readonly);
				}

				if (!toggle.readonly && toggle.element.getAttribute('disabled') === null) {
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
                this.handle.setAttribute('value', this.value);

				changeEvent.initEvent('change', true, true);
				this.element.dispatchEvent(changeEvent);
			}
		},
        setReadonly: setReadonly
	};

	function ColorPicker (element, options) {
		options = options || getAttributeOptions (element);

		var redElement = make('div'),
			greenElement = make('div'),
			blueElement = make('div');

		redElement.classList.add('red');
		greenElement.classList.add('green');
		blueElement.classList.add('blue');

		this.element = element;
		this.red = new Slider (redElement, ColorPicker.rgbSliderOptions);
		this.green = new Slider (greenElement, ColorPicker.rgbSliderOptions);
		this.blue = new Slider (blueElement, ColorPicker.rgbSliderOptions);
		this.display = make('div');
		this.display.classList.add('display');
		this.display.style.width = '100px';
		this.display.style.height = '100px';

		events.add(element, 'change', colorChange);

		element.appendChild(this.display);
		element.appendChild(redElement);
		element.appendChild(greenElement);
		element.appendChild(blueElement);

		colorPickers.push(this);
	}
	
	function colorChange (event) {
		var picker = getColorPicker(this),
			rgb;

		rgb = [
				'rgb(',
				picker.red.value, ',',
				picker.green.value, ',',
				picker.blue.value,
				')'
			].join(' ');

		if (picker.value !== rgb) {
			picker.value = rgb;
			picker.display.style.backgroundColor = picker.value;
		}
	}

	ColorPicker.rgbSliderOptions = {
		max: 255,
		step: 1,
		value: 125,
		width: 100
	}

	function getColorPicker (element) {
		for (var i = 0; i < colorPickers.length; i++) {
			if (colorPickers[i].element === element) {
				return colorPickers[i];
			}
		}
		return -1;
	}

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

			length = slider.length,// - Slider.handleSize,
			position = (horizontal)?
                event.detail.pageX - slider.container.offsetLeft:
                event.detail.pageY - slider.container.offsetTop,
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

	interact.ui = {
		Slider: Slider,
		Toggle: Toggle,
		ColorPicker: ColorPicker,

		make: make,
		makeNs: makeNs
	}
}(window));


