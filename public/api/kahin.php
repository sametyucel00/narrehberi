<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || !isset($data['prompt'])) {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

$apiKey = "AIzaSyAdg4hhar57GVIwzgIlBrdjuCFG0PrRPok";
$prompt = $data['prompt'];
// Google Search Grounding for v1beta if requested, or standard
$useSearch = isset($data['useSearch']) ? $data['useSearch'] : true;

$baseUrl = $useSearch 
    ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    : "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

$url = $baseUrl . "?key=" . $apiKey;

$payload = [
    "contents" => [
        [
            "parts" => [
                ["text" => $prompt]
            ]
        ]
    ]
];

if ($useSearch) {
    $payload["tools"] = [
        ["google_search_retrieval" => (object)[]]
    ];
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo json_encode(["status" => "error", "message" => "Curl Error: " . curl_error($ch)]);
} else {
    // Return the Gemini response directly
    echo $response;
}

curl_close($ch);
?>
