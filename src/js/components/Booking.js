import {select, templates, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(bookingWidget){

    const thisBooking = this;

    thisBooking.render(bookingWidget);
    thisBooking.initWidget();
    thisBooking.getData();
    thisBooking.reservation();
  }

  reservation(){
    const thisBooking = this;
    const timeReserv = thisBooking.hourPicker.correctValue + thisBooking.duration;
    for (let selectTable of thisBooking.dom.tables){
   
      selectTable.addEventListener('click', function(){
        if (selectTable.classList.contains('booked') == false) {
          console.log (' można zająć');
          selectTable.classList.toggle('booked');
          thisBooking.tableId = selectTable.getAttribute(settings.booking.tableIdAttribute);
        }
        else {
          alert('przykro nam, ten stolik jest zarezerwowany od godziny '+ thisBooking.hour + 'do ' + timeReserv  );
        }
      });
    }
  }
  sendReserv(){
    const thisBooking = this;
    console.log(thisBooking);

    const url = settings.db.url + '/' + settings.db.booking;
    const payload = {
      
      date: thisBooking.date,
      hour: thisBooking.hourPicker.correctValue,
      table: parseInt(thisBooking.tableId),
      repeat: false,
      duration: thisBooking.hoursAmount.correctValue,
      ppl: thisBooking.peopleAmount.correctValue,
      phone: thisBooking.dom.phoneNum.value,
      address: thisBooking.dom.address.value,
      starters: [],
    };
    console.log('zamówionko:', payload);

    for (let selStarter of thisBooking.dom.starters) {
      if (selStarter.checked == true) {
        payload.starters.push(selStarter.value);
      }
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
        // eslint-disable-next-line no-unused-vars
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);
        thisBooking.makeBooked(parsedResponse.date, payload.hour, payload.duration, payload.table);
      });
  }

  

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' +
                           utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' +
                          utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };
 
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponses = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponses.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
  
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){

    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
  
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.parseValue(thisBooking.datePicker.value);
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
      &&
      thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }
  parseValue(){
    const thisBooking = this;
    const dateObj = new Date(thisBooking.datePicker.value);
    dateObj.setDate(dateObj.getDate());

    return utils.dateToStr(dateObj);
  }

  render(bookingWidget){

    const thisBooking = this;

    const generateHTML = templates.bookingWidget();

    thisBooking.dom = {};
    
    thisBooking.dom.wrapper = bookingWidget;
    thisBooking.dom.wrapper = utils.createDOMFromHTML(generateHTML);
    bookingWidget.appendChild(thisBooking.dom.wrapper);


    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.people = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.phoneNum = thisBooking.dom.wrapper.querySelector(select.booking.phoneNum);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.send = thisBooking.dom.wrapper.querySelector(select.booking.send);
  }
  initWidget(){

    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
    console.log(thisBooking);
    thisBooking.dom.send.addEventListener('click', function(){
      event.preventDefault();
      thisBooking.sendReserv();
      alert ('dziękujemy za złożenie rezerwacji' );
    });
  }
  
}

export default Booking;