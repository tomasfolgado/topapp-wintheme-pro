param()

$cpuTemp = $null
try {
    $tz = Get-CimInstance Win32_PerfFormattedData_Counters_ThermalZoneInformation -ErrorAction Stop | Select-Object -First 1
    if ($tz -and $tz.Temperature) {
        $cpuTemp = [math]::Round($tz.Temperature - 273.15)
    } elseif ($tz -and $tz.HighPrecisionTemperature) {
        $cpuTemp = [math]::Round(($tz.HighPrecisionTemperature / 10) - 273.15)
    }
} catch {
    $cpuTemp = $null
}

$gpuTemp = $null
try {
    $smiOut = & "nvidia-smi" "--query-gpu=temperature.gpu" "--format=csv,noheader,nounits" 2>$null
    if ($smiOut) {
        $gpuTemp = [int]$smiOut.Trim()
    }
} catch {
    $gpuTemp = $null
}

[PSCustomObject]@{
    cpuTemp = $cpuTemp
    gpuTemp = $gpuTemp
} | ConvertTo-Json -Compress
