$checks = @(
    @{ Name = "package.json"; Path = "package.json" },
    @{ Name = "capacitor.config.json"; Path = "capacitor.config.json" },
    @{ Name = "iOS workflow"; Path = ".github/workflows/ios-build.yml" },
    @{ Name = "iOS release workflow"; Path = ".github/workflows/ios-release.yml" },
    @{ Name = "ExportOptions"; Path = ".github/ios/ExportOptions-AppStore.plist" },
    @{ Name = "iOS Xcode project"; Path = "ios/App/App.xcodeproj/project.pbxproj" },
    @{ Name = "iOS Info.plist"; Path = "ios/App/App/Info.plist" }
)

$failed = $false

Write-Host ""
Write-Host "iOS release hazırlık kontrolü"
Write-Host ""

foreach ($check in $checks) {
    if (Test-Path $check.Path) {
        Write-Host "[OK] $($check.Name)"
    } else {
        Write-Host "[EKSİK] $($check.Name) -> $($check.Path)"
        $failed = $true
    }
}

Write-Host ""
Write-Host "GitHub Secrets kontrol listesi:"
Write-Host "- BUILD_CERTIFICATE_BASE64"
Write-Host "- P12_PASSWORD"
Write-Host "- BUILD_PROVISION_PROFILE_BASE64"
Write-Host "- KEYCHAIN_PASSWORD"
Write-Host "- IOS_TEAM_ID"
Write-Host "- APPSTORE_CONNECT_KEY_ID"
Write-Host "- APPSTORE_CONNECT_ISSUER_ID"
Write-Host "- APPSTORE_CONNECT_API_KEY_BASE64"

if ($failed) {
    exit 1
}

exit 0
