# Nar Rehberi

Nar Rehberi, Vite tabanl&#305; web uygulamas&#305; ve Capacitor ile paketlenen mobil kabu&#287;a sahip bir projedir.

## Gereksinimler

- Node.js 22+
- npm
- iOS geli&#351;tirme i&#231;in macOS + Xcode

## Web Geli&#351;tirme

```bash
npm run utf8:on
npm ci
npm run dev
```

Prod build:

```bash
npm run utf8:on
npm run build
```

## UTF-8 Zorunlulu&#287;u

Bu projede T&#252;rk&#231;e karakterlerin bozulmamas&#305; i&#231;in UTF-8 kullan&#305;m&#305; zorunludur.

Windows PowerShell oturumunu UTF-8 ile ba&#351;latmak i&#231;in:

```bash
npm run utf8:on
```

Bu komut &#351;unlar&#305; haz&#305;rlar:

1. `chcp 65001` ile uyumlu UTF-8 oturum beklentisi
2. PowerShell &#231;&#305;kt&#305; encoding ayar&#305;
3. `Out-File`, `Set-Content` ve `Add-Content` i&#231;in UTF-8 varsay&#305;lan&#305;
4. T&#252;rk&#231;e karakterlerin korunaca&#287;&#305; terminal &#231;&#305;kt&#305;s&#305;

Ek olarak `dev`, `build`, `lint`, `preview`, `start` ve `network` komutlar&#305; UTF-8 sarmalay&#305;c&#305;s&#305; &#252;zerinden &#231;al&#305;&#351;&#305;r.
Bu sayede g&#252;nl&#252;k geli&#351;tirme ak&#305;&#351;&#305;nda terminal encoding ayar&#305; otomatik uygulan&#305;r.

## Capacitor

Projede Capacitor yap&#305;land&#305;rmas&#305; haz&#305;rd&#305;r.

&#214;nemli komutlar:

```bash
npm run cap:sync
npm run cap:copy
npm run cap:ios:add
npm run cap:ios:sync
npm run cap:ios:open
npm run ios:secrets:help
npm run ios:release:check
```

## iOS Yerel Ak&#305;&#351;&#305;

&#304;lk kurulum:

```bash
npm ci
npm run build
npm run cap:ios:add
npm run cap:ios:sync
```

Sonraki g&#252;ncellemelerde:

```bash
npm run cap:ios:sync
```

Ard&#305;ndan:

```bash
npm run cap:ios:open
```

Xcode i&#231;inde:

1. `App` target se&#231;
2. `Signing & Capabilities` alt&#305;nda tak&#305;m bilgini ekle
3. simulator veya ger&#231;ek cihaz se&#231;
4. build al

## GitHub Actions iOS Build

Workflow dosyas&#305;:

- [C:\Users\Samet\Downloads\NarRehberi4\NarRehberi4\.github\workflows\ios-build.yml](C:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/.github/workflows/ios-build.yml)
- [C:\Users\Samet\Downloads\NarRehberi4\NarRehberi4\.github\workflows\ios-release.yml](C:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/.github/workflows/ios-release.yml)

Bu workflow &#351;unlar&#305; yapar:

1. `npm ci`
2. `npm run build`
3. `npx cap add ios` (`ios` klas&#246;r&#252; yoksa)
4. `npx cap sync ios`
5. `pod install`
6. iOS simulator i&#231;in unsigned build
7. artifact upload

## iOS Release / TestFlight Haz&#305;rl&#305;&#287;&#305;

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

Export ayar&#305;:

- [C:\Users\Samet\Downloads\NarRehberi4\NarRehberi4\.github\ios\ExportOptions-AppStore.plist](C:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/.github/ios/ExportOptions-AppStore.plist)
- secret haz&#305;rlama notu: [C:\Users\Samet\Downloads\NarRehberi4\NarRehberi4\.github\IOS-SECRETS.md](C:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/.github/IOS-SECRETS.md)

Yard&#305;mc&#305; scriptler:

- secret haz&#305;rlama yard&#305;m&#305;: `npm run ios:secrets:help`
- release haz&#305;rl&#305;k kontrol&#252;: `npm run ios:release:check`

Not:

- Bu workflow IPA export eder.
- App Store Connect secret'lar&#305; varsa TestFlight y&#252;kleme de yapar.

## Notlar

- CI hatt&#305; &#351;u an simulator build &#252;retir.
- App Store veya TestFlight i&#231;in Apple signing secret'lar&#305; ayr&#305;ca eklenmelidir.
- Web varl&#305;klar&#305; `dist/` i&#231;ine derlenir ve Capacitor iOS projesine kopyalan&#305;r.