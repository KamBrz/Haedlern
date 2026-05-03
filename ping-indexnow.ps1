$key  = '03104f0351c640b8bed427e74e305e23'
$host = 'haedlern.com'

$sitemap = [xml](Get-Content "$PSScriptRoot\sitemap.xml" -Encoding UTF8)
$urls    = $sitemap.urlset.url | ForEach-Object { $_.loc }

$body = [ordered]@{
    host        = $host
    key         = $key
    keyLocation = "https://$host/$key.txt"
    urlList     = $urls
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri         'https://api.indexnow.org/indexnow' `
    -Method      Post `
    -Body        $body `
    -ContentType 'application/json; charset=utf-8'

Write-Host "IndexNow: submitted $($urls.Count) URLs"
