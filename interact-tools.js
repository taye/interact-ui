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
		optionTypes = [
			'min',
			'max',
			'step',
			'length',
			'disabled',
			'layout'
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
			if (elements[i].getAttribute('i-slider') === 'true') {
				new Slider(elements[i]);
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

		for (i = 0; i < optionTypes.length; i++) {
			options[optionTypes[i]] = get(optionTypes[i]);
		}
		return options;
	}

	function Slider (element, options) {
		if (element instanceof Element) {	
			options = options || getAttributeOptions(element);

			this.step = Number(options.step) || 10;
			this.min = Number(options.min) || 0;
			this.max = Number(options.max) || this.min + 10 * this.step;
			this.layout = (options.layout == 'vertical' || options.layout === 'horizontal')?
					options.layout: 'horizontal';
			this.length = Number(options.length) || 200;

			if (element instanceof HTMLElement) {
				this.element = element;
				this.container = make('div')
				this.bar = make('div');
				this.handle = make('div');

                if (this.layout === 'vertical') {
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

			this.element.value = this.min;
			this.element.setAttribute('value', this.min);

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
				return 'drag';
			},
        checkOnHover: true
	};

	Slider.handleSize = 20;

	function Toggle (options) {
		if (options instanceof HTMLElement) {
		//	...
		}
		else if (options instanceof SVGElement) {

		}
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

	function sliderDragMove (event) {
		var handle = event.target,
			slider = getSliderFromHandle(handle),
            horizontal = (slider.layout === 'horizontal'),

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

		position = (value - slider.min)  * length / range;
        if (horizontal) {
            slider.handle.style.left = position + 'px';
        }
        else {
            slider.handle.style.top = position + 'px';
        }

		if (value !== slider.value) {
			var changeEvent = document.createEvent('Event');

			slider.element.value = slider.value = value;
			slider.element.setAttribute('value', value);

			changeEvent.initEvent('change', true, true);
			slider.element.dispatchEvent(changeEvent);
		}
	}

    function sliderBarDrag (event) {
       getSliderFromBar(event.target)
           .interactable.simulate('drag');
    }

	events.add(document, 'interactdragmove', sliderDragMove);
	events.add(document, 'DOMContentLoaded', init);

	interact.tools = {
		Slider: Slider,
		Toggle: Toggle,

		make: make
	}
}(window));


