/*
 * Copyright (c) 2012 Taye Adeyemi
 * This file is part of interact-ui - https://github.com/taye/interact-ui
 * 
 * interact-ui is open source under the MIT License.
 * https://raw.github.com/taye/interact-ui/master/LICENSE
 */

 (function (interact) {
    'use script';

     function Float (element, options) {
         // ensure that "new" is used
         if (this === interact) {
             return new Float(element, options);
         }

        element.setAttribute('i-float', 'true');

        if (element instanceof Element) {
            options = options || getAttributeOptions(element);

            this.readonly = (options.readonly !== null && options.readonly !== false);

            if (element instanceof HTMLElement) {
                this.element = element;
                this.container = make('div');
                this.handle = make('div');
                this.content = make('div');
            }
            else if (element instanceof SVGElement) {
            }
            else return;

            this.setReadonly(this.readonly);
            //events.add(this.element, 'click', floatClick);

            this.element.classList.add('i-float');
            this.container.classList.add('i-container');
            this.content.classList.add('i-content');
            this.handle.classList.add('i-handle');

            this.container.appendChild(this.handle);
            this.container.appendChild(this.content);
            this.element.appendChild(this.container);

            interact.set(this.handle, Float.handleInteractOptions);
            interact.set(this.container, Float.containerInteractOptions);
            events.add(this.handle, 'interactdragmove', floatDragMove);
            
            floats.push(this);
        }
    }

    Float.handleInteractOptions = {
        drag: true,
        autoScroll: true,
        actionChecker: function (event) {
                event.preventDefault();
                /*
                 * If either the readonly attribute or property of the element
                 * was changed, make the float readonly or not accordingly
                 */
                var float = getFloatFromHandle(event.target),
                    readonlyAttribute = float.element.getAttribute('readonly') !== null;

                if (readonlyAttribute !== float.readonly) {
                    float.setReadonly(readonlyAttribute);
                }
                else if (float.element.readonly !== float.readonly) {
                    float.setReadonly(float.element.readonly);
                }

                if (!float.readonly && float.element.getAttribute('disabled') === null) {
                    return 'drag';
                }
            },
    };

    Float.containerInteractOptions = {
        resize: true,
        checkOnHover: true
    };

    Float.prototype = {
        setReadonly: setReadonly,
        position: function (x, y) {
            if (typeof x !== 'number' || typeof y !== 'number') {
                return pageOffset(this.element);
            }
            this.element.style.left = x + 'px';
            this.element.style.top = y + 'px';
        }
    };

    function floatDragMove (event) {
        var handle = event.target,
            float = getFloatFromHandle(handle),
            position = float.position();

        position.x += event.detail.dx;
        position.y += event.detail.dy;

        float.position(position.x, position.y);

        event.stopPropagation();
    }
     
    function getFloatFromElement (element) {
        var i;
        
        for (i = 0; i < floats.length; i++) {
            if (floats[i].element === element) {
                return floats[i];
            }
        }
        return null;
    }

    function getFloatFromHandle (element) {
        var i;
        
        for (i = 0; i < floats.length; i++) {
            if (floats[i].handle === element) {
                return floats[i];
            }
        }
        return null;
    }

   interact.Float = Float;
    
}(interact));

 
