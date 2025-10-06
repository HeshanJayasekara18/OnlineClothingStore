# View Azure App Service Logs
# This script helps you monitor your deployed application

param(
    [Parameter(Mandatory=$false)]
    [string]$AppName = "clothstore-api",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "clothstore-rg",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("tail", "download", "status")]
    [string]$Action = "tail"
)

Write-Host "`n📋 Azure App Service Logs" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

switch ($Action) {
    "tail" {
        Write-Host "📡 Streaming logs (Press Ctrl+C to stop)...`n" -ForegroundColor Yellow
        az webapp log tail --name $AppName --resource-group $ResourceGroup
    }
    
    "download" {
        Write-Host "💾 Downloading logs..." -ForegroundColor Yellow
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $outputFile = "logs_$timestamp.zip"
        
        az webapp log download `
            --name $AppName `
            --resource-group $ResourceGroup `
            --log-file $outputFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Logs downloaded to: $outputFile`n" -ForegroundColor Green
        }
    }
    
    "status" {
        Write-Host "📊 Application Status`n" -ForegroundColor Yellow
        
        $state = az webapp show --name $AppName --resource-group $ResourceGroup --query state -o tsv
        $url = az webapp show --name $AppName --resource-group $ResourceGroup --query defaultHostName -o tsv
        
        Write-Host "State: " -NoNewline
        if ($state -eq "Running") {
            Write-Host $state -ForegroundColor Green
        } else {
            Write-Host $state -ForegroundColor Red
        }
        
        Write-Host "URL: https://$url" -ForegroundColor Cyan
        
        Write-Host "`n🔍 Testing endpoints..." -ForegroundColor Yellow
        
        try {
            $health = Invoke-RestMethod -Uri "https://$url/health" -TimeoutSec 10
            Write-Host "✅ Health endpoint: " -NoNewline -ForegroundColor Green
            Write-Host $health
        } catch {
            Write-Host "❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        try {
            $root = Invoke-RestMethod -Uri "https://$url/" -TimeoutSec 10
            Write-Host "✅ Root endpoint: " -NoNewline -ForegroundColor Green
            Write-Host $root.message
        } catch {
            Write-Host "❌ Root endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host "`n📝 Recent logs:" -ForegroundColor Yellow
        az webapp log tail --name $AppName --resource-group $ResourceGroup --lines 20
    }
}

Write-Host "`n💡 Available actions:" -ForegroundColor Yellow
Write-Host "   .\view-logs.ps1 -Action tail      # Stream logs in real-time" -ForegroundColor Gray
Write-Host "   .\view-logs.ps1 -Action download  # Download all logs" -ForegroundColor Gray
Write-Host "   .\view-logs.ps1 -Action status    # Check app status`n" -ForegroundColor Gray
