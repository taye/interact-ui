/*
 * Copyright (c) 2012 Taye Adeyemi
 * This file is part of interact-ui - https://github.com/taye/interact-ui
 * 
 * interact-ui is open source under the MIT License.
 * https://raw.github.com/taye/interact-ui/master/LICENSE
 */

 (function (interact) {
    'use script';
    
    function Slider (element, options) {
        // ensure that "new" is used
        if (this === interact) {
            return new Slider(element, options);
        }

        element.setAttribute('ui-slider', 'true');

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
            this.readonly = options.readonly;

            if (element instanceof HTMLElement) {
                this.element = element;
                this.container = make('div');
                this.bar = make('div');
                this.handle = make('div');

                if (this.orientation === 'vertical') {
                    this.element.classList.add('ui-vertical');
                }
                else {
                    this.element.classList.add('ui-horizontal');
                }
            }
            else if (element instanceof SVGElement) {
                this.element = element;
                this.container = make('g');
                this.background = make('rect');
                this.bar = make('rect');
                this.handle = make('rect');

                this.background.classList.add('ui-background');
                this.container.appendChild(this.background);
            }

            this.set(this.value);
            this.setReadonly(this.readonly);

            this.element.classList.add('ui-slider');
            this.container.classList.add('ui-container');
            this.bar.classList.add('ui-bar');
            this.handle.classList.add('ui-handle');

            this.container.appendChild(this.bar);
            this.container.appendChild(this.handle);
            this.element.appendChild(this.container);

            this.interactable = interact.set(this.handle, Slider.interactOptions);
            events.add(this.element, 'interactdragmove', sliderDragMove);
            
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
                position = (newValue - this.min) * 100 / range;

            if (this.orientation === 'horizontal') {
                this.handle.style.left = position + '%';
            }
            else {
                this.handle.style.top = position + '%';
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
        length: function () {
            return (this.orientation === 'horizontal')
                ? this.container.offsetWidth
                : this.container.offsetHeight;
        },
        setReadonly: setReadonly
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

    function sliderBarDrag (event) {
       getSliderFromBar(event.target)
           .interactable.simulate('drag');
    }

    function sliderDragMove (event) {
        var handle = event.target,
            slider = getSliderFromHandle(handle),
            horizontal = (slider.orientation === 'horizontal'),

            length = slider.length(),
            offsetXY = pageOffset(slider.container),
            position = (horizontal)
                ? event.detail.pageX - offsetXY.x
                : event.detail.pageY - offsetXY.y,
            range = slider.max - slider.min,

            // scale the cursor position according to slider range and dimensions
            value = position * range / length + slider.min,
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

        event.stopPropagation();
    }
    
    interact.ui.addTool({
            constructor: Slider,
            constructorName: 'Slider',
            typeSingular: 'slider',
            typePlural: 'sliders'
        });
    
}(interact));

