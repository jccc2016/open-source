// following function from https://coderwall.com/p/fnvjvg/jquery-test-if-element-is-in-viewport
$.fn.isOnScreen = function(){

    var win = $(window);

    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

};

var mLandingEffect = new (function() {
    "use strict";
    var self = this;
    
    var isRevealed = false,
      	isAnimating = false,
      	scrollLock = false,
      	container = document.getElementById('intro-effect');
    
    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = {32: 1, 37: 1, 38: 1, 39: 1, 40: 1};
    
    self.revealPage = function (reveal) {
      	isAnimating = true;
      	
      	if(reveal) {
            classie.add(container, 'modify');
      	} else {
			self.disableScroll();
			classie.remove(container, 'modify');
      	}
      	// simulating the end of the transition:
      	setTimeout(function() {
  			isRevealed = !isRevealed;
  			isAnimating = false;
  			if(reveal) {
  				self.enableScroll();
  			}
      	}, 1200);
    };
    
    function scrollPage (scrollDirection) {
      	if (isAnimating) {
      	    return false;
      	}
      	if (scrollLock) {
      	    return false;
      	}
      	if (scrollDirection > 0 && !isRevealed) {
      		 self.revealPage(1);
      	}
    }
    
    function preventDefault(e) {
        e = e || window.event;
        scrollPage(e.deltaY); // take scroll input to reveal site
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;  
    }
    
    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }
    
    self.disableScroll = function () {
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove  = preventDefault; // mobile
        document.onkeydown  = preventDefaultForScrollKeys;
    };
    
    self.enableScroll = function () {
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = document.onmousewheel = null; 
        window.onwheel = null; 
        window.ontouchmove = null;  
        document.onkeydown = null;  
    };
    
    self.lockScroll = function () {
        scrollLock = true;
        self.disableScroll();
    };
    
    self.unlockScroll = function () {
        scrollLock = false;
    };

	return self;
})(); // landingEffect: used for landing page transition and scrolling controls

var mThreeJS = new (function () {
    "use strict";
    var self = this;
    
    var renderer,
        scene,
        camera,
        offset = 0, // offset for moving the waves
        mH = 2.2, // max Height
        s = 70, // speed, higher is slower
        numPoints = 25, // num of points in one direction
        width = 250; // width of plane
    
    var geometry = new THREE.PlaneGeometry(width, width, numPoints, numPoints);
    var material = new THREE.MeshBasicMaterial({color: 0xeeeeee, side: THREE.DoubleSide, wireframe: true});
    var plane = new THREE.Mesh(geometry, material);
    
    function animate () { // called 60 fps
    	requestAnimationFrame(animate);
    	render();
    }
    
    function sinFunc(x,vT,hT,vS,hS) { // x, vert translation, horiz translation, vert stretch, horiz stretch
    	return (vS * Math.sin((x / hS) - hT) + vT);
    }
    
    function render() {
    	offset += 1 / s;
    	var cR = -1; //current Row
    	var cC = 0; // current Column
    	
    	for (var i = 0; i < plane.geometry.vertices.length; i++) {
    		var r = Math.max(0, Math.floor(i / numPoints)); // row
    		if (r == cR) {
    			cC++;
    		} else {
    			cR = r;
    			cC = 0;
    		}
    		var xH = sinFunc(cC, 0, offset, mH, 2);
    		var yH = sinFunc(cR, 0, offset, mH, 2);
    		plane.geometry.vertices[i].z = xH * yH;
    	}
    	plane.geometry.verticesNeedUpdate = true;
    	
    	renderer.render(scene, camera);
    }
    
    self.init = function () {
        
        var container = document.getElementById('three-container');
        
        scene = new THREE.Scene();
        
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 25;
        camera.position.y = -50;
        camera.rotation.x = Math.PI/2.25;
        
        //
        scene.fog = new THREE.FogExp2(0x222222, 0.012);
        scene.add(plane);
        //
        
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x222222);
        container.appendChild(renderer.domElement);
        
        animate();
    };
    
    self.onWindowResize = function () {
    	camera.aspect = window.innerWidth / window.innerHeight;
    	renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    return self;
    
})(); // three.js: custom webgl background effect on landing page

var mPreLoader = new (function () {
    "use strict";
    var self = this;
    
    var preloader = document.getElementById('preloader');
    
    self.start = function () { //document.
        mLandingEffect.lockScroll();
        $("#owl-carousel").owlCarousel({
            autoPlay: 3000, //Set AutoPlay to 3 seconds
            
            items : 4,
            itemsDesktop : [1199,3],
            itemsDesktopSmall : [979,3]
        });
    };
    
    self.finish = function () { // wndow.onload
        
        mLandingEffect.unlockScroll();
        mThreeJS.init();
        
        classie.add(preloader, 'loaded');
        
        setTimeout(function () {
            classie.add(preloader, 'hidden');
        }, 1000);
    };
    
    return self;
    
})(); // preloader: loading effect for before site is fully loaded

$(window).on('beforeunload', function(){
  $(window).scrollTop(0);
}); // scroll to the top of the page before reloading

$(document).ready(function () { // when you arive on page
    mPreLoader.start();
});

$(window).load(function () { // once everything is loaded
    mPreLoader.finish();
});

$(window).on('scroll', function () {
    if ($('#facts').isOnScreen()) {
        countToMax();
    } else {
        countToZero();
    }
});

function scrollToId (id) {
    $('html, body').animate({
        scrollTop: $('#' + id).offset().top
    }, 1000);
}

function addRecursive (counter, max, delta, current) {
    var old = parseInt(counter.innerHTML);
    if (current) {
        old = current;
    }
    if (old < max) {
        var newString = '';
        var newNum = old + delta;
        if (newNum > 999) {
            newString = newNum.toString();
            var formattedString = newString.slice(0,1) + ',' + newString.slice(1);
            newString = formattedString;
        } else {
            newString = newNum.toString();
        }
        counter.innerHTML = newString;
        if (current) {
            counter.setAttribute('data-value-current', newNum);
        }
        setTimeout(function() {
            addRecursive(counter, max, delta);
        }, 50);
    }
    return;
}
var triggered = false;

function countToZero () {
    if (triggered) {
        var counters = $('.counter');
        for(var i = 0; i < counters.length; i++) {
            var counter = counters[i];
            counter.innerHTML = '0';
        }
        triggered = !triggered;
    }
}

function countToMax () {
    if (!triggered) {
        triggered = !triggered;
        var counters = $('.counter');
        for(var i = 0; i < counters.length; i++) {
            var counter = counters[i],
                max = parseInt(counter.getAttribute('data-value-max')),
                delta = parseInt(counter.getAttribute('data-delta')),
                cur = parseInt(counter.getAttribute('data-value-current'));
            
            cur = cur || null;
            addRecursive(counter, max, delta, cur);
        }
    }
}


// adds event handlers
document.getElementById('enter-site').addEventListener('click', function() { mLandingEffect.revealPage(1); });
document.getElementById('reveal').addEventListener('click', function() { mLandingEffect.revealPage(0); });
window.addEventListener('resize', function () { mThreeJS.onWindowResize(); }, false);