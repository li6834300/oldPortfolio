
 

$( "#remark" ).click(function() {
  console.log("detected!");
 
  
});
/*
 remark.spin();
 var remark: {
    phrases: ['designer <span class="opt">of simple things</span>', 'proud husband', 'photography enthusiast', 'follower of Jesus', 'sarcastic introvert', '<span class="opt">prodigious</span> chocolate consumer', 'fresh out of witty remarks'],
    count: 0,
    swap: function() {
      var i = Application.remark.count;
      $('#remark').html(Application.remark.phrases[i]);
      (i === Application.remark.phrases.length - 1) ? $('header').addClass('speachless') : Application.remark.count += 1;
    },
    spin: function(e) {
      var $header = $('header');
      e.preventDefault();
      
      if (!$header.hasClass('spin')) {
        // Start spin
        $header.addClass('spin');
        // End spin
        window.setTimeout(function() {
         Application.remark.swap();
         $header.removeClass('spin'); 
        }, 900);
      }
    }
  }
*/


var Application = {
  init: function() {
    var touch = Modernizr.touch,
        clickEvent = (touch) ? "touchend" : "click";
    
    // Remarks
    // Concept most likely inspired by http://www.wearefixel.com/ in a deep crevice of my subconscious
    $('#remark, #remark-refresh').on(clickEvent, Application.remark.spin);
    
    // Expandable
    $('#work h3').on(clickEvent, Application.expandable);
    if (!touch) $('#work ul.slides').on(clickEvent, Application.expandable);
    
    // Slider
    Application.slider();
    
    $('.totop').on(clickEvent, Application.scrollTo);
    
    if (touch) $('#remark-refresh, .totop, h3 a').on("click", function(e){ e.preventDefault(); });
  },
  remark: {
    phrases: ['designer <span class="opt" font-family = "Arial">of simple things</span>', 'new tech nerd', 'photography enthusiast', 'fan of fieldtrip', 'extrovert', '<span class="opt">prodigious</span> cupcake consumer', 'delicious maker'],
    count: 0,
    swap: function() {
      var i = Application.remark.count;
      $('#remark').html(Application.remark.phrases[i]);
      (i === Application.remark.phrases.length - 1) ? $('header').addClass('speachless') : Application.remark.count += 1;
    },
    spin: function(e) {
      var $header = $('header');
      e.preventDefault();
      
      if (!$header.hasClass('spin')) {
        // Start spin
        $header.addClass('spin');
        // End spin
        window.setTimeout(function() {
         Application.remark.swap();
         $header.removeClass('spin'); 
        }, 900);
      }
    }
  },
  expandable: function(e) {
    e.preventDefault();
    $(this).closest('article').toggleClass('expanded');
  },
  slider: function() {
    $('.images').flexslider({
      animation: "slide",
      animationSpeed: (Modernizr.touch) ? 500 : 600,
      animationLoop: false,
      controlNav: false,
      slideshow: false,
      itemWidth: 450,
      itemMargin: 30,
      minItems: 1,
      move: 1
    });
    
    $('#work article').hover(
      function() {
        $(this).addClass('focused');  
      },
      function() {
        $(this).removeClass('focused');
      }
    );
  },
  scrollTo: function(e) {
    e.preventDefault();
    $('html, body').animate({
      scrollTop: 0
    }, 1000);
  }
};

$(function(){
  Application.init();
});

$(window).load(function(){
  var $body = $('body');
  $body.removeClass('loading');
  setTimeout(function(){
    $body.removeClass('anim-load'); 
  }, 1000);
});