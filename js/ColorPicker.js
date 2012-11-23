/*
 * Copyright (c) 2012 Taye Adeyemi
 * This file is part of interact-ui - https://github.com/taye/interact-ui
 * 
 * interact-ui is open source under the MIT License.
 * https://raw.github.com/taye/interact-ui/master/LICENSE
 */

 (function (interact) {
    'use script';

    var Slider = interact.Slider;

     function ColorPicker (element, options) {
         // ensure that "new" is used
         if (this === interact) {
             return new ColorPicker(element, options);
         }
         
        options = options || getAttributeOptions(element);
        this.readonly = options.readonly;

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
         
        this.setReadonly(this.readonly);
        events.add(element, 'change', colorChange);

        element.appendChild(this.display);
        element.appendChild(redElement);
        element.appendChild(greenElement);
        element.appendChild(blueElement);

        colorPickers.push(this);
    }
    
    ColorPicker.prototype = {
        setReadonly: function (newValue){
            if (newValue === true) {
                this.readonly = true;
                this.element.readonly = true;
                this.element.setAttribute('readonly', 'readonly');
            }
            else if (newValue === false) {
                this.readonly = false;
                this.element.readonly = false;
                this.element.removeAttribute('readonly');
            }
            
            this.red.setReadonly(this.readonly);
            this.green.setReadonly(this.readonly);
            this.blue.setReadonly(this.readonly);
        }
    };
    
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
        event.stopPropagation();
    }

    ColorPicker.rgbSliderOptions = {
        max: 255,
        step: 1,
        value: 125,
        width: 100
    };

    function getColorPicker (element) {
        for (var i = 0; i < colorPickers.length; i++) {
            if (colorPickers[i].element === element) {
                return colorPickers[i];
            }
        }
        return -1;
    }
    
    interact.ColorPicker = ColorPicker;
    
}(interact));

