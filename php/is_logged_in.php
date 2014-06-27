<?php
	include("util.php");
	$db = connectDB();
	session_start();
	if (!isset($_SESSION['user'])) { mysql_close(); nak("Not logged in", 'none'); }

	userActive();
	ack(json_encode(array('user' => $_SESSION['user'], 'name' => $_SESSION['name'], 'intros' => $_SESSION['intros'])), 'none');
?>
