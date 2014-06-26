$(document).ready(function() {
	// nothing yet...
});

$( window ).on( "orientationchange", function( event ) {
	setWidth();
	log( "This device is in " + event.orientation + " mode" );
});

$(document).bind("pageshow", function() {
	scrollTop();
	setWidth();

	// log some stuff (DEBUG)
	log("heading.outerHeight=" + $("#heading").outerHeight());
	log("window width=" + window.innerWidth);
});

function scrollTop () {
	// scroll to hide the heading
	setTimeout(function(){
		$.mobile.silentScroll($("#heading").outerHeight()+3);
	},150);
	//$('html, body').animate({ scrollTop: $("#heading").outerHeight() }, 2);
	//$('html, body').scrollTop($("#heading").outerHeight());
	//$.mobile.silentScroll($("#heading").outerHeight());
}

function setWidth () {
	var width = 568;
	if (window.innerWidth < width)
		width = window.innerWidth;
	$('.setwidth').attr('style', 'width: ' + width + 'px !important');
}

function log (text) {
	console.log(text);
	$('#content').append(text + "<br>");
}

function knowIt () {
}

function forgotIt () {
}

function previous () {
}
