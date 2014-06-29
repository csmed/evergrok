<?php
	// $Id$
	// returns (json):
	// - title       : title of the summary
	// - total_count : total number of notes in the summary
	// - rev_count   : total number of notes to revise
	// - notes       : a selection of the notes to revise
	// - more        : more notes to come? (boolean)
	include("util.php");
	$db      = connectDB();
	$request = $_POST + $_GET;
	$return  = array();
	$user    = getUser();
	
	// local variables
	$summaryId = -1;
	$nReturn   = 0;
	$chunkSize = 5; // default chunk size
	$fetchTo   = $chunkSize; // what array index to fetch up to
	
	// GET/POST variables
	if (!isset($request['summary_id']) || $request['summary_id'] == "") { nak("summary_id not provided"); }
	$summaryId = $request['summary_id'];
	if (isset($request['chunk']) && $request['chunk'] != "")       { $chunkSize = mysql_real_escape_string($request['chunk']); }
	if (isset($request['fetch_to']) && $request['fetch_to'] != "") { $fetchTo   = mysql_real_escape_string($request['fetch_to']); }

	// return data directly from session if same as prior
	if (isset($_SESSION['rev_summary_id']) && $summaryId == $_SESSION['rev_summary_id']) {
		// return title & total count
		$return["title"]       = $_SESSION['rev_title'] . ' (from cache)';
		$return["total_count"] = $_SESSION['rev_total'];
		$return["rev_count"]   = $_SESSION['rev_count'];
		if ($_SESSION['rev_index'] >= $_SESSION['rev_count']-1) {
			// no more notes to return
			$return["notes"] = array();
			$return["more"]  = 0;
		} else {
			// return the next few rows
			$fetchTo = min($_SESSION['rev_count']-1, max($fetchTo, $_SESSION['rev_index'] + $chunkSize));
			$return["notes"] = array_slice($_SESSION['rev_notes'], $_SESSION['rev_index']+1, $fetchTo-$_SESSION['rev_index']);
			$return["more"]  = ( $fetchTo == $_SESSION['rev_count']-1 ? 0 : 1 );
			
			// save where we've returned to
			$_SESSION['rev_index'] = $fetchTo;
		}
	}
	// else return data from the database
	else {
		// get summary header info
		$sql = "select $summaryId as summary_id, '12 reasons why Scottie is awesome' as title, 27 as notes";
		$rows = sql($sql);

		// if summary doesn't exist
		if (count($rows) == 0)
			nak("summary with id $summaryId does not exist");

		// save summary info in session
		$_SESSION['rev_summary_id'] = $summaryId;
		$_SESSION['rev_title'] = $rows[0]['title'];
		$_SESSION['rev_total'] = $rows[0]['notes'];
		// return title
		$return["title"]       = $rows[0]['title'] . ' (from database)';
		$return["total_count"] = $rows[0]['notes'];

		// get notes
		$sql = "select 1 as note_id, 'This is note ONE' as note, 2 as bucket ";
		$sql .= "UNION select 2 as note_id, 'This is note 2' as note, 1 as bucket ";
		$sql .= "UNION select 3 as note_id, 'This is note 3' as note, 3 as bucket ";
		$sql .= "UNION select 4 as note_id, 'This is note 4' as note, 1 as bucket ";
		$sql .= "UNION select 5 as note_id, 'This is note 5' as note, 4 as bucket ";
		$sql .= "UNION select 6 as note_id, 'This is note 6' as note, 2 as bucket ";
		$sql .= "UNION select 7 as note_id, 'This is note 7' as note, 1 as bucket ";
		$sql .= "UNION select 8 as note_id, 'This is note 8' as note, 3 as bucket ";
		$sql .= "UNION select 9 as note_id, 'This is note 9' as note, 2 as bucket ";
		$sql .= "UNION select 10 as note_id, 'This is note 10' as note, 1 as bucket ";
		$sql .= "UNION select 11 as note_id, 'This is note 11' as note, 2 as bucket ";
		$sql .= "UNION select 12 as note_id, 'This is note 12' as note, 1 as bucket ";
		$sql .= "UNION select 13 as note_id, 'This is note 13' as note, 3 as bucket ";
		$sql .= "UNION select 14 as note_id, 'This is note 14' as note, 1 as bucket ";
		$sql .= "UNION select 15 as note_id, 'This is note 15' as note, 4 as bucket ";
		$sql .= "UNION select 16 as note_id, 'This is note 16' as note, 2 as bucket ";
		$sql .= "UNION select 17 as note_id, 'This is note 17' as note, 1 as bucket ";
		$sql .= "UNION select 18 as note_id, 'This is note 18' as note, 3 as bucket ";
		$sql .= "UNION select 19 as note_id, 'This is note 19' as note, 2 as bucket ";
		$sql .= "UNION select 20 as note_id, 'This is note 20' as note, 1 as bucket ";
		$rows = sql($sql);
		$nReturn = min(count($rows), $chunkSize);

		// save the entire array - and the number already returned - in the session
		$_SESSION['rev_index'] = $nReturn - 1; // return first five rows
		$_SESSION['rev_count'] = count($rows);
		$_SESSION['rev_notes'] = $rows;

		// return the first chunk of rows
		$return["rev_count"] = $_SESSION['rev_count'];
		$return["more"]      = ( $_SESSION['rev_count'] > $nReturn ? 1 : 0);
		$return["notes"]     = array_slice($rows, 0, $nReturn);
	}

	//print "<br>\n";
	//print_r($_SESSION);
	//print "rev_notes: " . $_SESSION['rev_notes'] . "<br>";
	//print "rev_count: " . $_SESSION['rev_count'] . "<br>";
	//print "rev_index: " . $_SESSION['rev_index'] . "<br>";
	//print "<br>\n";

    ack(json_encode($return), 'get_summary.php request');	
?>
