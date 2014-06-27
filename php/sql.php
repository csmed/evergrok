<?php
    function escapeString (&$val, $key) { $val = mysql_escape_string(stripslashes($val)); }

    function __sqlInsertReplace ($op, $table, $data) {
        array_walk($data, 'escapeString');
        $query = "$op into $table (";
        $query .= join(",", array_keys($data)); // fields
        $query .= ') values ("' . join('","', array_values($data)) . '")'; // values
        //echo "<p>query=$query</p>\n";
        $sth = mysql_query($query);
        if (!$sth) {
            print('Query failed: ' . mysql_error() . "\n");
            return false;
        }
        return true;
    }

    /*
       sqlInsert() is useful to do stuff like:

       sqlInsert('ST_PROGRAMS',
                  array('prog_id'	=> $id,
                        'semester'	=> $semester,
                        ...));
     */
    function sqlInsert ($table, $data) {
        return __sqlInsertReplace('insert', $table, $data);
    }

    /*
       sqlReplace() is the same as sqlInsert() except that if an old row in the
       table has the same value as the new row, the old row is deleted first.
     */
    function sqlReplace ($table, $data) {
        return __sqlInsertReplace('replace', $table, $data);
    }

	function sqlInsertDuplicate ($table, $pk, $data) {
		array_walk($pk, 'escapeString');
		array_walk($data, 'escapeString');
		$all = array_merge($pk, $data);
		$q = "insert into $table ("
			. join(",", array_keys($all)) .
			") values ('" . join("','", array_values($all)) .
			"') on duplicate key update ";

		foreach ($data as $k => $v) {
			$q .= "$k = '$v',";
		}
		$q = rtrim($q, ',');
#		$q .= ' where ';
#		foreach($pk as $k => $v) {
#			$q .= "$k = '$v' and ";
#		}
#		$q = rtrim($q, ' and ');
        $sth = mysql_query($q);
        if (!$sth) {
            print('Query failed: ' . mysql_error() . "\nquery was: $q");
            return false;
        }
        return true;
	}


    function sqlUpdate ($table, $data, $conds, $quote = "'") {
        array_walk($data, 'escapeString');
        $query = "update $table set ";
        $count = 0;
        foreach (array_keys($data) as $field) {
			if ($count++ > 0) { $query .= ', '; }
			if ($data[$field]==null)
				$query .= "$field=null";
			elseif ($data[$field]=="now()")
				$query .= "$field=now()";
			else
				$query .= "$field=$quote" . $data[$field] . $quote;
        }
        if (isset($conds)) {
            if (is_array($conds) and $conds != array()) {
                array_walk($conds, 'escapeString');
                $query .= " where ";
                $c = 0;
                foreach (array_keys($conds) as $cond) {
                    if ($c > 0) { $query .= " and "; }
                    $c++;
                    $query .= $cond . "='" . $conds[$cond] . "'";
                }
            } else if ($conds != '') {
                # assuming is_string($conds)
                $query .= " where $conds"; # assuming is_string($conds)
            }
        }
        // echo "<p>query=$query</p>\n";
        $sth = mysql_query($query) or die('Query failed: ' . mysql_error() .
                                                        "\nQuery was: $query");
    }


    /*
        sqlQuery() is useful to do stuff like:

        $q = sqlQuery(array('field1', 'field2'),
                       'TABLE',
                       array('one'=> 1, 'two' => 2, 'three' => 3),
                       'order by field3');

        $q = sqlQuery('field1',
                       'table',
                       'one=1 or two=2',
                       'order by field4');
    */
    function sqlQuery ($fields, $table, $conds, $post, $quote = "'") {
        if (is_array($fields)) {
            $f = join(",", $fields);
        } else {
            $f = $fields; # assuming is_string($conds)
        }
        $query = "select $f from $table";
        if (is_array($conds) and $conds != array()) {
            array_walk($conds, 'escapeString');
            $query .= " where ";
            $c = 0;
            foreach (array_keys($conds) as $cond) {
                if ($c > 0) { $query .= " and "; }
                $c++;
                $query .= $cond . "=$quote" . $conds[$cond] . $quote;
            }
        } else if ($conds != '') {
            # assuming is_string($conds)
            $query .= " where $conds";
        }
        if ($post != '') { $query .= " $post"; }
        # echo "<p>q=$query\n";
        return $query;
    }

    function getFields ($fields, $table, $conds, $post = '') {
        $query = sqlQuery($fields, $table, $conds, $post);
        $sth = mysql_query($query) or die('Query failed: ' . mysql_error() .
                                                        "\nQuery was: $query");
        $a = array();
        $i = 0;
        while ($row = mysql_fetch_array($sth, MYSQL_ASSOC)) {
            $a[$i++] = $row;
        }
        mysql_free_result($sth);
        return $a;
    }

    function getField ($field, $table, $conds, $post = '') {
        $query = sqlQuery($field, $table, $conds, $post);
        $sth = mysql_query($query) or die('Query failed: ' . mysql_error() .
                                                    "\nQuery was: $query");
        $a = array();
        $field = preg_replace("/.* as (.*)/", "$1", $field);
        while ($row = mysql_fetch_array($sth, MYSQL_ASSOC)) {
            $a[] = $row[$field];
        }
        mysql_free_result($sth);
        return $a;
    }

    function sqlSelect ($fields, $table, $conds, $post = '', $quote = "'") {
        $query = sqlQuery($fields, $table, $conds, $post, $quote);
        $sth = mysql_query($query) or die('Query failed: ' . mysql_error() .
                                                    "\nQuery was: $query");
        $a = array();
        while ($row = mysql_fetch_array($sth, MYSQL_ASSOC)) {
            $a[] = $row;
        }
        mysql_free_result($sth);
        return $a;
    }
	
    function sqlExec ($query) {
        $sth = mysql_query($query);
		if (!$sth) {
			echo ('Query failed: ' . mysql_error() . "\nQuery was: $query");
			return false;
		}
		//mysql_free_result($sth);
		//while (mysql_more_results($sth)) { mysql_free_result($sth); }
		//while (mysql_next_result($sth)) { mysql_free_result($sth); }
		return true;
    }
	
    function sql ($query) {
        $sth = mysql_query($query) or die('Query failed: ' . mysql_error() .
                                                    "\nQuery was: $query");
        $a = array();
        while ($row = mysql_fetch_array($sth, MYSQL_ASSOC)) {
            $a[] = $row;
        }
        mysql_free_result($sth);
        return $a;
    }

    # sqlSelect1 - select a *single* row
    function sqlSelect1 ($fields, $table, $conds, $post = '') {
        $a = sqlSelect($fields, $table, $conds, $post);
        if (count($a)==0) { return; }
        return $a[0];
    }

    function sqlDelete ($table, $conds) {
        $query = "delete from $table";
        if (is_array($conds) and $conds != array()) {
            array_walk($conds, 'escapeString');
            $query .= " where ";
            $c = 0;
            foreach (array_keys($conds) as $cond) {
                if ($c > 0) { $query .= " and "; }
                $c++;
                $query .= $cond . "='" . $conds[$cond] . "'";
            }
        } else if ($conds != '') {
            # assuming is_string($conds)
            $query .= " where $conds";
        }
        $sth = mysql_query($query) or die('Query failed: ' . mysql_error() .
                                                        "\nQuery was: $query");
    }

    function getLastInsertId () {
        $query = "select last_insert_id() as id";
        $sth = mysql_query($query) or die('Query failed: ' . mysql_error() .
                "\nQuery was: $query");
        $row = mysql_fetch_array($sth, MYSQL_ASSOC);
        $id = $row['id'];
        mysql_free_result($sth);
        return $id;
    }


    function logUserAction ($action) {
		$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';

        if (isset($_SESSION['user']) && $_SESSION['user'] != '') {
            $user = $_SESSION['user'];
        } else if (isset($_POST['user']) && $_POST['user'] != '') {
            $user = $_POST['user'];
        } else if (isset($_GET['user']) && $_GET['user'] != '') {
            $user = $_GET['user'];
        } else if (isset($_SERVER['REMOTE_ADDR'])) {
            $user = "ip=$ip";
        } else {
            $user = '?';
        }

        return sqlInsert('user_actions',
					     array('user'       => $user,
							   'ip_address' => $ip,
							   'action'     => $action));
    }

    function nak ($msg, $logMsg = '') {
        if ($logMsg != 'none') {
            logUserAction($logMsg != '' ? $logMsg : $msg);
        }
        header('HTTP/1.1 500 Internal Server Booboo2');
        // header('Content-Type: application/json');
        die($msg);
    }

    function ack ($msg, $logMsg = '') {
        if ($logMsg != 'none') {
            logUserAction($logMsg != '' ? $logMsg : $msg);
        }
        die($msg);
    }

    # nli - not logged in
    function nli ($src) {
        nak("Not logged in", "Not logged in ($src) ip=" . $_SERVER['REMOTE_ADDR']);
    }
?>
