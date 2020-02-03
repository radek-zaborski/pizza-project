import BaseWidget from './BaseWidget.js';

import {select, settings} from '../settings.js';
import utils from '../Utils.js';

/* global rangeSlider */

class HourPicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
   
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
    
  }
  initPlugin(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
    rangeSlider.create(thisWidget.dom.input);
  } 
  parseValue(value){
    return utils.numberToHour(value);
  }
  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}
export default HourPicker;