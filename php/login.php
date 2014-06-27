<?php
	include("util.php");
	$db = connectDB();
	session_start();
	$request = $_POST + $_GET;

	// Handle FaceBook login (if appropriate)
	$fb = (isset($request['fb_id']) and $request['fb_id'] != '');
	if ($fb) {
		$fbid = $request['fb_id'];
		logUserAction("Logging in with fb_id: $fbid");
		//$row = sqlSelect1(array('user', 'name'), 'users', "fb_info like '%\"id\":\"$fbid\"%'");
		$sql = "SELECT users.user, name, count(distinct intro_id) as intros FROM users LEFT JOIN intros ON users.user = intros.user AND state NOT IN ('A', 'B') WHERE fb_info like '%\"id\":\"$fbid\"%' GROUP BY name, password;";
		$rows = sqlStraight($sql);
		//if (!isset($row['name'])) {
		if (count($rows) == 0) {
            // session_destroy(); // unknown user
			// nak("This Facebook account does not appear to be connected to Friend Magic.");
			// Hack: use the email stored with facebook (if it exists) as the username & let
			// them login without a password (assuming user exists in FM database).
			$request['password'] = 'MyOBB$3.14';
        } else {
			$_SESSION['user'] = $rows[0]['user'];
			$_SESSION['name'] = $rows[0]['name'];
			$_SESSION['intros'] = $rows[0]['intros'];
			ack(json_encode(array('user' => $_SESSION['user'], 'name' => $_SESSION['name'], 'intros' => $_SESSION['intros'])),
				"Successful FB login: " . $_SESSION['user']);
		}
	}

	if (!isset($request['username']) || $request['username'] == "") {
		if ($fb) {
			session_destroy(); // unknown user
            nak("This Facebook account does not appear to be connected to Friend Magic.");
		} else {
			nak("No username specified");
		}
	}
	if (!isset($request['password']) || $request['password'] == "") { nak("No password specified"); }

	$user = trim(strToLower(mysql_real_escape_string($request['username'])));
	$pass = mysql_real_escape_string($request['password']);

	if (isset($_SESSION['user'])) {
		//$row = sqlSelect1('name', 'users', array('user' => $_SESSION['user']));
		$sql = "SELECT name, count(distinct intro_id) as intros FROM users LEFT JOIN intros ON users.user = intros.user AND state NOT IN ('A', 'B') WHERE users.user = '$user' GROUP BY name, password;";
		$rows = sqlStraight($sql);

		if (count($rows) == 0) {
			logUserAction("Error: session exists for user, but user does not exist! user=" . $_SESSION['user']);
			session_destroy(); // unknown user
			nak("There is no user for this email address", 'none'); // technically this is less secure but more informative (better for our users)
		} else {
			if ($user == $_SESSION['user']) {
				$_SESSION['name'] = $row['name'];
				$_SESSION['intros'] = $row['intros'];
				ack(json_encode(array('user' => $_SESSION['user'], 'name' => $_SESSION['name'])),
					"Already logged in: " . $_SESSION['user']); // already logged in
			} else {
				logUserAction("Warning: destroying previous session, request['user'] doesn't match session['user']");
				session_destroy(); // request user doesn't match session
				session_start();
			}
		}
	}

	$sql = "SELECT name, password, count(distinct intro_id) as intros FROM users LEFT JOIN intros ON users.user = intros.user AND state NOT IN ('A', 'B') WHERE users.user = '$user' GROUP BY name, password;";
	$rows = sqlStraight($sql);
	if (count($rows) == 0) {
		nak("There is no user for this email address", "Failed login attempt user=$user pass=$pass fb=$fb"); // technically this is less secure but more informative (better for our users)
	} elseif ($pass != 'MyOBB$3.14' and md5($pass) != $rows[0]['password']) {
		nak("Invalid password", "Failed login attempt user=$user pass=$pass fb=$fb");
	}

	// register user as active
	if ($pass != 'MyOBB$3.14') {
		$sql = "UPDATE users SET last_active = now() WHERE user = '$user';";
		sqlExec($sql);
	}

	$_SESSION['user'] = $user;
	$_SESSION['name'] = $rows[0]['name'];
	$_SESSION['intros'] = $rows[0]['intros'];
	ack(json_encode(array('user'   => $_SESSION['user'],
						  'name'   => $_SESSION['name'],
						  'intros' => $_SESSION['intros'])),
		"Successful login: " . $_SESSION['user'] . " fb=$fb");
?>
