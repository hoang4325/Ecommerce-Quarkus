$rsa = [System.Security.Cryptography.RSA]::Create(2048)
$privPkcs8 = $rsa.ExportPkcs8PrivateKey()
$pubKey = $rsa.ExportSubjectPublicKeyInfo()

$privB64 = [Convert]::ToBase64String($privPkcs8)
$pubB64  = [Convert]::ToBase64String($pubKey)

function Format-PEM {
    param([string]$base64, [string]$header)
    $lines = ""
    for ($i = 0; $i -lt $base64.Length; $i += 64) {
        $end = [Math]::Min(64, $base64.Length - $i)
        $lines += $base64.Substring($i, $end) + "`n"
    }
    return "-----BEGIN $header-----`n$lines-----END $header-----"
}

$privPEM = Format-PEM $privB64 "PRIVATE KEY"
$pubPEM  = Format-PEM $pubB64  "PUBLIC KEY"

Set-Content -Path "d:\ecommerce\privateKey.pem" -Value $privPEM -NoNewline
Set-Content -Path "d:\ecommerce\publicKey.pem"  -Value $pubPEM  -NoNewline

Write-Output "Keys generated successfully"
Write-Output "Private key: d:\ecommerce\privateKey.pem"
Write-Output "Public key:  d:\ecommerce\publicKey.pem"
