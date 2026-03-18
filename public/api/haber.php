<?php
header("Content-Type: application/xml; charset=utf-8");
header("Access-Control-Allow-Origin: *");

$url = "https://www.haberantalya.com/rss";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    header("HTTP/1.1 500 Internal Server Error");
    echo "Curl Error: " . curl_error($ch);
} elseif ($httpCode !== 200) {
    header("HTTP/1.1 $httpCode Error");
    echo "HTTP Error: $httpCode";
} else {
    echo $response;
}

curl_close($ch);
?>
