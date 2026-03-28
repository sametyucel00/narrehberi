# iOS Release Secrets

`iOS Release` workflow'unun imzalı build ve TestFlight yükleme alabilmesi için aşağıdaki GitHub Actions secret'larını ekleyin.

## Zorunlu signing secret'ları

- `BUILD_CERTIFICATE_BASE64`
  - `.p12` sertifika dosyasının Base64 hali
- `P12_PASSWORD`
  - `.p12` export şifresi
- `BUILD_PROVISION_PROFILE_BASE64`
  - `.mobileprovision` dosyasının Base64 hali
- `KEYCHAIN_PASSWORD`
  - CI keychain için geçici parola
- `IOS_TEAM_ID`
  - Apple Developer Team ID
- `GOOGLE_SERVICE_INFO_PLIST_BASE64`
  - Firebase iOS için `GoogleService-Info.plist` dosyasının Base64 hali
  - Bu secret varsa workflow build sırasında dosyayı otomatik oluşturur

## TestFlight upload secret'ları

- `APPSTORE_CONNECT_KEY_ID`
- `APPSTORE_CONNECT_ISSUER_ID`
- `APPSTORE_CONNECT_API_KEY_BASE64`
  - App Store Connect `.p8` private key dosyasının Base64 hali

## PowerShell ile Base64 üretme

### `.p12`

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\certificate.p12"))
```

### `.mobileprovision`

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\profile.mobileprovision"))
```

### `.p8`

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\AuthKey_ABC123XYZ.p8"))
```

### `GoogleService-Info.plist`

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\GoogleService-Info.plist"))
```

## Not

- TestFlight yükleme adımı yalnızca üç App Store Connect secret'ı da varsa çalışır.
- Bu secret'lar yoksa workflow yine archive ve IPA export üretir.
