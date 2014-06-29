var summary_id    = -1;
var notes         = {}; // multidimensional array of notes { note_id, bucket, note }
var visibleIndex  = 0;  // current 'notes' array index for visible note
var nRevNotes     = 0;  // number of notes to revise
var nSummaryNotes = 0;  // number of notes in this summary
var fromBucket    = 0;  // bucket of visible note
var moreNotes     = true;

$(document).ready(function() {
	// fetch a few notes
	prefetch(true);
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
		initSwiper();
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
	if (moreNotes) {
		log("prefetch");
		var slideHTML = "";
		// load at least FIVE notes ahead
		if (initial || notes.length <= visibleIndex + 5) {
			$.ajax({
				type: 'POST',
				url: 'php/get_summary.php',
				data: { summary_id: summary_id, fetch_to: (visibleIndex + 5) },
				dataType: 'json',
				success: function(j) {
					log(j);
					// j.title
					// j.total_count
					// j.rev_count
					// j.more
					// j.notes { note_id, bucket, note }
					
					// summary info
					if (initial) {
						$('#heading').html("<h2>" + j.title + "(" + j.total_count + " notes)</h2>");
						nRevNotes = j.rev_count;
						$('#rev_counter').html("1 / " + nRevNotes);
						if (j.more == 0)
							moreNotes = false;

						// save notes in 'notes' array
						notes = j.notes;
						log(notes);
					} else {
						// append new notes to 'notes' array
						notes = notes.concat(j.notes);
						log(notes);
					}
					
					// get individual note contents
					for (i=0; i<j.notes.length; i++) {
						slideHTML = "<h3>this is a slide</h3><p>with note ID: " + j.notes[i].note_id + "</p><h2>Contents:</h2>" + j.notes[i].note;
						mySwiper.createSlide(slideHTML).append();
					}
					
					// check to see if there is more to come after this set
					if (j.more == 0) {
						// append the "slideshow finished" slide
						slideHTML = $('#shareTemplate').html();
						mySwiper.createSlide(slideHTML).append();
						moreNotes = false;
					}
				},
				error: function(x,s,e) {
					alert(x.responseText);
				}
			});
		}
	}
}

// TEST - randomize trays to test visual appearance
function randomizeTrays () {
	var nCards = 0;
	var activeTray = notes[visibleIndex].bucket; // Math.floor(Math.random() * 4) + 1; // 1 .. 4
	var badgeFactor = Math.floor(Math.random() * 5) + 1; // 1 .. 5
	for (i=0; i<=4; i++) {
		if (i == activeTray) {
			nCards = Math.floor(Math.random() * 4) + 1; // 1 .. 4
			$('#tray' + i).attr('src', '/img/cards' + nCards + 'a.png');
		} else {
			nCards = Math.floor(Math.random() * 5); // 0 .. 4
			$('#tray' + i).attr('src', '/img/cards' + nCards + '.png');
		}
		$('#badge' + i).html(nCards * badgeFactor);
	}
}

function nextNote () {
	if (visibleIndex < nRevNotes-1) {
		visibleIndex++;                       // TODO: deal with the possibility of sliding two slides in one go
		log("visibleIndex=" + visibleIndex);
		randomizeTrays();
		prefetch(false);
	} else {
		log("all done! We need to take you somewhere now");
		log("user SHOULD be seeing the 'last slide' page now");
	}
	return true;
}

function prevNote () {
	if (visibleIndex <= 0) {
		alert("there's no going back");
		return false;
	} else {
		visibleIndex--;                        // TODO: deal with the possibility of sliding two slides in one go
		randomizeTrays();
	}
	log("visibleIndex=" + visibleIndex);
	//log("noteID=" + noteIDs[visibleIndex]);
	return true;
}


function skipIt () {
	//log("skipIt()");
	hideLessCommon();
	mySwiper.swipeNext();
}

function knowIt (slide) {
	//log("knowIt(" + slide + ")");
	hideLessCommon();
	if (slide)
		mySwiper.swipeNext();
	else
		nextNote();
	scrollTop();
}

function reallyKnowIt () {
	//log("reallyKnowIt()");
	hideLessCommon();
    mySwiper.swipeNext()
}

function forgotIt () {
	//log("forgotIt()");
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
	//log("deleteIt()");
	hideLessCommon();
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

	// TODO: add ga.send() to "/share"

	window.open(link, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
}

