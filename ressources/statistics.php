<?php
ini_set('display_errors', 1); error_reporting(E_ERROR);
//database connection
include('dbconnect.php');

$field = $_GET['field'] ? $_GET['field'] : DB['fields'][2];

$img = [
	'width' => PERIOD,
	'height' => 300,
];
$max['hits'] = 100;
//create image and assign colors
$image = imagecreatetruecolor($img['width'], $img['height']);
$color = [
	'background' => imagecolorallocate($image, 255, 255, 255),
	'scale' => imagecolorallocate($image, 180, 180, 180),
	'text' => imagecolorallocate($image, 100, 100, 100),
	'trend' => imagecolorallocate($image, 23, 126, 229)
];
imagefilledrectangle($image, 0, 0, $img['width'], $img['height'], $color['background']);

//draw data
$q_stat = $mysqli->query('SELECT hits FROM (SELECT SUBSTR(Datum,1,10) AS Datum, AVG(' . $field . ')*50 AS hits FROM ' . DB['table'] . ' WHERE id>1 AND ' . $field . ' REGEXP "^-?[0-9]+$" GROUP BY SUBSTR(Datum,1,10) ORDER BY SUBSTR(Datum,1,10) DESC LIMIT ' . $img['width'] . ') AS pre ORDER BY Datum');
$col['px'] = $img['width'] / $q_stat->num_rows;
$col['num'] = $avg = 0;
while ($stat = $q_stat->fetch_assoc()){
	// draw daily mean
	imagefilledrectangle($image,
		$col['num'] * $col['px'], $img['height'] - $img['height'] / $max['hits'] * $stat['hits'],
		$col['num'] * $col['px'] + $col['px'], $img['height'] - $img['height'] / $max['hits'] * $stat['hits'] + 1,
		$color['scale']);

	// draw trend
	$avg = $avg ? (($avg * ($col['num'] - 1) + $stat['hits']) / $col['num']) : $stat['hits'];
	imageline($image,
		$col['num'] * $col['px'], $img['height'] - $img['height'] / $max['hits'] * $avg,
		$col['num'] * $col['px'] + $col['px'], $img['height'] - $img['height'] / $max['hits'] * $avg,
		$color['trend']);

	$col['num']++;
}
// draw scale
imageline($image, 0, $img['height'] - 1, $img['width'], $img['height'] - 1, $color['scale']);
imageline($image, 0, 0, 0, $img['height'] - 1, $color['scale']);
$initscale = 10 * floor($max['hits'] / 10);
for ($i = $initscale; $i >= 1; $i -= $initscale / 5){
	imagestring($image, 5, 10, $img['height'] - $img['height'] / $max['hits'] * $i + 10, $img['font'], $i . ' %', $color['text']);
}

// captions
imagestring($image, 5, 180, $img['height'] - 36, 'Bewertungen der letzten ' . $col['num'] . ' Tage', $color['text']);
imagestring($image, 5, 180, $img['height'] - 16, 'Bewertungstendenz ' . $field, $color['trend']);

header('Content-type: image/png');
if ($_GET['stream']) header('Content-Disposition: attachment; filename=rating_' . $field . '_' . date('d-m-Y_H-i', time()) . '.png');
imagepng($image, NULL, 0);
imagedestroy($image);

?>