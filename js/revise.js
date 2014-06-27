var noteIDs = [3, 15, 21, 34, 40, 54, 67, 73, 82, 93];
var noteIndex = 0;
var nNotes = 100; // number of notes in this summary
var fromBucket = 1;
var nLoaded = 3;

$(document).ready(function() {
	// nothing yet...
});

$( window ).on( "orientationchange", function( event ) {
	setSizes();
	log( "This device is in " + event.orientation + " mode" );
});

//$(document).bind("pageshow", function() {
//$(window).on("load", function() {
//$(document).ready(function() {
$(window).load(function() {
	setTimeout(function(){
		scrollTop();
		setSizes();
		initSwiper();
	},100);

	// log some stuff (DEBUG)
	log("heading.outerHeight=" + $("#heading").outerHeight());
	log("window innerWidth=" + window.innerWidth);
	log("body innerWidth=" + $('body').innerWidth());
	log("window outerWidth=" + window.outerWidth);
	log("window innerHeight=" + window.innerHeight);
});

function scrollTop () {
	// scroll to hide the heading
	$('html,body').scrollTop($("#heading").outerHeight());
}

function setSizes () { // set fixed size element to screen extents (if small screen)
	// default (maximum) extents
	var height = 1024;
	var width = 568;

	// get our effective extents
	if ($(window).innerHeight() < height)
		height = $(window).innerHeight();
	if ($('body').innerWidth() < width)
		width = $('body').innerWidth();

	// set elements with full width/height
	$('.fullheight').each(function() {
		$(this).attr('style', $(this).attr('style') + '; height: ' + height + 'px !important;');
	});
	$('.fullwidth').each(function() {
		$(this).attr('style', $(this).attr('style') + '; width: ' + width + 'px !important;');
	});
	$('.minheight').each(function() {
		$(this).attr('style', $(this).attr('style') + '; min-height: ' + (height - $(this).position().top) + 'px !important;');
	});
	$('.swiper-container').each(function() {
		$(this).attr('style', $(this).attr('style') + '; width: ' + width + 'px !important;');
	});
	$('.middle').css('margin-top', (height/2));

	log("height=" + height);
	log("width=" + width);
}

function log (text) {
	console.log(text);
	// $('#content').append(text + "<br>");
}


function nextNote () {
	var slideHTML = "";
	console.log('next');
	if (noteIndex >= noteIDs.length -1) {
		alert("all done! We need to take you somewhere now");
	} else {
		noteIndex++;
		while (noteIndex > nLoaded - 3 && nLoaded < noteIDs.length) { // have at least the next three slides loaded
			// preload note
			slideHTML = "<p>this is slide</p><p>number " + (nLoaded+1) + "</p><p>with note ID: " + noteIDs[nLoaded] + "</p><h2>Yippee!!</h2>";
			mySwiper.createSlide(slideHTML).append();
			nLoaded++;
		}
	}
	log("noteIndex=" + noteIndex);
	//log("noteIDs=" + noteIDs[noteIndex]);
	return true;
}

function prevNote () {
	if (noteIndex <= 0) {
		alert("there's no going back");
		return false;
	} else {
		noteIndex--;
	}
	log("noteIndex=" + noteIndex);
	//log("noteID=" + noteIDs[noteIndex]);
	return true;
}


function skipIt () {
	log("skipIt()");
	hideLessCommon();
	mySwiper.swipeNext();
}

function knowIt (slide) {
	log("knowIt(" + slide + ")");
	hideLessCommon();
	if (slide)
		mySwiper.swipeNext();
	else
		nextNote();
}

function reallyKnowIt () {
	log("reallyKnowIt()");
	hideLessCommon();
    mySwiper.swipeNext()
}

function forgotIt () {
	log("forgotIt()");
	hideLessCommon();
	mySwiper.swipeNext();
}

function previous (slide) {
	log("previous(" + slide + ")");
	hideLessCommon();
	if (slide)
		mySwiper.swipePrev()
	else
		prevNote();
}

function deleteIt () {
	log("deleteIt()");
	hideLessCommon();
	mySwiper.swipeNext();
}

function hideMenus () {
	hideLessCommon();
	hideShare();
}

function showLessCommon () {
	$('#clickoutside').show();
	$('#lesscommon').slideDown();
}

function hideLessCommon () {
	$('#clickoutside').hide();
	$('#lesscommon').slideUp();
}

function showShare () {
	$('#clickoutside').show();
	$('#sharemenu').slideDown();
}

function hideShare () {
	$('#clickoutside').hide();
	$('#sharemenu').slideUp();
}

function mainMenu () {
	log("mainMenu()");
	hideLessCommon();
	alert("Would have just taken you to the main menu");
}

function shareMenu () {
	if ( $('#sharemenu').is(':visible') ) {
		hideShare();
	} else {
		showShare();
	}
}

function lessCommon () {
	if ( $('#lesscommon').is(':visible') ) {
		hideLessCommon();
	} else {
		showLessCommon();
	}
}

function initSwiper () {
	mySwiper = new Swiper('.swiper-container',{
		pagination: '.pagination',
		loop:false,
		grabCursor: true,
		paginationClickable: true,
		onSlideNext: function() { knowIt(false); },
		onSlidePrev: function() { previous(false); }
		/*
		longSwipesRatio: 0.3,
		moveStartThreshold: 30
		*/
	})
	$('.arrow-left').on('click', function(e){
		e.preventDefault()
		mySwiper.swipePrev()
	})
	$('.arrow-right').on('click', function(e){
		e.preventDefault()
		mySwiper.swipeNext()
	})
}

function share (site, url, txt) {
	var map = { 'email'      : 'mailto:?subject=EverGrok&body=%TXT%%0A%URL%',
				'facebook'   : 'https://www.facebook.com/sharer/sharer.php?u=%URL%',
				'googleplus' : 'https://plus.google.com/share?url=%URL%',
				'linkedin'   : 'http://www.linkedin.com/shareArticle?mini=true&url=%URL%&source=EverGrok&summary=%TXT%',
				'pinterest'  : 'http://www.pinterest.com/pin/create/button/?url=%URL%&description=%TXT%%20%URL%',
				// 'twitter'    : 'https://twitter.com/share?url=%URL%&text=%TXT%' };
				'twitter'    : 'https://twitter.com/share?url=evergrok.com&text=%TXT%%20%URL%' };
	if (!(site in map)) {
		console.log("Unknown site to share to: " + site); // TODO: logUserAction()
		return;
	}

	var link = map[site].replace('%URL%', encodeURIComponent('http://' + url)).replace('%TXT%', encodeURIComponent(txt));
	console.log(link);

	window.open(link, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
}

