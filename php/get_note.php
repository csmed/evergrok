<?php
	// $Id$
	include("util.php");
	$db = connectDB();
	$request = $_POST + $_GET;
	session_start();
	$user = getUser();
	if (!isset($request['note_id']) || $request['note_id'] == "")
		nak("note_id not provided");
	$noteId = $request['note_id'];

	// return note
	$sql = "select $noteId as note_id, '<h1>Hi Craig!</h1>how are you? $noteId' as contents";
	$rows = sql($sql);

	if (count($rows) == 0)
		nak("Note $noteID not found");
	else
		ack(json_encode($rows[0]), 'get_note.php request')
?>
