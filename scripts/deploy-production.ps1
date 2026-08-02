param(
  [string]$Domain = "https://www.ardenostudio.online"
)

$ErrorActionPreference = "Stop"
$env:NO_UPDATE_NOTIFIER = "1"
$env:VERCEL_TELEMETRY_DISABLED = "1"

function Import-LocalEnv($Path) {
  if (!(Test-Path -LiteralPath $Path)) {
    return
  }

  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if (!$line -or $line.StartsWith("#") -or !$line.Contains("=")) {
      return
    }

    $parts = $line.Split("=", 2)
    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")
    $current = [Environment]::GetEnvironmentVariable($name)
    if ($name -match "^[A-Za-z_][A-Za-z0-9_]*$" -and [string]::IsNullOrWhiteSpace($current)) {
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

function Require-Env($Name) {
  $value = [Environment]::GetEnvironmentVariable($Name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Missing required environment variable: $Name"
  }
}

Import-LocalEnv ".env.deploy.local"
Require-Env "VERCEL_TOKEN"

Write-Host "Running local production gates..."
npm run typecheck
npm run test:api
npm run scan:secrets
npm run build
npm audit --omit=dev

if ($env:VERCEL_ORG_ID -and $env:VERCEL_PROJECT_ID) {
  New-Item -ItemType Directory -Force -Path ".vercel" | Out-Null
  $project = @{
    orgId = $env:VERCEL_ORG_ID
    projectId = $env:VERCEL_PROJECT_ID
  } | ConvertTo-Json
  Set-Content -LiteralPath ".vercel/project.json" -Value $project
} else {
  Write-Host "No VERCEL_ORG_ID/VERCEL_PROJECT_ID pair found. Pulling project link from Vercel..."
}

Write-Host "Pulling production project settings and environment metadata..."
npx vercel pull --yes --environment=production --token $env:VERCEL_TOKEN

Write-Host "Checking required production environment variables..."
node scripts/check-production-env.mjs ".vercel/.env.production.local"

Write-Host "Deploying to Vercel production..."
npx vercel deploy --prod --yes --token $env:VERCEL_TOKEN

Write-Host "Waiting for edge propagation..."
Start-Sleep -Seconds 20

Write-Host "Verifying live production..."
node scripts/verify-production.mjs $Domain
