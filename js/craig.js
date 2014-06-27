var noteIDs = [3, 4, 15];
var noteIndex = 0;

$(document).ready(function() {
	// nothing yet...
});

$( window ).on( "orientationchange", function( event ) {
	setSizes();
	log( "This device is in " + event.orientation + " mode" );
});

//$(document).bind("pageshow", function() {
$(window).on("load", function() {
	scrollTop();
	setTimeout(function(){
		setSizes();
	},250);

	// log some stuff (DEBUG)
	log("heading.outerHeight=" + $("#heading").outerHeight());
	log("window innerWidth=" + window.innerWidth);
	log("body innerWidth=" + $('body').innerWidth());
	log("window outerWidth=" + window.outerWidth);
	log("window innerHeight=" + window.innerHeight);
});

function scrollTop () {
	// scroll to hide the heading
	// TODO: work out what is moving the scroll to the top on 'pageshow' and prevent it - then remove delay
	/*
	setTimeout(function(){
		$.mobile.silentScroll($("#heading").outerHeight()+3);
	},350);
	*/
	$('html, body').animate({ scrollTop: $("#heading").outerHeight() }, 2);
	//$('html, body').scrollTop($("#heading").outerHeight());
	//$.mobile.silentScroll($("#heading").outerHeight());
}

function setSizes () { // set fixed size element to screen extents (if small screen)
	var height = 1024;
	var width = 568;

	if ($('body').innerHeight() < height)
		height = $('body').innerHeight();
	if ($('body').innerWidth() < width)
		width = $('body').innerWidth();

	// attr('style'...) replaces all styles so we need to ensure it appends
	$('.fullheight').each(function() {
		$(this).attr('style', $(this).attr('style') + '; height: ' + height + 'px !important;');
	});
	$('.fullwidth').each(function() {
		$(this).attr('style', $(this).attr('style') + '; width: ' + width + 'px !important;');
	});
	//$('.middle').css('margin-top', '50%');
	$('.middle').css('margin-top', height/2);
	/*
	$('.middle').each(function() {
		$(this).attr('style', $(this).attr('style') + '; padding-top: ' + height/2 + 'px !important;');
	});
	$('.fullheight').attr('style', 'height: ' + height + 'px !important');
	$('.fullwidth').attr('style', 'width: ' + width + 'px !important');
	$('.fullwidth.fullheight').attr('style', 'height: ' + height + 'px !important; width: ' + width + 'px !important');
	*/
}

function log (text) {
	console.log(text);
	$('#content').append(text + "<br>");
}

function nextNote () {
	if (noteIndex >= noteIDs.length -1) {
		alert("you're at the end");
	} else {
		noteIndex++;
	}
	log("noteIndex=" + noteIndex);
	//log("noteIDs=" + noteIDs[noteIndex]);
}

function prevNote () {
	if (noteIndex <= 0) {
		alert("you're at the start");
	} else {
		noteIndex--;
	}
	log("noteIndex=" + noteIndex);
	//log("noteIDs=" + noteIDs[noteIndex]);
}

function knowIt () {
	log("knowIt()");
	nextNote();
}

function forgotIt () {
	log("forgotIt()");
	nextNote();
}

function previous () {
	log("previous()");
	prevNote();
}

function lessCommon () {
	$('#lesscommon').slideToggle();
	/*
	if ($('lesscommon').visible())
		$('#lesscommon').hide();
	else
		$('#lesscommon').slideDown();
	*/
}
