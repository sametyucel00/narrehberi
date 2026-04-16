param()

$root = Split-Path -Parent $PSScriptRoot
$plistPath = Join-Path $root "ios\App\App\GoogleService-Info.plist"
$templatePath = Join-Path $root "ios\App\App\GoogleService-Info.plist.template"
$infoPath = Join-Path $root "ios\App\App\Info.plist"
$packageJson = Join-Path $root "package.json"

$problems = @()
$dotlessI = [char]305
$uuml = [char]252
$ouml = [char]246

if (-not (Test-Path $plistPath)) {
  $problems += "GoogleService-Info.plist eksik. Konum: ios/App/App/GoogleService-Info.plist"
}

if (-not (Test-Path $templatePath)) {
  $problems += "GoogleService-Info.plist.template eksik."
}

if (-not (Test-Path $infoPath)) {
  $problems += ("Info.plist bulunamad" + $dotlessI + ".")
}

if (-not (Test-Path $packageJson)) {
  $problems += ("package.json bulunamad" + $dotlessI + ".")
}

Write-Host ("iOS Firebase Haz" + $dotlessI + "rl" + $dotlessI + "k Kontrol" + $uuml) -ForegroundColor Cyan
Write-Host "--------------------------------"

if ($problems.Count -gt 0) {
  foreach ($problem in $problems) {
    Write-Host "Eksik: $problem" -ForegroundColor Yellow
  }
  Write-Host ""
  Write-Host ("Manuel yap" + $dotlessI + "lacaklar:") -ForegroundColor Magenta
  Write-Host "1. Firebase iOS projesinden GoogleService-Info.plist indir"
  Write-Host ("2. Dosyay" + $dotlessI + " ios/App/App/ alt" + $dotlessI + "na koy")
  Write-Host "3. Xcode > Signing & Capabilities icinde:"
  Write-Host "   - Sign In with Apple"
  Write-Host "   - Push Notifications"
  Write-Host "   - Background Modes > Remote notifications"
  exit 1
}

Write-Host ("Temel iOS Firebase dosyalar" + $dotlessI + " mevcut g" + $ouml + "r" + $uuml + "n" + $uuml + "yor.") -ForegroundColor Green
exit 0