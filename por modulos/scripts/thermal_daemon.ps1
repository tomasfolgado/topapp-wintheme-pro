# Real Thermal Telemetry Daemon for Windows
# Streams JSON lines: {"cpuTemp":49,"gpuTemp":43} every 2 seconds
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

while ($true) {
    $cpu = $null
    try {
        $tz = Get-CimInstance Win32_PerfFormattedData_Counters_ThermalZoneInformation -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($tz -and $tz.Temperature) {
            $cpu = [math]::Round($tz.Temperature - 273.15)
        } elseif ($tz -and $tz.HighPrecisionTemperature) {
            $cpu = [math]::Round(($tz.HighPrecisionTemperature / 10) - 273.15)
        }
    } catch {}

    $gpu = $null
    try {
        $smi = & "nvidia-smi" "--query-gpu=temperature.gpu" "--format=csv,noheader,nounits" 2>$null
        if ($smi) {
            $gpu = [int]$smi.Trim()
        }
    } catch {}

    $obj = [PSCustomObject]@{
        cpuTemp = $cpu
        gpuTemp = $gpu
    }
    $json = $obj | ConvertTo-Json -Compress
    [Console]::WriteLine($json)

    Start-Sleep -Seconds 4
}
