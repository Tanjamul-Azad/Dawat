$ErrorActionPreference = 'Stop'
$workspacePath = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$nodeExecutable = (Get-Command node.exe -ErrorAction Stop).Source
$currentIdentity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$action = New-ScheduledTaskAction -Execute $nodeExecutable -Argument 'scripts/recovery/backup.mjs' -WorkingDirectory $workspacePath
$trigger = New-ScheduledTaskTrigger -Daily -At '19:00'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 15) -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId $currentIdentity -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'Dawat Local Encrypted Backup' -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'Encrypted local Dawat production backup. Runs only while this Windows user is signed in and Docker is running. No cloud upload or automatic deletion.' -Force | Select-Object TaskName, State
