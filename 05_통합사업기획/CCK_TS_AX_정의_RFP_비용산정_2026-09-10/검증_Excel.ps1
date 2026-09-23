$ErrorActionPreference = 'Stop'
$tsExcelBase = $PSScriptRoot
$tsExcelPath = Join-Path $tsExcelBase 'outputs\01a085c1-adea-71a1-acf0-ff030613a6bc\CCK_TS_AX_개발_용역비_산정.xlsx'
$tsExcel = New-Object -ComObject Excel.Application
$tsExcel.Visible = $false
$tsExcel.DisplayAlerts = $false
$tsExcel.AutomationSecurity = 3
try {
    $tsBook = $tsExcel.Workbooks.Open($tsExcelPath, 0, $true)
    $tsExcel.CalculateFullRebuild()
    $tsSummary = $tsBook.Worksheets.Item('산정요약')
    $tsActual = @($tsSummary.Range('B16').Value2, $tsSummary.Range('C16').Value2, $tsSummary.Range('D16').Value2, $tsSummary.Range('D22').Value2)
    $tsExpected = @(1646021461,1153141990,2799163451,469027614)
    for ($tsIndex=0; $tsIndex -lt 4; $tsIndex++) { if ($tsActual[$tsIndex] -ne $tsExpected[$tsIndex]) { throw 'Excel native recalculation mismatch' } }
    $tsBook.Worksheets.Item('가정과단가').Range('B9').Value2 = 1.1
    $tsExcel.CalculateFullRebuild()
    $tsChanged = $tsSummary.Range('D16').Value2
    if ($tsChanged -le $tsActual[2]) { throw 'Excel input change did not recalculate' }
    [pscustomobject]@{Engine='Microsoft Excel'; Values=$tsActual; InputChangeValue=$tsChanged; Saved=$false; Result='통과'} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $tsExcelBase '검증\Excel_재계산.json') -Encoding utf8
    $tsBook.Close($false)
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($tsBook)
} finally {
    $tsExcel.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($tsExcel)
}
Get-Content -LiteralPath (Join-Path $tsExcelBase '검증\Excel_재계산.json')
