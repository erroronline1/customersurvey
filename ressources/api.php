<?php
ini_set('display_errors', 1); error_reporting(E_ERROR);
header('Content-type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');
//database connection
include('dbconnect.php');

// read incoming stream
$payload = json_decode(file_get_contents("php://input"));
// assign values to (legacy) db-columns
$legacy_translate=[
	$db[0]['fields'][2] => $payload->general,
	$db[0]['fields'][3] => urldecode($payload->text3),
	$db[0]['fields'][4] => urldecode($payload->text2),
	$db[0]['fields'][5] => urldecode($payload->text1),
	$db[0]['fields'][6] => $payload->query1,
	$db[0]['fields'][7] => $payload->query2,
	$db[0]['fields'][8] => $payload->query3,
	$db[0]['fields'][9] => $payload->query4
];

if ($_SERVER['REQUEST_METHOD'] == 'POST'){
	
	// prepare and execute sql query
	foreach($legacy_translate as $key=>$value){
		$insertion .= ', "' . $value . '"';
	}
	$mysqli->query('INSERT INTO ' . $db[0]['table'] . ' VALUES (NULL, NOW(), ' . substr($insertion, 2) . ')');
	
	//return current row-id
	echo $mysqli->insert_id ? : null;
}
elseif ($_SERVER['REQUEST_METHOD'] == 'PUT'){
	// prepare and execute sql query
	foreach($legacy_translate as $key=>$value){
		$update .= ', ' . $key . '="' . $value . '"';
	}
	$mysqli->query('UPDATE ' . $db[0]['table'] . ' SET ' . substr($update, 2) . ' WHERE id=' . $payload->id);
	
	//return current row-id
	echo $payload->id ? : null;

}
elseif ($_SERVER['REQUEST_METHOD'] == 'GET'){
}

?>