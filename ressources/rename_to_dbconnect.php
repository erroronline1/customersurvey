<?php
$db[0]=[
	'server' => '127.0.0.1', // or localhost whatever runs more smoothly
	'user' => 'root',
	'password' => '**********',
	'name' => 'customersurvey',
	'table' => 'kza',
	'fields' => [
		// in order of appearance according to database, first item should be key, second date 
		'id', 'Datum', 'Meinung', 'Hilfsmittel', 'Vorschlag', 'Lob', 'Erreichbarkeit', 'Bearbeitungszeit', 'Freundlichkeit', 'Kompetenz'
	]
];

const PERIOD = 365 * 2;
$mysqli = mysqli_connect($db[0]['server'], $db[0]['user'], $db[0]['password'], $db[0]['name']); if (mysqli_connect_errno($mysqli)) echo "Failed to connect to MySQL: ".mysqli_connect_error();
?>