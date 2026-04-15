param(
    [string]$CertificatePath,
    [string]$ProvisionProfilePath,
    [string]$ApiKeyPath,
    [switch]$HelpMode
)

function Convert-FileToBase64 {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path $Path)) {
        throw "Dosya bulunamadı: $Path"
    }
    return [Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path $Path)))
}

if ($HelpMode) {
    Write-Host ""
    Write-Host "iOS GitHub secrets hazırlık yardımcısı"
    Write-Host ""
    Write-Host "Kullanım örneği:"
    Write-Host 'powershell -ExecutionPolicy Bypass -File .\scripts\prepare-ios-secrets.ps1 -CertificatePath "C:\sertifika.p12" -ProvisionProfilePath "C:\profil.mobileprovision" -ApiKeyPath "C:\AuthKey_ABC123XYZ.p8"'
    Write-Host ""
    Write-Host "Çıktı olarak GitHub Secrets alanına yapıştırabileceğin Base64 değerlerini üretir."
    exit 0
}

$results = @{}

if ($CertificatePath) {
    $results["BUILD_CERTIFICATE_BASE64"] = Convert-FileToBase64 -Path $CertificatePath
}

if ($ProvisionProfilePath) {
    $results["BUILD_PROVISION_PROFILE_BASE64"] = Convert-FileToBase64 -Path $ProvisionProfilePath
}

if ($ApiKeyPath) {
    $results["APPSTORE_CONNECT_API_KEY_BASE64"] = Convert-FileToBase64 -Path $ApiKeyPath
}

if ($results.Count -eq 0) {
    Write-Host "Hiç dosya verilmedi. Yardım için:"
    Write-Host "npm run ios:secrets:help"
    exit 1
}

Write-Host ""
Write-Host "GitHub Secrets için hazır değerler:"
Write-Host ""

foreach ($key in $results.Keys) {
    Write-Host "[$key]"
    Write-Output $results[$key]
    Write-Host ""
}
