function nop () { console.log('nop'); }

function log_user_action (action, synchronous) {
	var async = true;
	if (typeof(synchronous) !== 'undefined')
		async = !synchronous;

	$.ajax({ 
		url:'php/user_action.php',
		type: 'POST',
		async: async,
		dataType: 'text',
		data: { 'action' : action },
		success: function(msg) { return true; }
	});
}

function logVisit () {
	var url = window.location.href.toString().split(window.location.host)[1];
	if (url == "/")
		url = "/index.html";

	var str = 'Visit: ' + url;
	if (!!window.performance)
		str = str + ' load=' + (window.performance.timing.loadEventStart - window.performance.timing.navigationStart) + 'ms';

	var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

	str = str + ' w=' + width + ' browser=' + navigator.userAgent;
	log_user_action(str);
}

function recordconversion () {
	var google_conversion_id = 987460704;
	var google_conversion_language = "en";
	var google_conversion_format = "3";
	var google_conversion_color = "ffffff";
	var google_conversion_label = "-gqgCODxqgkQ4Ojt1gM";
	var google_conversion_value = 0;
	var google_remarketing_only = false;

	// non-javascript AdWords conversion tracking
	var image = new Image(1,1);
	image.src = '//www.googleadservices.com/pagead/conversion/' + google_conversion_id + '/?label=' + google_conversion_label + ' &guid=ON&script=0';
	
	// Record the conversion (for AdWords campaign)
	// THEN
	// Record a pageview (for goal tracking)
	loadScript("//www.googleadservices.com/pagead/conversion.js",
		 function () { ga('send', 'pageview', '/signup'); });
}

function TitleCase (input) {
	if (typeof(input) === "undefined")
		return "";
	return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function GetParam (name) {
	var start=location.search.indexOf("?"+name+"=");
	if (start<0) start=location.search.indexOf("&"+name+"=");
	if (start<0) return '';
	start += name.length+2;
	var end=location.search.indexOf("&",start)-1;
	if (end<0) end=location.search.length;
	var result='';
	for(var i=start;i<=end;i++) {
		var c=location.search.charAt(i);
		result=result+(c=='+'?' ':c);
	}
	return unescape(result);
}

/* Cookies */
function setCookie (c_name,value,exdays) {
	if (value == null)
		exdays = -1;
	else if (typeof(exdays) === 'undefined')
		exdays = 30;
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}
function getCookie (c_name) {
	var c_value = " " + document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1) {
		c_value = null;
	}
	else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1) {
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	if (c_value == '')
		c_value = null; // treat blank cookies as null
	return c_value;
}

/* logCookies() - deferred/delayed logging */
function logCookies () {
	logAction = getCookie('logaction');
	if (logAction != null && logAction != "") {
		log_user_action('*' + logAction);
	}
	setCookie('logaction', "", 1);
	
	referrer = getCookie('referrer');
	if (referrer == null || referrer == "") {
		setCookie('referrer', document.referrer, 1);
	}
}
function logActionLater (action) {
	setCookie('logaction', action, 7);
}

function validateEmail (email) {
	email = email.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // strip leading/trailing whitespace
	var debug_re = /^.@.\..$/;
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return debug_re.test(email) || re.test(email);
}

function forgotpassword (email) {
	if (email == "") {
		$('#loginerror').html('No email address specified');
		return;
	}

	log_user_action('Clicked reset password');
	$('#loginerror').html('');
	$('#forgotpassbtn').attr('disabled','disabled');
	$.ajax({
		type: 'POST',
		url:  'php/reset_password.php',
		data: { user: email },
		success: function(j) {
			bootbox.dialog({
				message: "Your password has been reset. Please check your email.",
				title:   "Password Reset",
				buttons: { ok: { label: "OK", className: "btn-success" } }
			});
			$('#forgotpassbtn').removeAttr('disabled');
		},
		error: function(xhr, status, error) { 
			log_user_action('Failed to reset password for user=' + email + ' error=' + xhr.responseText);
			$('#loginerror').html('Failed to reset password for ' + email);
			console.log('login error: ' + xhr.responseText);
			$('#forgotpassbtn').removeAttr('disabled');
		}
	});
}

/* Additional JQuery */
$.support.placeholder = (function(){
	var i = document.createElement('input');
	return i.placeholder !== undefined;
})();

/* Google Analytics */
/*
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-42390114-9', 'auto');
ga('send', 'pageview');
*/
/* Inspectlet Embed Code */
/*
window.__insp = window.__insp || [];
__insp.push(['wid', 96745612]);
(function() {
	function __ldinsp(){var insp = document.createElement('script'); insp.type = 'text/javascript'; insp.async = true; insp.id = "inspsync"; insp.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js'; var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(insp, x); }
	if (window.attachEvent){
		window.attachEvent('onload', __ldinsp);
	}else{
		window.addEventListener('load', __ldinsp, false);
	}
})();
*/
