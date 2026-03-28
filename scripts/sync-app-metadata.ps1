$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$metaPath = Join-Path $root "app.metadata.json"
$capacitorPath = Join-Path $root "capacitor.config.json"
$plistPath = Join-Path $root "ios\App\App\Info.plist"
$pbxprojPath = Join-Path $root "ios\App\App.xcodeproj\project.pbxproj"

if (-not (Test-Path $metaPath)) {
    throw "Metadata file not found: $metaPath"
}

$meta = Get-Content $metaPath -Raw | ConvertFrom-Json

if (Test-Path $capacitorPath) {
    $capacitor = Get-Content $capacitorPath -Raw | ConvertFrom-Json
    $capacitor.appId = $meta.appCode
    $capacitor.appName = $meta.appName
    $capacitor | ConvertTo-Json -Depth 10 | Set-Content $capacitorPath -Encoding UTF8
}

if (Test-Path $plistPath) {
    [xml]$plist = Get-Content $plistPath -Raw
    $dict = $plist.plist.dict
    for ($i = 0; $i -lt $dict.ChildNodes.Count; $i++) {
        $node = $dict.ChildNodes[$i]
        if ($node.Name -eq 'key' -and $node.InnerText -eq 'CFBundleDisplayName') {
            $dict.ChildNodes[$i + 1].InnerText = $meta.ios.displayName
        }
        if ($node.Name -eq 'key' -and $node.InnerText -eq 'CFBundleShortVersionString') {
            $dict.ChildNodes[$i + 1].InnerText = $meta.version
        }
        if ($node.Name -eq 'key' -and $node.InnerText -eq 'CFBundleVersion') {
            $dict.ChildNodes[$i + 1].InnerText = $meta.buildNumber
        }
    }
    $plist.Save($plistPath)
}

if (Test-Path $pbxprojPath) {
    $pbxproj = Get-Content $pbxprojPath -Raw
    $pbxproj = $pbxproj -replace 'PRODUCT_BUNDLE_IDENTIFIER = [^;]+;', "PRODUCT_BUNDLE_IDENTIFIER = $($meta.appCode);"
    $pbxproj = $pbxproj -replace 'MARKETING_VERSION = [^;]+;', "MARKETING_VERSION = $($meta.version);"
    $pbxproj = $pbxproj -replace 'CURRENT_PROJECT_VERSION = [^;]+;', "CURRENT_PROJECT_VERSION = $($meta.buildNumber);"
    Set-Content $pbxprojPath $pbxproj -Encoding UTF8
}

Write-Host "App metadata synced."
