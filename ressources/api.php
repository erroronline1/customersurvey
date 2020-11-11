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
	DB['fields'][2] => $payload->general,
	DB['fields'][3] => urldecode($payload->text3),
	DB['fields'][4] => urldecode($payload->text2),
	DB['fields'][5] => urldecode($payload->text1),
	DB['fields'][6] => $payload->query1,
	DB['fields'][7] => $payload->query2,
	DB['fields'][8] => $payload->query3,
	DB['fields'][9] => $payload->query4
];

if ($_SERVER['REQUEST_METHOD'] == 'POST'){
	
	// prepare and execute sql query
	foreach($legacy_translate as $key=>$value){
		$insertion .= ', "' . $value . '"';
	}
	$mysqli->query('INSERT INTO ' . DB['table'] . ' VALUES (NULL, NOW(), ' . substr($insertion, 2) . ')');
	
	//return current row-id
	echo $mysqli->insert_id ? : null;
}
elseif ($_SERVER['REQUEST_METHOD'] == 'PUT'){
	// prepare and execute sql query
	foreach($legacy_translate as $key=>$value){
		$update .= ', ' . $key . '="' . $value . '"';
	}
	$mysqli->query('UPDATE ' . DB['table'] . ' SET ' . substr($update, 2) . ' WHERE id=' . $payload->id);
	
	//return current row-id
	echo $payload->id ? : null;

}
elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE'){
	if ($payload->confirm == CONFIRM_DELETION) {
		$mysqli->query('TRUNCATE TABLE ' . DB['table']);
		echo 1;
	}
	else echo http_response_code(401);
}
elseif ($_SERVER['REQUEST_METHOD'] == 'GET'){
}

?>