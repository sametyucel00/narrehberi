import sirv from 'sirv';
import { createServer } from 'http';
import crypto from 'crypto';
import { StringDecoder } from 'string_decoder';

const port = Number(process.env.PORT) || 8080;
const host = '0.0.0.0';
const serve = sirv('dist', { single: true });

// PayTR Credentials (SHOULD BE IN ENV VARS)
const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || '668220';
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'ZW9Qz8d98Fiy5QMf';
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'pyRB9jurxmiKWee6';

const test_mode = 1;

const server = createServer((req, res) => {
  // --- API Routes ---
  if (req.url === '/api/paytr-token' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const params = JSON.parse(body);
        const { amount, email, user_name, user_address, user_phone, merchant_oid, basket } = params;

        const user_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const timeout_limit = "30";
        const debug_on = "1";
        const no_installment = "0";
        const max_installment = "0";
        const currency = "TL";

        const user_basket = Buffer.from(JSON.stringify(basket)).toString('base64');
        const payment_amount = Math.round(amount * 100); // Kuruş cinsinden

        // PAYTR TOKEN ALGORİTMASI: 
        // hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode;
        // token = base64_encode(hmac_sha256(hash_str + merchant_salt, merchant_key))

        const hash_str = MERCHANT_ID + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode;
        const paytr_token = crypto.createHmac('sha256', MERCHANT_KEY).update(hash_str + MERCHANT_SALT).digest('base64');

        const post_data = {
          merchant_id: MERCHANT_ID,
          user_ip,
          merchant_oid,
          email,
          payment_amount,
          paytr_token,
          user_basket,
          debug_on,
          no_installment,
          max_installment,
          user_name,
          user_address,
          user_phone,
          merchant_ok_url: `${req.headers.origin}/payment-success`,
          merchant_fail_url: `${req.headers.origin}/payment-fail`,
          timeout_limit,
          currency,
          test_mode
        };

        const paytr_res = await fetch('https://www.paytr.com/odeme/api/get-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(post_data).toString()
        });

        const data = await paytr_res.json();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ status: 'failed', reason: err.message }));
      }
    });
    return;
  }

  if (req.url === '/api/paytr-callback' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const post = new URLSearchParams(body);
      const hash = post.get('hash');
      const merchant_oid = post.get('merchant_oid');
      const status = post.get('status');
      const total_amount = post.get('total_amount');

      // Verify Hash
      const hash_str = merchant_oid + MERCHANT_SALT + status + total_amount;
      const expected_hash = crypto.createHmac('sha256', MERCHANT_KEY).update(hash_str).digest('base64');

      if (hash !== expected_hash) {
        return res.end('PAYTR hash mismatch');
      }

      if (status === 'success') {
        // BURADA: Siparişi güncelle veya kullanıcı bakiyesini artır
        console.log(`Payment Success: ${merchant_oid}`);
      } else {
        console.log(`Payment Failed: ${merchant_oid}`);
      }

      res.end('OK');
    });
    return;
  }

  // --- Static Files ---
  serve(req, res, () => {
    res.statusCode = 404;
    res.end();
  });
});

server.listen(port, host, () => {
  console.log(`Nar Rehberi listening on http://${host}:${port}`);
});

