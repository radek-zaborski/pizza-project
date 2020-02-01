/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };


  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
    }

    initOrderForm(){
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;
      /* Create object with selected form elements*/
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData:', formData);
      
      const allParamsProduct = thisProduct.data.params;
      /* set variable price to equal thisProduct.data.price */
      let priceProduct = thisProduct.data.price;
      /* START LOOP: for each paramId in thisProduct.data.params */
      for (let paramId in allParamsProduct){
      /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
        /* START LOOP: for each optionId in param.options */
        for( let optionId in param.options){
        /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          //   console.log(option)
          /* START IF: if option is selected and option is not default */
          const selectOption = formData.hasOwnProperty(paramId) && formData[paramId].includes(optionId);
          //  console.log(selectOption)
          /* add price of option to variable price */
          if (selectOption && !option.default) {
            priceProduct += option.price;
          //  console.log('cena produktu', priceProduct);
          }
          else if (!selectOption && option.default){
            priceProduct -= option.price;
          }
          /* END IF: if option is selected and option is not default */
         
          /* START ELSE IF: if option is not selected and option is default */
          /* deduct price of option from price */
      
          /* END ELSE IF: if option is not selected and option is default */
    
        /* END LOOP: for each optionId in param.options */
        }
      
      /* END LOOP: for each paramId in thisProduct.data.params */
      }
      thisProduct.priceElem.innerHTML = priceProduct;
      console.log(thisProduct.priceElem)
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      
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
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }
    initAccordion(){
      const thisProduct = this;

      const clickTrigger = thisProduct.element;
      thisProduct.accordionTrigger.addEventListener('click', function(event){
        event.preventDefault();
        clickTrigger.classList.toggle('active');
        const activeProducts = document.querySelectorAll('.active');
        for(let activeProduct of activeProducts){
          if (activeProduct !== clickTrigger){
            activeProduct.classList.remove('active');
          }
        }
      });
    }
  }
  
  
  const app = {
    
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);
      
      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function() {
      const thisApp = this;   
    
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };


  app.init();
}