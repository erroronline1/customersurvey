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
    'Meinung' => $payload->general,
    'Hilfsmittel' => urldecode($payload->text3),
    'Vorschlag' => urldecode($payload->text2),
    'Lob' => urldecode($payload->text1),
    'Erreichbarkeit' => $payload->query1,
    'Bearbeitungszeit' => $payload->query2,
    'Freundlichkeit' => $payload->query3,
    'Kompetenz' => $payload->query4
];

if ($_SERVER['REQUEST_METHOD'] == 'POST'){
    
    // prepare and execute sql query
    foreach($legacy_translate as $key=>$value){
        $insertion .= ', "' . $value . '"';
    }
    $mysqli->query('INSERT INTO kza VALUES (NULL, NOW(), ' . substr($insertion, 2) . ')');
    
    //return current row-id
    echo $mysqli->insert_id ? : null;
}
elseif ($_SERVER['REQUEST_METHOD'] == 'PUT'){
    // prepare and execute sql query
    foreach($legacy_translate as $key=>$value){
        $update .= ', ' . $key . '="' . $value . '"';
    }
    $mysqli->query('UPDATE kza SET ' . substr($update, 2) . ' WHERE id=' . $payload->id);
    
    //return current row-id
    echo $payload->id ? : null;

}
elseif ($_SERVER['REQUEST_METHOD'] == 'GET'){
}

?>