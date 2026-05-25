$base = 'c:\Users\Jahidul Islam\Desktop\Jahidul Islam\UnifiedTools Pro'
Get-ChildItem -Path "$base\src\app\tools" -Recurse -Filter page.tsx | Where-Object { $_.FullName -notmatch '\\src\\app\\tools\\page.tsx$' -and $_.FullName -notmatch '\\src\\app\\tools\\all\\page.tsx$' } | ForEach-Object {
  $path = $_.FullName
  $content = Get-Content $path -Raw
  if ($content -match 'ToolSeoContent') {
    Write-Host "Already has ToolSeoContent: $path"
    return
  }
  if ($content -match '^(import .*?\r?\n)') {
    $content = $content -replace '^(import .*?\r?\n)', '$1import ToolSeoContent from "@/components/ToolSeoContent";`r`n'
  }
  $newlineIndex = $content.LastIndexOf("`r`n}")
  if ($newlineIndex -lt 0) { $newlineIndex = $content.LastIndexOf("`n}") }
  if ($newlineIndex -gt 0) {
    $dirName = [System.IO.Path]::GetFileName([System.IO.Path]::GetDirectoryName($path))
    $toolName = -join (($dirName -split '-') | ForEach-Object { if ($_.Length -gt 0) { $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() } else { '' } })
    $insert = "      <ToolSeoContent tool='$toolName' />`r`n"
    $content = $content.Substring(0, $newlineIndex) + $insert + $content.Substring($newlineIndex)
    Set-Content -Path $path -Value $content
    Write-Host "Updated: $path with tool $toolName"
  } else {
    Write-Host "Failed to find end-of-file insertion point for $path"
  }
}
