<?php
header('Content-Type: application/json');

// PayTR Config
require_once('../paytr_config.php');

// Credentials trim fix
$merchant_id = trim($merchant_id);
$merchant_key = trim($merchant_key);
$merchant_salt = trim($merchant_salt);

// Read input
$inputJSON = file_get_contents('php://input');
$params = json_decode($inputJSON, TRUE);

if (!$params) {
    http_response_code(400);
    echo json_encode(['status' => 'failed', 'reason' => 'JSON hatası veya boş veri.']);
    exit;
}

$amount = $params['amount'];
$email = $params['email'];
$user_name = $params['user_name'];
$user_address = $params['user_address'];
$user_phone = $params['user_phone'];
$merchant_oid = $params['merchant_oid'];
$basket = $params['basket'];

// --- GELİŞMİŞ IP TESPİTİ (Hostinger / Proxy uyumlu) ---
if (isset($_SERVER["HTTP_CF_CONNECTING_IP"])) {
    $user_ip = $_SERVER["HTTP_CF_CONNECTING_IP"];
} elseif (isset($_SERVER["HTTP_X_FORWARDED_FOR"])) {
    $user_ip = explode(',', $_SERVER["HTTP_X_FORWARDED_FOR"])[0];
} else {
    $user_ip = $_SERVER['REMOTE_ADDR'] ?: '127.0.0.1';
}

$timeout_limit = "30";
$debug_on = "1";
$test_mode = 0; // Test modu kapalı (Live aktif)
$no_installment = "0";
$max_installment = "0";
$currency = "TL";

$user_basket = base64_encode(json_encode($basket));
$payment_amount = round($amount * 100);

$hash_str = $merchant_id . $user_ip . $merchant_oid . $email . $payment_amount . $user_basket . $no_installment . $max_installment . $currency . $test_mode;
$paytr_token = base64_encode(hash_hmac('sha256', $hash_str . $merchant_salt, $merchant_key, true));

$post_data = array(
    'merchant_id' => $merchant_id,
    'user_ip' => $user_ip,
    'merchant_oid' => $merchant_oid,
    'email' => $email,
    'payment_amount' => $payment_amount,
    'paytr_token' => $paytr_token,
    'user_basket' => $user_basket,
    'debug_on' => $debug_on,
    'no_installment' => $no_installment,
    'max_installment' => $max_installment,
    'user_name' => $user_name,
    'user_address' => $user_address,
    'user_phone' => $user_phone,
    'merchant_ok_url' => 'https://' . $_SERVER['HTTP_HOST'] . '/payment-success',
    'merchant_fail_url' => 'https://' . $_SERVER['HTTP_HOST'] . '/payment-fail',
    'timeout_limit' => $timeout_limit,
    'currency' => $currency,
    'test_mode' => $test_mode
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://www.paytr.com/odeme/api/get-token");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
$result = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(['status' => 'failed', 'reason' => curl_error($ch)]);
} else {
    echo $result;
}
curl_close($ch);
?>