param()

$root = Split-Path -Parent $PSScriptRoot
$plistPath = Join-Path $root "ios\App\App\GoogleService-Info.plist"
$templatePath = Join-Path $root "ios\App\App\GoogleService-Info.plist.template"
$infoPath = Join-Path $root "ios\App\App\Info.plist"
$packageJson = Join-Path $root "package.json"

$problems = @()

if (-not (Test-Path $plistPath)) {
  $problems += "GoogleService-Info.plist eksik. Konum: ios/App/App/GoogleService-Info.plist"
}

if (-not (Test-Path $templatePath)) {
  $problems += "GoogleService-Info.plist.template eksik."
}

if (-not (Test-Path $infoPath)) {
  $problems += "Info.plist bulunamadı."
}

if (-not (Test-Path $packageJson)) {
  $problems += "package.json bulunamadı."
}

Write-Host "iOS Firebase Hazırlık Kontrolü" -ForegroundColor Cyan
Write-Host "--------------------------------"

if ($problems.Count -gt 0) {
  foreach ($problem in $problems) {
    Write-Host "Eksik: $problem" -ForegroundColor Yellow
  }
  Write-Host ""
  Write-Host "Manuel yapılacaklar:" -ForegroundColor Magenta
  Write-Host "1. Firebase iOS projesinden GoogleService-Info.plist indir"
  Write-Host "2. Dosyayı ios/App/App/ altına koy"
  Write-Host "3. Xcode > Signing & Capabilities içinde:"
  Write-Host "   - Sign In with Apple"
  Write-Host "   - Push Notifications"
  Write-Host "   - Background Modes > Remote notifications"
  exit 1
}

Write-Host "Temel iOS Firebase dosyaları mevcut görünüyor." -ForegroundColor Green
exit 0
