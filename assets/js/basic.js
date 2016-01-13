
var mPreLoader = new (function () {
    "use strict";
    var self = this;
    
    var preloader = document.getElementById('preloader');
    
    self.finish = function () {
        classie.add(preloader, 'loaded');
        
        setTimeout(function () {
            classie.add(preloader, 'hidden');
        }, 1000);
    };
    
    return self;
    
})(); // preloader: loading effect for before site is fully loaded

$(window).on('beforeunload', function(){
  $(window).scrollTop(0);
});

$(window).load(function () { // once everything is loaded
    mPreLoader.finish();
});