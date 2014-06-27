<?php
	// $Id: util.php,v 1.9 2014/06/23 03:31:24 cs Exp $
	include("sql.php");

	function connectDB () {
		$dbhost = '192.249.114.159:3306';
		$dbuser = 'revisy';
		$dbpass = 'MyOBB$3.14';
		$db = mysql_connect($dbhost, $dbuser, $dbpass);
		if (!$db ) { die('Could not connect: ' . mysql_error()); }
		mysql_select_db($dbuser) or die("Could not select database '$dbuser'");
		mysql_set_charset("utf8");
		return $db;
	}

	function getUser () {
		if (isset($_SERVER["HTTP_HOST"])) {
			session_start();
			if (isset($_SESSION['user'])) { return $_SESSION['user']; }
			if (isset($_REQUEST['user'])) { return $_REQUEST['user']; }
			return 'ip=' . $_SERVER['REMOTE_ADDR']; // use IP address
		} else {
			global $argv;
			parse_str($argv[1], $_REQUEST);
			$_SERVER['REMOTE_ADDR'] = '?';
			if (isset($_REQUEST['user'])) { return $_REQUEST['user']; }
			return '?';
		}
	}

	function isTest () {
		$adminIPs = array("211.30.223.102", "60.242.25.5", "120.151.237.242", "122.152.140.65");
		if ( in_array($_SERVER['REMOTE_ADDR'], $adminIPs) || preg_match('/^(10\.0\.)|(192\.168\.)|::/',$_SERVER['REMOTE_ADDR']) || !isset($_SERVER['HTTP_HOST']) )
			return true;
		return false;
	}
	
	function userActive () {
		if(isset($_SESSION['user']) && (! isTest()) ) {
		//if(isset($_SESSION['user'])) {
			$user = $_SESSION['user'];
			sqlUpdate('users', 
					array('last_active' => 'now()'),
					array('user' => $user));
		}
	}

	function sorry() {
		nak('We\'re so sorry, something went wrong! Our Support Team has been notified of this error and will be working to fix this problem ASAP. Please vent your frustration to <a href="mailto:support@friend-magic.com">support@friend-magic.com</a> - we deserve it!', 'SORRY!');
	}

	function emailVerificationCode () {
		$email = $_SESSION['user'];
		$row = sqlSelect1('fmid', 'users', array('user' => $email));
		if (!isset($row['fmid'])) {
			nak("Invalid username user=$email");
		}

		$file = '../emails/templates/verificationCode.html';
		$template = file_get_contents($file);
		if ($template === FALSE) {
			logUserAction("Can't load email template from: $file");
			sorry();
		} else {
			function firstName ($str) {
				$arr = explode(' ', trim($str));
				return ucfirst(strtolower($arr[0]));
			}
			$message = str_replace(array('%RECIPIENT_EMAIL%', '%NAME%', '%CODE%'),
								   array($email, firstName($_SESSION['name']), $row['fmid']),
								   $template);
#			sendEmail('support@friend-magic.com (Friend Magic)',
#					  $email,
#					  'obb@smedleyfamily.net', // BCC
#					  'Your verification code',
#					  $message);

			$tmp = tempnam('/tmp', 'evc');
			$fh = fopen($tmp, 'w');
			fwrite($fh, $message);
			fclose($fh);
		
			# Must redirect output, otherwise we wait send_email.php to finish.
			exec("/usr/local/bin/php ./send_email.php 'to=$email&from=Friend Magic <support@friend-magic.com>&subject=Your verification code&file=$tmp' >> /tmp/evc2.log &");
		}
	}

	function request($varName) {
		return isset($_GET[$varName]) ? $GET[$varName] 
			: (isset($_POST[$varName]) ? $_POST[$varName] : null);
	}

?>
