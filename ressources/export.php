<?php 
ini_set('display_errors', 1); error_reporting(E_ERROR);
include('dbconnect.php');

// mysql export
if ($_GET['type'] == 'sql'){
	$ressource = $mysqli->query("SHOW CREATE TABLE `" . DB['table'] . "`");
	if ($ressource) {
		$output .= "DROP TABLE `" . DB['table'] . "`;\r\n"; 
		$create = $ressource->fetch_array(MYSQLI_ASSOC);
		$create['Create Table'] .= ";";
		$output .= str_replace("\n", "", $create['Create Table']) . "\r\n";
	}
	$q_save = $mysqli->query("SELECT * FROM ".DB['table']);
	$fieldnames = 0;
	$fields = '';
	$values = '';
	while ($save = $q_save->fetch_assoc()){
		$temp_values = '';
		foreach($save as $key => $value){
			if ($fieldnames < 1){
				$fields .= ", " . $key;				
			}
			$temp_values .= ", '" . preg_replace("/\n|\r\n/", "\\n", utf8_decode(addslashes($value))) . "'";
		}
		$values .= ",(" . substr($temp_values, 1) . ")\n";
		$fieldnames++;
	}
	if ($values) $output .= "INSERT INTO " . DB['table'] . "\n(" . substr($fields, 1) . ")\nVALUES\n" . substr($values, 1) . ";\r\n";
	$filename = 'customer_survey_database_export_';
}

// csv export
elseif ($_GET['type'] == 'csv'){
	$t_save = $mysqli->query("SELECT * FROM " . DB['table'] . " ORDER BY " . DB['fields'][0]);
	$fieldnames = 0;
	$fields = "";
	$values = "";
	while ($save = $t_save->fetch_assoc()){
		foreach($save as $key => $value){
			if ($fieldnames < 1){ $fields .= $key . ";";} //headers
			else $values .= preg_replace("/\n|\r\n/", " ", utf8_decode(addslashes($value))) . ";";
		}
		$values .= "\n";
		$fieldnames++;
	}
	$output .= substr($fields, 0, -1);
	if ($values) $output .= substr($values, 0, -1);
	$filename = "customer_survey_raw_data_";
}

// rtf export
// yeah i know this is a bit obfuscated with the relative column names according to dbconnect.php
elseif ($_GET['type'] == 'rtf'){
	$output = "{\\rtf1 \\ansi\\ansicpg1252\\deff0\\nouicompat";

	// total and main review
	$total = $mysqli->query("SELECT
		MIN(" . DB['fields'][1] . ") AS 'from',
		MAX(" . DB['fields'][1] . ") AS 'to',
		COUNT(" . DB['fields'][0] . ") AS 'count',
		AVG(Meinung) AS 'avg' FROM " . DB['table'] . "
		WHERE " . DB['fields'][0] . ">1")->fetch_assoc();
	$output .="{\b Kundenzufriedenheitsanalyse basierend auf den Angaben von " . substr($total['from'], 0, 10) . " bis " . substr($total['to'], 0, 10) . "} \par {\b Gesamteinschätzung:} "
			. "\line Von " . substr($total['from'], 0, 10) . " bis " . substr($total['to'], 0, 10) . " ergeben " . $total['count'] . " allgemeine Bewertungen eine Zufriedenheit von " . round($total['avg']*50, 2) . " %. \par ";

	$img = bin2hex(file_get_contents('http://localhost/customersurvey/ressources/statistics.php'));
	$output .= "\par {\pict\pngblip\picw" . PERIOD * 10 ."\pich" . 300 * 10 . "\picwgoal" . PERIOD * 10 . "\pichgoal" . 300 * 10 . "\bin " . $img . "} \line \par";

	// topic related statistics
	for ($topic = 6; $topic < 10; $topic++){
		$total=$mysqli->query("SELECT
			MIN(" . DB['fields'][1] . ") AS 'from',
			MAX(" . DB['fields'][1] . ") AS 'to',
			COUNT(" . DB['fields'][0] . ") AS 'count',
			AVG(" . DB['fields'][$topic] . ") AS 'avg'
			FROM " . DB['table'] . " WHERE " . DB['fields'][$topic] . "!=''")->fetch_assoc();
		if ($total['count']){
			$output .= "\par In der Fragestellung {\i " . DB['fields'][$topic] . "} "
					. "\line Von " . substr($total['from'], 0, 10) . " bis " . substr($total['to'], 0, 10) . " ergeben " . $total['count'] . " abgegebene Bewertungen eine Zufriedenheit von " . round($total['avg']*50, 2) . " %. \par ";

		$img = bin2hex(file_get_contents('http://localhost/customersurvey/ressources/statistics.php?field=' . DB['fields'][$topic]));
		$output .= "\par {\pict\pngblip\picw" . PERIOD * 10 ."\pich" . 300 * 10 . "\picwgoal" . PERIOD * 10 . "\pichgoal" . 300 * 10 . "\bin " . $img . "} \line \par";
	}
		else $output .= "{\i " . DB['fields'][$topic] . "} wurde noch nicht beantwortet \line ";
	}
	
	// text inputs
	$output .= "{\b Vorschläge und Lob}";
	$q_comments = $mysqli->query("SELECT * FROM " . DB['table'] . " WHERE " . DB['fields'][4] . "!='' OR " . DB['fields'][5] . "!=''");
	while ($comments = $q_comments->fetch_assoc()){
		$output .= "\par \line {\b ".substr($comments[DB['fields'][1]],0,10)."} ".$comments[DB['fields'][3]]." \line ";
		foreach ($comments as $key => $value){
			if ($key == DB['fields'][0] || $key == DB['fields'][1] || $key == DB['fields'][2] || $key == DB['fields'][3]) ;
			elseif (($key == DB['fields'][4] || $key == DB['fields'][5]) && $value!='') $output .= $key . ": " . $value . "\line ";	
			elseif ($value != '') $output .= " / " . $key . ": " . $value;	
		}
		$output .= " / Meinung: " . $comments[DB['fields'][2]];
	}
	$output .= "\par \line {\b Kriterien} ";
	$output .= "\line Die Auswertung findet automatisch statt. Alle Angaben werden automatisch von der ersten bis zur letzten Antwort ausgewertet. Die Grafiken fassen die Ergebnisse eines Tages in einer Spalte zusammen und stellen sowohl die Tages-Durchnittswerte, als auch - farblich abgesetzt - die Durchschnittsergebnisse im Zeitverlauf dar, um so eine Tendenz zu verdeutlichen. Es werden jeweils die Tage der Meinungserhebung gewertet. Der längste Darstellungszeitraum deckt aktuell ". PERIOD." Tage ab (dann 1 Pixel pro Tag). "
			. "\line Jede Angabe durch Wahl eines Smileys trägt in die Datenbank einen Wert ein, wobei :) 2 Punkten, :| 1 Punkt und :( 0 Punkten entspricht. In der Multiplikation mit 50 ergibt dies ein prozentuales Meinungsbild, welches weiterhin für die Durchschnittsberechungen zur Verfügung steht. Texteingaben erlauben darüber hinaus informative Kritik. Alle Eingaben sind grundsätzlich anonym, solange keine andersartigen aktiven Angaben erfolgen.";
	$output .= "}";
	$output = utf8_decode($output);
	$filename = "customer_survey_report_";

}

if ($type=="csv") header("Content-type: text/csv");
elseif ($type=="rtf") header("Content-type: text/rtf");
else header("Content-type: application/octet-stream");

header("Content-Disposition: attachment; filename=".$filename.date("Y-m-d_H-i",time()).".".$_GET['type']);
ob_end_flush();
ob_end_clean();
ob_start();	

echo $output;

ob_end_flush();
?>
