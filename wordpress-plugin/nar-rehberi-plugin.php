<?php
/* Plugin Name: Nar Rehberi (React Integration) Description: Integrates Nar Rehberi React application into WordPress via a shortcode. Use [nar_rehberi] on any page. Version: 1.0 Author: Nar Rehberi */

function nar_rehberi_enqueue_scripts()
{
    // Assets are located in the plugin's folder
    $plugin_url = plugin_dir_url(__FILE__);

    // Enqueue Google Fonts
    wp_enqueue_style('nar-rehberi-google-fonts', 'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap', array(), null);

    // Enqueue Google Maps - Async/Defer handled via filter
    wp_enqueue_script('nar-rehberi-google-maps', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAM7CBdHZjn2zK7-llRH3iZZqjk21MPJQY&libraries=geometry,places', array(), null, false);

    // Enqueue the CSS
    wp_enqueue_style('nar-rehberi-style', $plugin_url . 'assets/index.css', array(), '1.0');

    // Enqueue the main JS - React Vite builds use type="module"
    wp_enqueue_script('nar-rehberi-js', $plugin_url . 'assets/index.js', array(), '1.0', true);
}

// Filter to add async, defer and crossorigin to Google Maps and type="module" to dynamic JS
add_filter('script_loader_tag', function ($tag, $handle, $src) {
    if ('nar-rehberi-google-maps' === $handle) {
        return '<script async defer crossorigin src="' . esc_url($src) . '"></script>';
    }
    if ('nar-rehberi-js' === $handle) {
        return '<script type="module" crossorigin src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js" onerror="document.getElementById(\'root\').innerHTML = \'HATA: JavaScript dosyası yüklenemedi. (404 veya CORS hatası olabilir)\';"></script>';
    }
    return $tag;
}, 10, 3);

// Shortcode to render the app
add_shortcode('nar_rehberi', function () {
    // Make sure scripts are enqueued ONLY when the shortcode is used
    nar_rehberi_enqueue_scripts();

    // The React app target div
    $output = '<div id="root" style="min-height:300px; display:flex; align-items:center; justify-content:center; background:#000; color:#fff; font-family:sans-serif;">Uygulama yükleniyor... Eğer bu yazı gitmiyorsa bir JavaScript hatası oluşmuş olabilir.</div>';

    // Add debug script to catch early module errors
    $output .= '<script>
        window.addEventListener("error", function(e) {
            console.error("Nar Rehberi Hata Yakalandı:", e);
            var root = document.getElementById("root");
            if(root && root.innerText.includes("Uygulama yükleniyor")) {
                root.innerHTML = "<div style=\'padding:20px; color:#ff6b6b\'><h3>Sistem Hatası Yakalandı</h3><p>" + e.message + "</p><small>Lütfen tarayıcı konsolunu kontrol edin.</small></div>";
            }
        }, true);
        console.log("Nar Rehberi Debug Aktif.");
    </script>';

    return $output;
});
