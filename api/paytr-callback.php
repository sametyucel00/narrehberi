<?php
// PayTR Config
include('../paytr_config.php');

$post = $_POST;

if (!$post)
    exit('no post data');

$merchant_oid = $post['merchant_oid'];
$status = $post['status'];
$total_amount = $post['total_amount'];
$hash = $post['hash'];

// Hash Doğrulama
$hash_str = $merchant_oid . $merchant_salt . $status . $total_amount;
$expected_hash = base64_encode(hash_hmac('sha256', $hash_str, $merchant_key, true));

if ($hash !== $expected_hash) {
    exit('PAYTR hash mismatch');
}

if ($status === 'success') {
    // BURADA: Siparişi güncelle veya kullanıcı bakiyesini artır
    // Firebase Admin PHP SDK veya bir veritabanı kullanılabilir.
    // Şimdilik sadece OK diyoruz.
    file_put_contents('payment_log.txt', "Payment Success: $merchant_oid\n", FILE_APPEND);
} else {
    file_put_contents('payment_log.txt', "Payment Failed: $merchant_oid\n", FILE_APPEND);
}

echo "OK";
?>