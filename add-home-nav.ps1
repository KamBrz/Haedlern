$rootFiles = Get-ChildItem 'C:\Users\kambr\Desktop\Website\*.html'
foreach ($file in $rootFiles) {
    $c = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($c -notmatch '<a href="index\.html">Home</a>') {
        $c = $c -replace '<li><a href="apps\.html">', '<li><a href="index.html">Home</a></li><li><a href="apps.html">'
        Set-Content $file.FullName $c -NoNewline -Encoding UTF8
        Write-Host "Updated: $($file.Name)"
    }
}

$appFiles = Get-ChildItem 'C:\Users\kambr\Desktop\Website\apps\*.html'
foreach ($file in $appFiles) {
    $c = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($c -notmatch '<a href="\.\.\/index\.html">Home</a>') {
        $c = $c -replace '<li><a href="\.\.\/apps\.html">', '<li><a href="../index.html">Home</a></li><li><a href="../apps.html">'
        Set-Content $file.FullName $c -NoNewline -Encoding UTF8
        Write-Host "Updated: $($file.Name)"
    }
}
