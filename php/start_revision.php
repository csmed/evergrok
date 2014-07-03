<?php
	# $Id: start_revision.php,v 1.1 2014/06/27 07:32:55 ss Exp $
	include("util.php");
	$db = connectDB();
	$request = $_POST + $_GET;
	session_start();

	# mandatory fields
	foreach (array('summary_id', 'user') as $val) {
		if (!isset($_REQUEST[$val]) || $_REQUEST[$val] == "") { nak("No $val specified"); }
	}

	$user      = $request['user'];
	$summaryId = $request['summary_id'];
	$maxNotes  = 5;
	if (isset($request['max']) && $request['max'] != "")
		$maxNotes = mysql_real_escape_string($request['max']);

	$smry = sqlSelect1(array('title', 'subtitle'),
					   'summaries',
					   array('summary_id' => $summaryId, 'user' => $user));
	if (empty($smry))
		nak("No summary $summaryId for user $user");

	$return = array();
	$return['title'] 	= $smry['title'];
	$return['subtitle'] = $smry['subtitle'];

	$notes = sqlSelect(array('note_id', 'type', 'content'),
					   'notes',
					   "summary_id = $summaryId and next_revision < now()",
					   "order by next_revision asc limit $maxNotes");
	$return['notes']    = $notes;
	if (empty($notes))
		nak("No notes to revise for summary $summaryId"); # maybe not an error?

	$total = sqlSelect1('count(*) as n',
						'notes',
						"summary_id = $summaryId and next_revision < now()");
	$return['n_revise'] = $total['n'];

    ack(json_encode($return), 'get_summary.php request')
?>
