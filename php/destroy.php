<?php
	session_start();
	session_destroy();
	
	echo("destroyed: " . date("Y-m-d h:i:s",time()));
?>
