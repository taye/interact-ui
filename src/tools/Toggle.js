/*
 * Copyright (c) 2012 Taye Adeyemi
 * This file is part of interact-ui - https://github.com/taye/interact-ui
 * 
 * interact-ui is open source under the MIT License.
 * https://raw.github.com/taye/interact-ui/master/LICENSE
 */

 (function (interact) {
    'use script';

     function Toggle (element, options) {
         // ensure that "new" is used
         if (this === interact) {
             return new Toggle(element, options);
         }

        element.setAttribute('ui-toggle', 'true');

        if (element instanceof Element) {
            options = options || getAttributeOptions(element);

            this.value = Number(options.value)? 1: 0;
            this.orientation = (options.orientation == 'vertical' || options.orientation === 'horizontal')?
                    options.orientation: 'horizontal';
            this.length = Number(options.length) || 80;
            this.handleRatio = options['handle-ratio'] || Toggle.handleRatio;
            this.readonly = (options.readonly !== null && options.readonly !== false);

            if (element instanceof HTMLElement) {
                this.element = element;
                this.container = make('div');
                this.bar = make('div');
                this.handle = make('div');

                if (this.orientation === 'vertical') {
                    this.element.style.height = this.length + 'px';
                    this.element.classList.add('ui-vertical');
                    this.handle.style.height= this.length * this.handleRatio + 'px';
                }
                else {
                    this.element.style.width = this.length + 'px';
                    this.element.classList.add('ui-horizontal');
                    this.handle.style.width = this.length * this.handleRatio + 'px';
                }
            }
            else if (element instanceof SVGElement) {
                this.element = element;
                this.container = make('g');
                this.bar = make('rect');
                this.handle = make('rect');

                this.container.appendChild(this.background);
            }

            this.set(this.value);
            this.setReadonly(this.readonly);
            events.add(this.element, 'click', toggleClick);

            this.element.classList.add('ui-toggle');
            this.container.classList.add('ui-container');
            this.bar.classList.add('ui-bar');
            this.handle.classList.add('ui-handle');

            this.container.appendChild(this.bar);
            this.container.appendChild(this.handle);
            this.element.appendChild(this.container);

            this.interactable = interact.set(this.handle, Toggle.interactOptions);
            events.add(this.element, 'interactdragmove', toggleDragMove);
            
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
            newValue = Number(newValue)? 1: 0;

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

    function toggleDragMove (event) {
        var handle = event.target,
            toggle = getToggleFromHandle(handle),
            horizontal = (toggle.orientation === 'horizontal'),

            offsetXY = pageOffset(toggle.element),
            left = offsetXY.x,
            top = offsetXY.y,
            length = toggle.length,
            position = (horizontal)?
                event.detail.pageX - left:
                event.detail.pageY - top,
            value = (position < length * 0.3)?
                0: (position > length * 0.6)?
                    1: toggle.value;

        toggle.set(value);

        event.stopPropagation();
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

    function toggleClick (event) {
        var toggle = getToggleFromElement(this);

        toggle.set(!toggle.value);
    }
    
    interact.ui.addTool({
            constructor: Toggle,
            constructorName: 'Toggle',
            typeSingular: 'toggle',
            typePlural: 'toggles'
        });
    
}(interact));

 
