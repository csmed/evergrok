var summary_id    = -1;
var notes         = {}; // multidimensional array of notes { note_id, tray, note, action(0=done, 1=knowIt, 2=forgotIt, 3=reallyKnowIt, -1=skipIt) }
var trays         = {}; // array of tray qtys
var qtyDivisor    = 1;  // factor to determine visible tray qtys
//var visibleIndex  = 0;  // current 'notes' array index for visible note
var nRevNotes     = 0;  // number of notes to revise
var nSummaryNotes = 0;  // number of notes in this summary
var moreNotes     = true;
var snackbarTimer;

// constantsW
var DELETE       = '-2';
var SKIP         = '-1';
var DONE         = '0';
var KNOWIT       = '1';
var FORGOTIT     = '2';
var REALLYKNOWIT = '3';

$(document).ready(function() {
	initSwiper(function() { prefetch(true); });
});

$( window ).on( "orientationchange", function( event ) {
	log("orientation change");
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
	},100);

	/*
	log("heading.outerHeight=" + $("#heading").outerHeight());
	log("window innerWidth=" + window.innerWidth);
	log("body innerWidth=" + $('body').innerWidth());
	log("window outerWidth=" + window.outerWidth);
	log("window innerHeight=" + window.innerHeight);
	*/
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
	$('.fullwidth').each(function() {
		$(this).attr('style', $(this).attr('style') + '; width: ' + width + 'px !important;');
	});
	$('.minheight').each(function() {
		$(this).attr('style', $(this).attr('style') + '; min-height: ' + Math.round(height - $(this).position().top) + 'px !important;');
	});
	$('.swiper-container').each(function() {
		$(this).attr('style', $(this).attr('style') + '; width: ' + width + 'px !important;');
	});
	$('.middle').css('margin-top', Math.round(height/2));

	/*
	log("height=" + height);
	log("width=" + width);
	*/
}

function log (text) {
	console.log(text);
	// $('#content').append(text + "<br>");
}

function prefetch (initial) {
	//log("prefetch(" + initial + ");");
	var nocache = 0;
	var activeIndex = mySwiper.activeIndex;
	if (initial) { nocache = 1; }

	if (moreNotes || initial) {
		var slideHTML = "";
		// load at least FIVE notes ahead
		if (initial || notes.length <= activeIndex + 5) {
			$.ajax({
				type: 'POST',
				url: 'php/get_summary.php',
				data: { summary_id: summary_id,  fetch_to: (activeIndex + 5),  nocache: nocache },
				dataType: 'json',
				success: function(j) {
					//log(j);
					// j.title
					// j.total_count
					// j.rev_count
					// j.more
					// j.notes { note_id, tray, note }

					// summary info
					if (initial) {
						$('#heading').html("<h2>" + j.title + "(" + j.total_count + " notes)</h2>");
						nRevNotes = j.rev_count;
						$('#rev_counter').html("1 / " + nRevNotes);
						if (j.more == 0)
							moreNotes = false;

						// save notes & trays in local arrays
						notes = j.notes;
						trays = j.trays;
						redrawTrays(true);
					} else {
						// append new notes to 'notes' array
						notes = notes.concat(j.notes);
					}

					// get individual note contents
					for (i=0; i<j.notes.length; i++) {
						slideHTML = "<h3>this is a slide</h3><p>with note ID: " + j.notes[i].note_id + "</p><h2>Contents:</h2>" + j.notes[i].note;
						mySwiper.createSlide(slideHTML).append();
					}

					// check to see if there is more to come after this set
					if (j.more == 0) {
						// append the "slideshow finished" slide
						slideHTML = $('#shareSlide').html();
						mySwiper.createSlide(slideHTML).append();
						moreNotes = false;
					}

					// scroll to top if this is the first load
					if (initial)
						scrollTop();
				},
				error: function(x,s,e) {
					alert(x.responseText);
				}
			});
		}
	}
}

function redrawTrays (initial) {
	var nCards = 0;
	var maxCards = 0;
	var activeTray = notes[mySwiper.activeIndex].tray;

	for (i=1; i<=4; i++) {
		nCards = trays[i];
		$('#badge' + i).html(nCards);
		if (nCards > maxCards)
			maxCards = nCards;
	}

	if (initial && maxCards > 4)
		qtyDivisor = Math.ceil(maxCards / 4);

	for (i=1; i<=4; i++) {
		nCards = Math.round(trays[i] / qtyDivisor);
		if (i == activeTray) {
			$('#tray' + i).attr('src', '/img/cards' + nCards + 'a.png');
		} else {
			$('#tray' + i).attr('src', '/img/cards' + nCards + '.png');
		}
	}
}

function nextNote () {
	var goBack = false;
	var index = mySwiper.activeIndex -1;
	scrollTop();

	// act & give feedback
	log("notes[index].action=" + notes[index].action);
	switch(notes[index].action) {
		case DONE:
			// nothing to do
			break;
		case DELETE:
			// delete 
			snackbar("slide", "Deleting...", 'UNDO', function() { unDelete(notes[index].note_id); } );
			notes[index].action = DONE;
			// TODO: need to remove (hide?) the slide from the swiper
			//       and have a function to allow for undo (slide re-inserted?)
			break;
		case SKIP:
			// skip and revert note to normal state in case we return and revise later
			snackbar("slide", "Skipping...", 'MARK AS REVISED', function() { markRevised(index); snackbar("appear", "&#10004; Successfully revised"); } );
			notes[index].action = KNOWIT;
			break;
		case KNOWIT:
			snackbar("slide", "Successfully revised", 'UNDO', function() { unmarkRevised(index); snackbar("appear", "&#10004; Successfully undone..."); mySwiper.swipePrev(); } );
			markRevised(index);
			notes[index].action = DONE;
			break;
		case FORGOTIT:
			snackbar("slide", "OK, we'll revise that again soon", 'UNDO', function() { unmarkForgotIt(index); snackbar("appear", "&#10004; Successfully undone..."); mySwiper.swipePrev(); } );
			markForgotIt(index);
			notes[index].action = DONE;
			break;
		case REALLYKNOWIT:
			snackbar("slide", "OK, we won't revise that again for a while", 'UNDO', function() { unmarkReallyKnowIt(index); snackbar("appear", "&#10004; Successfully undone..."); mySwiper.swipePrev(); } );
			markReallyKnowIt(index);
			notes[index].action = DONE;
			break;
		default:
			alert("unknown action: " + notes[index].action);
			log("Error! unknown action=" + notes[index].action + "     note_id=" + notes[index].note_id);
			break;
	}

	redrawTrays(false);

	if (index < nRevNotes-1) {
		//visibleIndex++;                       // TODO: deal with the possibility of sliding two slides in one go
		//log("visibleIndex=" + index);
		prefetch(false);
	} else {
		log("all done! We need to take you somewhere now");
		log("user SHOULD be seeing the 'last slide' page now");
		return false;
	}
	return true;
}

function prevNote () {
	redrawTrays(false);
	return true;
}

function skipIt () {
	//log("skipIt()");
	hideLessCommon();
	notes[mySwiper.activeIndex].action = SKIP;
	mySwiper.swipeNext();
}

function knowIt () {
	//log("knowIt()");
	hideLessCommon();
	notes[mySwiper.activeIndex].action = KNOWIT;
	mySwiper.swipeNext();
}

function reallyKnowIt () {
	//log("reallyKnowIt()");
	hideLessCommon();
	notes[mySwiper.activeIndex].action = REALLYKNOWIT;
    mySwiper.swipeNext();
}

function forgotIt () {
	//log("forgotIt()");
	hideLessCommon();
	notes[mySwiper.activeIndex].action = FORGOTIT;
	mySwiper.swipeNext();
}

function previous (slide) {
	//log("previous(" + slide + ")");
	hideLessCommon();
	mySwiper.swipePrev();
}

function deleteIt () {
	//log("deleteIt()");
	hideLessCommon();
	notes[mySwiper.activeIndex].action = DELETE;
	mySwiper.swipeNext();
}

function exit () {
	alert("exit() called");
}

function hideMenus () {
	hideLessCommon();
	hideShare();
}

function showLessCommon () {
	$('#clickoutside').show();
	$('#lesscommon').slideDown(300);
}

function hideLessCommon () {
	$('#clickoutside').hide();
	$('#lesscommon').slideUp(300);
}

function showShare () {
	$('#clickoutside').show();
	$('#sharemenu').slideDown(300);
}

function hideShare () {
	$('#clickoutside').hide();
	$('#sharemenu').slideUp(300);
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

	// TODO: add ga.send() to "/share"

	snackbar("slide", "Opening share link...");
	window.open(link, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
}

function snackbar (behaviour, message, action, onclick, actioncolour) {
	var timeout = 1500;

	// stop any prior animation
	$('#snackbar').hide();
	window.clearTimeout(snackbarTimer);

	// setup snackbar
	$('#snackbarmsg').html(message);
	if (typeof action === 'undefined' || typeof onclick === 'undefined') {
		// just a notification
		$('#snackbaraction').hide();
	} else {
		// allow time to click undo
		timeout = 2000;

		// a notification with an action
		$('#snackbaraction').show();
		$('#snackbaraction').html(action);
		$('#snackbaraction').unbind('click');
		$('#snackbaraction').bind('click', function() { onclick(); });

		// color of action "button"
		if (typeof actioncolour !== 'undefined')
			$('#snackbaraction').css('color', actioncolour);
	}

	// slide or jump into view
	switch (behaviour) {
		case 'appear':
			$('#snackbar').show();
			break;
		case 'slide':
		default:
			$('#snackbar').slideDown(300);
	}
	// delay, then slide out of view
	snackbarTimer = window.setTimeout( function() { $('#snackbar').slideUp(300); }, timeout);
}

function markRevised (index) {
	var fromTray = parseInt(notes[index].tray);
	var toTray = fromTray + 1;

	// TODO - AJAX database call

	if (fromTray < 4) {
		// move note forward one tray
		notes[index].tray = parseInt(notes[index].tray) +1;

		trays[fromTray] = parseInt(trays[fromTray]) -1;
		trays[toTray] = parseInt(trays[toTray]) +1;
	}
}

function unmarkRevised (index) {
	var fromTray = parseInt(notes[index].tray);
	var toTray = fromTray - 1;

	// TODO - AJAX database call

	if (fromTray > 1) {
		// allow note to be revised again
		notes[index].action = KNOWIT;
		// move note backward one tray
		notes[index].tray = parseInt(notes[index].tray) -1;

		trays[fromTray] = parseInt(trays[fromTray]) -1;
		trays[toTray] = parseInt(trays[toTray]) +1;
	}
}

function markForgotIt (index) {
	// the card doesn't need to change trays

	// TODO - AJAX database call

	log("markForgotIt(" + index + ");");
}

function unmarkForgotIt (index) {
	// the card doesn't need to change trays

	// TODO - AJAX database call

	log("unmarkForgotIt(" + index + ");");
}

function markReallyKnowIt (index) {
	var fromTray = parseInt(notes[index].tray);
	var toTray = fromTray + 2;

	// TODO - AJAX database call

	if (fromTray < 4) {
		if (fromTray == 3) {
			// move note to the last tray
			toTray = 4;
			notes[index].tray = parseInt(notes[index].tray) +1;
		} else {
			// move note forward two trays
			notes[index].tray = parseInt(notes[index].tray) +2;
		}

		trays[fromTray] = parseInt(trays[fromTray]) -1;
		trays[toTray] = parseInt(trays[toTray]) +1;
	}

	log("markReallyKnowIt(" + index + ");");
}

function unmarkReallyKnowIt (index) {
	// need a way to find out the previous tray of the note, then put it back

	// TODO - AJAX database call

	log("unmarkReallyKnowIt(" + index + ");");
}

function initSwiper (callback) {
	mySwiper = new Swiper('.swiper-container',{
		pagination: '.pagination',
		loop:false,
		grabCursor: true,
		paginationClickable: true,
		onSlideNext: function() { nextNote(); },
		onSlidePrev: function() { prevNote(); }
		/*
		longSwipesRatio: 0.3,
		moveStartThreshold: 30
		*/
	})
	$('.arrow-left').on('click', function(e){
		e.preventDefault();
		mySwiper.swipePrev();
	})
	$('.arrow-right').on('click', function(e){
		e.preventDefault();
		mySwiper.swipeNext();
	})
	callback();
}
