(function (interact) {
	'use script';

 	var Slider = interact.Slider;
 	
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
        event.stopPropagation();
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
	
	interact.ColorPicker = ColorPicker;
	
}(interact));

