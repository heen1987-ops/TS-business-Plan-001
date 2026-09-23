$ErrorActionPreference = 'Stop'
$tsDocBase = $PSScriptRoot
$tsWord = New-Object -ComObject Word.Application
$tsWord.Visible = $false
$tsWord.DisplayAlerts = 0
$tsWord.AutomationSecurity = 3
$tsRenderLog = @()
try {
    $tsFiles = Get-ChildItem -LiteralPath $tsDocBase -Filter '*.docx'
    foreach ($tsFile in $tsFiles) {
        $tsOut = Join-Path $tsDocBase ('검증\문서\' + $tsFile.BaseName)
        New-Item -ItemType Directory -Path $tsOut -Force | Out-Null
        $tsDocument = $tsWord.Documents.Open($tsFile.FullName, $false, $true)
        try {
            $tsDocument.Repaginate()
            $tsDocument.ExportAsFixedFormat((Join-Path $tsOut '문서.pdf'), 17)
            $tsRenderLog += [pscustomobject]@{ File = $tsFile.Name; Pages = $tsDocument.ComputeStatistics(2); Renderer = 'Microsoft Word COM PDF export' }
        } finally {
            $tsDocument.Close(0)
            [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($tsDocument)
        }
    }
} finally {
    $tsWord.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($tsWord)
}
$tsRenderLog | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $tsDocBase '검증\Word_렌더기록.json') -Encoding utf8
$tsRenderLog | ConvertTo-Json
