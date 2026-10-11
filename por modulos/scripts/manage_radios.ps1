param(
    [string]$Action = "status",
    [string]$Target = "",
    [string]$State = ""
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime -ErrorAction SilentlyContinue
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.IsGenericMethod 
})[0]

function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

try {
    [Windows.Devices.Radios.Radio,Windows.System.Devices,ContentType=WindowsRuntime] | Out-Null
    $radios = Await ([Windows.Devices.Radios.Radio]::GetRadiosAsync()) ([System.Collections.Generic.IReadOnlyList[Windows.Devices.Radios.Radio]])

    $wifiRadio = $radios | Where-Object { $_.Kind -eq 'WiFi' }
    $btRadio = $radios | Where-Object { $_.Kind -eq 'Bluetooth' }

    if ($Action -eq "toggle") {
        if ($Target -eq "wifi" -and $wifiRadio) {
            $newState = if ($wifiRadio.State -eq 'On') { [Windows.Devices.Radios.RadioState]::Off } else { [Windows.Devices.Radios.RadioState]::On }
            Await ($wifiRadio.SetStateAsync($newState)) ([Windows.Devices.Radios.RadioAccessStatus]) | Out-Null
        }
        elseif ($Target -eq "bluetooth" -and $btRadio) {
            $newState = if ($btRadio.State -eq 'On') { [Windows.Devices.Radios.RadioState]::Off } else { [Windows.Devices.Radios.RadioState]::On }
            Await ($btRadio.SetStateAsync($newState)) ([Windows.Devices.Radios.RadioAccessStatus]) | Out-Null
        }
        Start-Sleep -Milliseconds 150
    }
    elseif ($Action -eq "set") {
        $desiredState = if ($State -eq "on") { [Windows.Devices.Radios.RadioState]::On } else { [Windows.Devices.Radios.RadioState]::Off }
        if ($Target -eq "wifi" -and $wifiRadio) {
            Await ($wifiRadio.SetStateAsync($desiredState)) ([Windows.Devices.Radios.RadioAccessStatus]) | Out-Null
        }
        elseif ($Target -eq "bluetooth" -and $btRadio) {
            Await ($btRadio.SetStateAsync($desiredState)) ([Windows.Devices.Radios.RadioAccessStatus]) | Out-Null
        }
        Start-Sleep -Milliseconds 150
    }

    $isWifiOn = ($wifiRadio -and $wifiRadio.State -eq 'On')
    $isBtOn = ($btRadio -and $btRadio.State -eq 'On')

    # Also check if Wi-Fi has connected network name
    $wifiSsid = ""
    if ($isWifiOn) {
        try {
            $wlanOut = (netsh wlan show interfaces 2>$null) -join "`n"
            if ($wlanOut -match '(?m)^\s*SSID\s*:\s*(.+)$') {
                $wifiSsid = $matches[1].Trim()
            }
        } catch {}
    }

    $res = @{
        wifi = $isWifiOn
        wifiSsid = $wifiSsid
        bluetooth = $isBtOn
    }
    ConvertTo-Json $res -Compress
} catch {
    Write-Output '{"wifi":true,"bluetooth":false,"error":true}'
}
