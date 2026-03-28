GitHub'a yüklenecek temiz iOS paketi.

Bu klasörde şunlar var:
- .github workflow ve iOS export dosyaları
- ios native proje
- gerekli scripts
- Apple giriş ve push için kaynak kod değişiklikleri
- package/capacitor/index metadata dosyaları

Bilerek dahil edilmeyenler:
- index.js
- public/index.js
- GoogleService-Info.plist (gizli olduğu için)
- geçici _tmp_* dosyaları
- zip/export artıkları

GoogleService-Info.plist için:
- public repoya yükleme
- bunun yerine GitHub Secret kullan: GOOGLE_SERVICE_INFO_PLIST_BASE64

Push edilecek branch/commit:
- branch: codex/snapshot-2026-03-25-review
- commit: f1b73a2
