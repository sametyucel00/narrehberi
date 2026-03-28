# Nar Rehberi

Nar Rehberi, Vite tabanlı web uygulaması ve Capacitor ile paketlenen mobil kabuğa sahip bir projedir.

## Gereksinimler

- Node.js 22+
- npm
- iOS geliştirme için macOS + Xcode

## Web Geliştirme

```bash
npm ci
npm run dev
```

Prod build:

```bash
npm run build
```

## Capacitor

Projede Capacitor yapılandırması hazırdır.

Önemli komutlar:

```bash
npm run cap:sync
npm run cap:copy
npm run cap:ios:add
npm run cap:ios:sync
npm run cap:ios:open
npm run ios:secrets:help
npm run ios:release:check
```

## iOS Yerel Akışı

İlk kurulum:

```bash
npm ci
npm run build
npm run cap:ios:add
npm run cap:ios:sync
```

Sonraki güncellemelerde:

```bash
npm run cap:ios:sync
```

Ardından:

```bash
npm run cap:ios:open
```

Xcode içinde:

1. `App` target seç
2. `Signing & Capabilities` altında takım bilgini ekle
3. simulator veya gerçek cihaz seç
4. build al

## GitHub Actions iOS Build

Workflow dosyası:

- [C:\Users\Samet\Downloads\NarRehberi4\NarRehberi4\.github\workflows\ios-build.yml](C:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/.github/workflows/ios-build.yml)
- [C:\Users\Samet\Downloads\NarRehberi4\NarRehberi4\.github\workflows\ios-release.yml](C:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/.github/workflows/ios-release.yml)

Bu workflow şunları yapar:

1. `npm ci`
2. `npm run build`
3. `npx cap add ios` (`ios` klasörü yoksa)
4. `npx cap sync ios`
5. `pod install`
6. iOS simulator için unsigned build
7. artifact upload

## iOS Release / TestFlight Hazırlığı

Release workflow manuel tetiklenir.

Gerekli GitHub secrets:

- `BUILD_CERTIFICATE_BASE64`
- `P12_PASSWORD`
- `BUILD_PROVISION_PROFILE_BASE64`
- `KEYCHAIN_PASSWORD`
- `IOS_TEAM_ID`
- `APPSTORE_CONNECT_KEY_ID`
- `APPSTORE_CONNECT_ISSUER_ID`
- `APPSTORE_CONNECT_API_KEY_BASE64`

Export ayarı:

- [C:\Users\Samet\Downloads\NarRehberi4\NarRehberi4\.github\ios\ExportOptions-AppStore.plist](C:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/.github/ios/ExportOptions-AppStore.plist)
- secret hazırlama notu: [C:\Users\Samet\Downloads\NarRehberi4\NarRehberi4\.github\IOS-SECRETS.md](C:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/.github/IOS-SECRETS.md)

Yardımcı scriptler:

- secret hazırlama yardımı: `npm run ios:secrets:help`
- release hazırlık kontrolü: `npm run ios:release:check`

Not:

- Bu workflow IPA export eder.
- App Store Connect secret'ları varsa TestFlight yükleme de yapar.

## Notlar

- CI hattı şu an simulator build üretir.
- App Store veya TestFlight için Apple signing secret'ları ayrıca eklenmelidir.
- Web varlıkları `dist/` içine derlenir ve Capacitor iOS projesine kopyalanır.
