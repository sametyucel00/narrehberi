# iOS Apple Giriş ve Push Kurulum Notları

Bu projede kod tarafında hazır olanlar:
- Apple ile giriş akışı: `SRC/services/appleAuth.js`
- Auth ekranında Apple butonu: `SRC/components/AuthGateway.jsx`
- Native push izin/kayıt akışı: `SRC/services/pushNotifications.js`
- Oturum açınca push token kaydı: `SRC/App.jsx`
- iOS native plugin senkronu tamamlandı: `@capacitor/push-notifications`

## Hâlâ manuel yapılması gerekenler

1. Xcode > Signing & Capabilities
- Sign In with Apple
- Push Notifications
- Background Modes
- Background Modes > Remote notifications

2. Firebase Console
- Authentication > Sign-in method > Apple etkinleştir
- Cloud Messaging > APNs Authentication Key yükle

3. Apple Developer
- App ID için Sign In with Apple açık olmalı
- App ID için Push Notifications açık olmalı
- APNs key oluşturulmalı

4. iOS proje dosyası
- `GoogleService-Info.plist` dosyasını `ios/App/App/` altına ekle
- İstersen GitHub secret olarak da verebilirsin: `GOOGLE_SERVICE_INFO_PLIST_BASE64`

5. Test
- Apple ile giriş butonuna bas
- iOS cihazda push izni ver
- Firestore `users/{uid}` dokümanında `push.sonToken` ve `deviceTokens` alanlarını kontrol et

## Beklenen veri alanları

Apple giriş sonrası:
- `rol: USER`
- `appleSignIn: true`
- `provider: apple`

Push izin/kayıt sonrası:
- `push.izin`
- `push.sonToken`
- `push.platform`
- `deviceTokens`

## Kontrol komutu

```bash
npm run ios:firebase:check
```
