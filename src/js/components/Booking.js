import{ select, templates} from '../settings.js';
import{ utils } from '../Utils.js';
import AmountWidget from './AmountWidget.js';

class Booking{
  constructor(bookingWidget){
    const thisBooking = this;
    console.log(thisBooking);
    thisBooking.render(bookingWidget);
    thisBooking.initWidgets();
  }

  render(bookingWidget){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    console.log('generatedhtml', generatedHTML);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingWidget;
    console.log(thisBooking.dom.wrapper);
    thisBooking.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
    
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;