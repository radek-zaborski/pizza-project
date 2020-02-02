import {templates, select, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import {utils} from '../Utils.js';

class Product{                  
  constructor(id, data){         
    const thisProduct = this;    
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
      
  }
   
  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
  }
  renderInMenu(){
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML); 
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }
  getElements(){
    const thisProduct = this;
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    // console.log(thisProduct.imageWrapper);
  }
  initAccordion(){
    const thisProduct = this;

    const clickableTrigger = thisProduct.element;
    thisProduct.accordionTrigger.addEventListener('click', function(){
      event.preventDefault();
      clickableTrigger.classList.toggle('active');
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      for(let activProduct of activeProducts){
        if (activProduct != clickableTrigger){
          activProduct.classList.remove('active');
        }
      }
    });
  }
    
  initOrderForm(){
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function(){
      thisProduct.processOrder();
    });
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
         
        thisProduct.processOrder();
      });
    }
    thisProduct.cartButton.addEventListener('click', function(){
      thisProduct.processOrder();
      thisProduct.addToCart();

    });
  }
    
  processOrder() {

    const thisProduct = this;
    thisProduct.params = {}; 
    const formData = utils.serializeFormToObject(thisProduct.form);
               
    let price = thisProduct.data.price;
      
    for( let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];
        
      for (let valueOpt in param.options){
          
        const option = param.options[valueOpt];
        const optSelProd = formData.hasOwnProperty(paramId) && formData[paramId].includes(valueOpt);
        const images = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + valueOpt);
          
        if (optSelProd && images){
            
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},          
            };
          }
          thisProduct.params[paramId].options[valueOpt] = option.label;
                         
          images.classList.add(classNames.menuProduct.imageVisible);
        }
        else if(!optSelProd && images){
          images.classList.remove(classNames.menuProduct.imageVisible);
        }
        if (optSelProd && !option.default){
          price += option.price;         
        }
        else if ( !optSelProd && option.default) {
          price -= option.price;
        }
      }
    }
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    thisProduct.priceElem.innerHTML = thisProduct.price;

  }
  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    //  app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);

  }
}
export default Product;