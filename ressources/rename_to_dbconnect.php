<?php
const DB = [
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

const ROOTDIR = 'http://localhost/customersurvey/';
const PERIOD = 365 * 2;
const CONFIRM_DELETION = '**********';
$mysqli = mysqli_connect(DB['server'], DB['user'], DB['password'], DB['name']); if (mysqli_connect_errno($mysqli)) echo "Failed to connect to MySQL: ".mysqli_connect_error();

// create table if not found
if (!$mysqli->query("SHOW TABLES LIKE '" . DB['table']. "';")->num_rows) {
	$mysqli->query("CREATE TABLE `" . DB['table']. "` (
		`" . DB['fields'][0]. "` int(11) NOT NULL AUTO_INCREMENT,
		`" . DB['fields'][1]. "` datetime NOT NULL,
		`" . DB['fields'][2]. "` int(11) NOT NULL,
		`" . DB['fields'][3]. "` tinytext CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
		`" . DB['fields'][4]. "` text CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
		`" . DB['fields'][5]. "` text CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
		`" . DB['fields'][6]. "` tinytext CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
		`" . DB['fields'][7]. "` tinytext CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
		`" . DB['fields'][8]. "` tinytext CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
		`" . DB['fields'][9]. "` tinytext CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
		PRIMARY KEY (`" . DB['fields'][0]. "`))
		ENGINE=MyISAM AUTO_INCREMENT=0 DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;");
}
?>