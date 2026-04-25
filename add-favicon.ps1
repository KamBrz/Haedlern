$rootFiles = Get-ChildItem 'C:\Users\kambr\Desktop\Website\*.html'
foreach ($file in $rootFiles) {
    $c = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($c -notmatch 'rel="icon"') {
        $c = $c -replace '<link rel="stylesheet" href="styles.css">', '<link rel="icon" type="image/svg+xml" href="img/haedlern-ladder-iso-cobalt.svg"><link rel="stylesheet" href="styles.css">'
        Set-Content $file.FullName $c -NoNewline -Encoding UTF8
        Write-Host "Updated: $($file.Name)"
    }
}

$appFiles = Get-ChildItem 'C:\Users\kambr\Desktop\Website\apps\*.html'
foreach ($file in $appFiles) {
    $c = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($c -notmatch 'rel="icon"') {
        $c = $c -replace '<link rel="stylesheet" href="../styles.css">', '<link rel="icon" type="image/svg+xml" href="../img/haedlern-ladder-iso-cobalt.svg"><link rel="stylesheet" href="../styles.css">'
        Set-Content $file.FullName $c -NoNewline -Encoding UTF8
        Write-Host "Updated: $($file.Name)"
    }
}
