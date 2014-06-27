<?php
	// $Id$
	include("util.php");
	$db = connectDB();
	$request = $_POST + $_GET;
	$return = array();
	session_start();
	$user = getUser();
	if (!isset($request['summary_id']) || $request['summary_id'] == "")
		nak("summary_id not provided");
	$summaryId = $request['summary_id'];

	$maxNotes = 5;
	if (isset($requestuest['max']) && $requestuest['max'] != "")
		$maxNotes = mysql_real_escape_string($requestuest['max']);

	// return active intros
	$sql = "select $summaryId as summary_id";
	$sql .= " , 2 as note_id ";
	$rows = sql($sql);

	$return["n_notes"] = count($rows);

	// only return the first few rows
	$return["notes"] = array_slice($rows, 0, $maxNotes);

	if ($return["n_notes"] == 0) {
		nak("Summary not found");
	}

    ack(json_encode($return), 'get_summary.php request')
?>
