param(
    [string]$CertificatePath,
    [string]$ProvisionProfilePath,
    [string]$ApiKeyPath,
    [switch]$HelpMode
)

function Convert-FileToBase64 {
    param([Parameter(Mandatory = $true)][string]$Path)
    $dotlessI = [char]305
    if (-not (Test-Path $Path)) {
        throw ("Dosya bulunamad" + $dotlessI + ": $Path")
    }
    return [Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path $Path)))
}

if ($HelpMode) {
    $dotlessI = [char]305
    $ouml = [char]246
    $gbreve = [char]287
    $ccedUpper = [char]199
    $uuml = [char]252
    $sced = [char]351
    Write-Host ""
    Write-Host ("iOS GitHub secrets haz" + $dotlessI + "rl" + $dotlessI + "k yard" + $dotlessI + "mc" + $dotlessI + "s" + $dotlessI)
    Write-Host ""
    Write-Host ("Kullan" + $dotlessI + "m " + $ouml + "rne" + $gbreve + "i:")
    Write-Host 'powershell -ExecutionPolicy Bypass -File .\scripts\prepare-ios-secrets.ps1 -CertificatePath "C:\sertifika.p12" -ProvisionProfilePath "C:\profil.mobileprovision" -ApiKeyPath "C:\AuthKey_ABC123XYZ.p8"'
    Write-Host ""
    Write-Host ($ccedUpper + "" + $dotlessI + "kt" + $dotlessI + " olarak GitHub Secrets alan" + $dotlessI + "na yap" + $dotlessI + $sced + "t" + $dotlessI + "rabilece" + $gbreve + "in Base64 de" + $gbreve + "erlerini " + $uuml + "retir.")
    exit 0
}

$results = @{}
$dotlessI = [char]305
$cced = [char]231
$gbreve = [char]287

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
    Write-Host ("Hi" + $cced + " dosya verilmedi. Yard" + $dotlessI + "m i" + $cced + "in:")
    Write-Host "npm run ios:secrets:help"
    exit 1
}

Write-Host ""
Write-Host ("GitHub Secrets i" + $cced + "in haz" + $dotlessI + "r de" + $gbreve + "erler:")
Write-Host ""

foreach ($key in $results.Keys) {
    Write-Host "[$key]"
    Write-Output $results[$key]
    Write-Host ""
}