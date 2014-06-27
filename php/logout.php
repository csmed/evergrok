<?php
	include("util.php");
	$db = connectDB();
	session_start();
	if (!isset($_SESSION['user'])) { ack("Already logged out"); }
	session_destroy();
	ack("Successful logout");
?>
