(function($,sr){
 
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;
 
      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null; 
          };
 
          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);
 
          timeout = setTimeout(delayed, threshold || 100); 
      };
  }
	// smartresize 
	jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
 
})(jQuery,'smartresize');


/*
 * jQuery FlexSlider v2.0 (Hacked Build)
 * Copyright 2012 WooThemes
 * By: Tyler Smith (@mbmufffin)
 */

;(function ($) {

  //FlexSlider: Object Instance
  $.flexslider = function(el, options) {
    var slider = $(el),
        vars = $.extend({}, $.flexslider.defaults, options),
        namespace = vars.namespace,
        touch = Modernizr.touch,
        eventType = (touch) ? 'touchend' : 'click',
        vertical = vars.direction === "vertical",
        reverse = vars.reverse,
        carousel = (vars.itemWidth > 0),
        fade = vars.animation === "fade",
        asNav = vars.asNavFor !== "",
        methods = {};

    $.data(el, "flexslider", slider);
    
    // private methods
    methods = {
      init: function() {
        slider.animating = false;
        slider.currentSlide = vars.startAt;
        slider.animatingTo = slider.currentSlide;
        slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
        slider.containerSelector = vars.selector.substr(0,vars.selector.search(' '));
        slider.slides = $(vars.selector, slider);
        slider.container = $(slider.containerSelector, slider);
        slider.count = slider.slides.length;
        // SLIDE:
        if (vars.animation === "slide") vars.animation = "swing";
        slider.prop = (vertical) ? "top" : "marginLeft";
        slider.args = {};
        // TOUCH/USECSS:
        slider.transitions = !vars.video && !fade && vars.useCSS && (function() {
          var obj = document.createElement('div'),
              props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
          for (var i in props) {
            if ( obj.style[ props[i] ] !== undefined ) {
              slider.pfx = props[i].replace('Perspective','').toLowerCase();
              slider.prop = "-" + slider.pfx + "-transform";
              return true;
            }
          }
          return false;
        }());
        
        slider.doMath();
        slider.setup("init");
        
        // DIRECTIONNAV:
        if (vars.directionNav) methods.directionNav.setup();
        
        // TOUCH
        if (touch && vars.touch) methods.touch();
        
        // KEYBOARD:
        $(document).bind('keyup', function(event) {
          var keycode = event.keyCode;
          if (!slider.animating && (keycode === 39 || keycode === 37) && slider.closest('article').hasClass('focused')) {
            var target = (keycode === 39) ? slider.getTarget('next') :
                         (keycode === 37) ? slider.getTarget('prev') : false;
            slider.flexAnimate(target, vars.pauseOnAction);
          }
        });
        
        // FADE&&SMOOTHHEIGHT || SLIDE:
        if (!fade) methods.resize();
        
        // API: start() Callback
        setTimeout(function(){
          vars.start(slider);
        }, 200);
      },
      directionNav: {
        setup: function() {
          var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li><a class="' + namespace + 'prev" href="#"></a></li><li><a class="' + namespace + 'next" href="#"></a></li></ul>'),
              $sibling = slider.siblings('.description');
        
          $sibling.append(directionNavScaffold);
          slider.directionNav = $('.' + namespace + 'direction-nav li a', $sibling);
        
          methods.directionNav.update();
        
          slider.directionNav.bind(eventType, function(event) {
            event.preventDefault();
            var target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
            slider.flexAnimate(target, vars.pauseOnAction);
          });
          // Prevent iOS click event bug
          if (touch) {
            slider.directionNav.bind("click ontouchstart", function(event) {
              event.preventDefault();
            });
          }
        },
        update: function() {
          if (!vars.animationLoop) {
            if (slider.animatingTo === 0) {
              slider.directionNav.removeClass('disabled').filter('.' + namespace + "prev").addClass('disabled');
            } else if (slider.animatingTo === slider.last) {
              slider.directionNav.removeClass('disabled').filter('.' + namespace + "next").addClass('disabled');
            } else {
              slider.directionNav.removeClass('disabled');
            }
          }
        }
      },
      touch: function() {
        var startX,
          startY,
          offset,
          cwidth,
          dx,
          startT,
          scrolling = false;
              
        el.addEventListener('touchstart', onTouchStart, false);
        function onTouchStart(e) {
          if (slider.animating) {
            e.preventDefault();
          } else if (e.touches.length === 1) {
            // CAROUSEL: 
            cwidth = (vertical) ? slider.h : slider. w;
            startT = Number(new Date());
            // CAROUSEL:
            offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                     (carousel && reverse) ? slider.limit - (((slider.itemW + vars.itemMargin) * slider.move) * slider.animatingTo) :
                     (carousel && slider.currentSlide === slider.last) ? slider.limit :
                     (carousel && vars.itemWidth > slider.w) ? ((slider.itemW + (vars.itemMargin * 2)) * slider.move) * slider.currentSlide :
                     (carousel) ? ((slider.itemW + vars.itemMargin) * slider.move) * slider.currentSlide : 
                     (reverse) ? (slider.last - slider.currentSlide) * cwidth : (slider.currentSlide) * cwidth;
            startX = (vertical) ? e.touches[0].pageY : e.touches[0].pageX;
            startY = (vertical) ? e.touches[0].pageX : e.touches[0].pageY;

            el.addEventListener('touchmove', onTouchMove, false);
            el.addEventListener('touchend', onTouchEnd, false);
          }
        }

        function onTouchMove(e) {
          dx = (vertical) ? startX - e.touches[0].pageY : startX - e.touches[0].pageX;
          scrolling = (vertical) ? (Math.abs(dx) < Math.abs(e.touches[0].pageX - startY)) : (Math.abs(dx) < Math.abs(e.touches[0].pageY - startY));
          
          if (!scrolling || Number(new Date()) - startT > 500) {
            e.preventDefault();
            if (!fade && slider.transitions) {
              if (!vars.animationLoop) {
                dx = dx/((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx)/cwidth+2) : 1);
              }
              slider.setProps(offset + dx, "setTouch");
            }
          }
        }
        
        function onTouchEnd(e) {
          if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
            var updateDx = (reverse) ? -dx : dx,
                target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');
            
            if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 20 || Math.abs(updateDx) > cwidth/2)) {
              slider.flexAnimate(target, vars.pauseOnAction);
            } else {
              slider.flexAnimate(slider.currentSlide, vars.pauseOnAction, true);
            }
          }
          // finish the touch by undoing the touch session
          el.removeEventListener('touchmove', onTouchMove, false);
          el.removeEventListener('touchend', onTouchEnd, false);
          startX = null;
          startY = null;
          dx = null;
          offset = null;
        }
      },
      resize: function() {
        $(window).smartresize(function(){
          if (!slider.animating && slider.is(':visible')) {
            slider.slides.width(slider.computedW);
            slider.update(slider.pagingCount);
            slider.setProps();
          }
        });
      }
    }
    
    // public methods
    slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
      if (!slider.animating && (slider.canAdvance(target) || override) && slider.is(":visible")) {
        
        slider.animating = true;
        slider.animatingTo = target;
        // API: before() animation Callback
        vars.before(slider);
        
        // INFINITE LOOP:
        slider.atEnd = target === 0 || target === slider.last;
        
        methods.directionNav.update();
        
        // SLIDE:
        var margin = (vars.itemWidth > slider.w) ? vars.itemMargin * 2 : vars.itemMargin,
            slideString, calcNext;

        calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
        slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
        slider.setProps(slideString, "", vars.animationSpeed);
        
        if (slider.transitions) {
            slider.animating = false;
            slider.currentSlide = slider.animatingTo;
/*
            slider.container.one("webkitTransitionEnd transitionend", function(){
              slider.wrapup();
            });
*/
        } else {
          slider.container.animate(slider.args, vars.animationSpeed, vars.easing, function(){
            slider.wrapup();
          });
        }
      }
    } 
    slider.wrapup = function() {
      slider.animating = false;
      slider.currentSlide = slider.animatingTo;
      // API: after() animation Callback
      vars.after(slider);
    }

    slider.canAdvance = function(target) {
      var last = slider.last;
      return (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
             (target === slider.currentSlide && !asNav) ? false :
             (vars.animationLoop) ? true :
             (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
             (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
             true;
    }
    slider.getTarget = function(dir) {
      slider.direction = dir; 
      if (dir === "next") {
        return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
      } else {
        return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
      }
    }
    
    // SLIDE:
    slider.setProps = function(pos, special, dur) {
      var posCheck = (pos) ? pos : ((slider.itemW + vars.itemMargin) * slider.move) * slider.animatingTo,
          target = (function(){
        return (special === "setTouch") ? pos :
               (slider.animatingTo === slider.last) ? slider.limit : posCheck;
      }());
      target = (target * -1) + "px";

      if (slider.transitions) {
        target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + target + ",0,0)";
        dur = (dur !== undefined) ? (dur/1000) + "s" : "0s";
        slider.container.css("-" + slider.pfx + "-transition-duration", dur);
      }
      
      slider.args[slider.prop] = target;
      if (slider.transitions || dur === undefined) slider.container.css(slider.args);
    }
    
    slider.setup = function(type) {
      if (type === "init") {
        slider.viewport = $('<div class="flex-viewport"></div>').css({"overflow": "hidden", "position": "relative"}).appendTo(slider).append(slider.container);
      }
      slider.newSlides = $(vars.selector, slider);

      slider.container.width(slider.count * 200 + "%");
      slider.setProps(slider.currentSlide * slider.w, "init");
      setTimeout(function(){
        slider.doMath();
        slider.newSlides.css({"width": slider.computedW, "float": "left", "display": "block"});
      }, (type === "init") ? 100 : 0);
    }
    
    slider.doMath = function() {
      var slide = slider.slides.first(),
          slideMargin = vars.itemMargin,
          minItems = vars.minItems,
          maxItems = vars.maxItems;
      
      slider.w = slider.width(); // - (slider.outerWidth() - slider.width());
      slider.boxPadding = slide.outerWidth() - slide.width();      
      
      slider.itemT = vars.itemWidth + slideMargin;
      slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
      slider.maxW = (maxItems) ? maxItems * slider.itemT : slider.w;
      slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * minItems))/minItems :
                     (slider.maxW < slider.w) ? (slider.w - (slideMargin * maxItems))/maxItems :
                     (vars.itemWidth > slider.w) ? slider.w : vars.itemWidth;
      slider.visible = Math.floor(slider.w/(slider.itemW + slideMargin));
      slider.move = (vars.move > 0 && vars.move < slider.visible ) ? vars.move : slider.visible;
      slider.pagingCount = Math.ceil(((slider.count - slider.visible)/slider.move) + 1);
      slider.last =  slider.pagingCount - 1;
      slider.limit = (vars.itemWidth > slider.w) ? ((slider.itemW + (slideMargin * 2)) * slider.count) - slider.w - slideMargin : ((slider.itemW + slideMargin) * slider.count) - slider.w;
      slider.computedW = (vars.itemWidth > slider.w) ? slider.w : slider.itemW - slider.boxPadding;
    }
    
    slider.update = function(pos, action) {
      slider.doMath();
      methods.directionNav.update();      
    }
    
    //FlexSlider: Initialize
    methods.init();
  }
  
  //FlexSlider: Default Settings
  $.flexslider.defaults = {
    namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
    selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
    animation: "fade",              //String: Select your animation type, "fade" or "slide"
    easing: "swing",               //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
    direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
    reverse: false,                 //{NEW} Boolean: Reverse the animation direction
    animationLoop: true,             //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
    startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
    slideshow: true,                //Boolean: Animate slider automatically
    slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
    animationSpeed: 600,            //Integer: Set the speed of animations, in milliseconds
    
    // Usability features
    useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
    touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
    video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches
    
    // Primary Controls
    directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
    
    // Carousel Options
    itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
    itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
    minItems: 0,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
    maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
    move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.
                                    
    // Callback API
    start: function(){},            //Callback: function(slider) - Fires when the slider loads the first slide
    before: function(){},           //Callback: function(slider) - Fires asynchronously with each slider animation
    after: function(){}            //Callback: function(slider) - Fires after each slider animation completes
  }


  //FlexSlider: Plugin Function
  $.fn.flexslider = function(options) {
    return this.each(function() {
      var $this = $(this),
          $slides = $this.find(options.selector || ".slides > li");

      if ($slides.length === 1) {
        $slides.fadeIn(400);
      } else if ($this.data('flexslider') === undefined) {
        new $.flexslider(this, options);
      }
    });
  }  

})(jQuery);