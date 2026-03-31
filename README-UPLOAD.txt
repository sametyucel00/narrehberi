GitHub'a iOS build/release için yüklenecek dosyalar:

1. index.html
2. capacitor.config.json
3. app.metadata.json
4. .github/workflows/ios-build.yml
5. .github/workflows/ios-release.yml
6. .github/ios/ExportOptions-AppStore.plist
7. ios/App/App/Info.plist
8. ios/App/App.xcodeproj/project.pbxproj

Yükleme sonrası:
- önce iOS Build
- sonra iOS Release

Notlar:
- Bundle ID: com.narrehberi.app
- Support URL / Privacy URL bu paketin parçası değil
- GoogleService-Info.plist public repoya koyma
