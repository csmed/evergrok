var noteIDs = [3, 15, 21, 34, 40, 54, 67, 73, 82, 93];
var noteIndex = 0;
var nNotes = 100; // number of notes in this summary
var fromBucket = 1;
var nLoaded = 3;

$(document).ready(function() {
	randomizeTrays();
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
	log("window.load()");
	setTimeout(function(){
		scrollTop();
		setSizes();
		initSwiper();
	},100);

	// start fetching a few more notes
	// prefetch(); // TODO: turn this back on

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
	$('.fullheight').each(function() {
		$(this).attr('style', $(this).attr('style') + '; height: ' + height + 'px !important;');
	});
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

function prefetch () {
	var note_id = 0;
	var slideHTML = "";
	var startIndex = nLoaded;
	var endIndex = noteIndex + 5; // have at least the next FIVE slides loaded
	if (endIndex >= noteIDs.length)
		endIndex = noteIDs.length-1;
	
	if (endIndex >= startIndex) {
		//log("startIndex=" + startIndex + "    endIndex=" + endIndex + "     noteIndex=" + noteIndex);
		for (i = startIndex; i <= endIndex; i++) {
			// preload note
			//log("fetching note_id=" + note_id);
			note_id = noteIDs[i];
			$.ajax({
				type: 'POST',
				url: 'php/get_note.php',
				data: { note_id: note_id },
				dataType: 'json',
				success: function(j) {
					//log(j);
					slideHTML = "<p>this is a slide</p><p>with note ID: " + j.note_id + "</p><h2>Yippee!!</h2>" + j.contents;
					mySwiper.createSlide(slideHTML).append();
					if (startIndex == noteIDs.length-1) {
						// append the "slideshow finished" slide
						slideHTML = $('#shareTemplate').html();
						mySwiper.createSlide(slideHTML).append();
					}
				},
				error: function(x,s,e) {
					alert(x.responseText);
				}
			});
			nLoaded++;
		}
	}
}

// TEST - randomize trays to test visual appearance
function randomizeTrays () {
	var nCards = 0;
	var activeTray = Math.floor(Math.random() * 4) + 1; // 1 .. 4
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
	if (noteIndex >= noteIDs.length) {
		log("all done! We need to take you somewhere now");
		log("user SHOULD be seeing the 'last slide' page now");
	} else {
		noteIndex++;
		randomizeTrays();
		prefetch();
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
		randomizeTrays();
	}
	log("noteIndex=" + noteIndex);
	//log("noteID=" + noteIDs[noteIndex]);
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
	//log("previous(" + slide + ")");
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

	window.open(link, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
}

