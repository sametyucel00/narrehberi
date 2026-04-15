# Mobil Build Rehberi

Bu repo Android ve iOS için GitHub Actions üzerinden build almaya hazırdır. Aşağıdaki kontrol listesi ile hangi akışın ne istediğini hızlıca görebilirsin.

## Android

Workflow:

- `.github/workflows/android-build.yml`

Üretilen çıktılar:

- Release APK
- Release AAB

GitHub Secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_GOOGLE_SERVICES_JSON_BASE64` (opsiyonel ama Firebase için önerilir)

Hazır değerler:

- `ANDROID_KEYSTORE_PASSWORD` = `oyunordusu`
- `ANDROID_KEY_ALIAS` = `key0`
- `ANDROID_KEY_PASSWORD` = `oyunordusu`

Base64 üretimi:

```powershell
chcp 65001 > $null
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\tam-yol\narrehberi.jks"))
```

```powershell
chcp 65001 > $null
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\tam-yol\google-services.json"))
```

Çalıştırma:

1. GitHub repo içinde `Actions > Android Build` aç
2. `Run workflow` seç
3. İş bitince `android-release-artifacts` altından `.apk` ve `.aab` indir

Not:

- Secret girilmezse workflow yine çalışabilir ama signed release yerine unsigned çıktı alırsın
- Play Store için signed `.aab` gerekir

## iOS

Workflow dosyaları:

- `.github/workflows/ios-build.yml`
- `.github/workflows/ios-release.yml`
- `.github/workflows/ios-release-safe.yml`

Akışlar:

- `iOS Build`: imzasız simulator build doğrulaması yapar
- `iOS Release`: archive, export ve gerekirse TestFlight yükleme yapar
- `iOS Release Safe`: release için temiz iOS proje üretip güvenli archive/export akışı çalıştırır

Temel kontrol komutu:

```powershell
chcp 65001 > $null
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8
npm run ios:release:check
```

Base64 hazırlama yardımcısı:

```powershell
chcp 65001 > $null
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8
npm run ios:secrets:help
```

Zorunlu iOS release secrets:

- `BUILD_CERTIFICATE_BASE64`
- `P12_PASSWORD`
- `BUILD_PROVISION_PROFILE_BASE64`
- `KEYCHAIN_PASSWORD`
- `IOS_TEAM_ID`

TestFlight için ek secrets:

- `APPSTORE_CONNECT_KEY_ID`
- `APPSTORE_CONNECT_ISSUER_ID`
- `APPSTORE_CONNECT_API_KEY_BASE64`

Firebase plist:

- `GOOGLE_SERVICE_INFO_PLIST_BASE64`
- Repo içinde `ios/App/App/GoogleService-Info.plist.template` varsa opsiyonel kullanılabilir

Build almadan önce iOS için hazır olması gerekenler:

1. `capacitor.config.json` içindeki `appId` doğru olmalı
2. Apple Developer tarafında aynı bundle id için provisioning profile hazırlanmış olmalı
3. Distribution certificate `.p12` olarak dışa aktarılmış olmalı
4. App Store Connect API key varsa TestFlight yükleme otomatik yapılabilir

Çalıştırma:

1. GitHub repo içinde `Actions > iOS Build` ile simulator build doğrula
2. Secretlar tamamsa `Actions > iOS Release Safe` çalıştır
3. Artifact içinden archive veya export paketini indir
4. TestFlight secretları tamamsa yükleme otomatik yapılır

## Kısa Sonuç

- Android tarafı GitHub üzerinden APK ve AAB üretecek şekilde hazır
- iOS tarafı build ve release workflow’larıyla hazır
- iOS release için Apple signing secretları olmadan IPA üretimi tamamlanmaz
