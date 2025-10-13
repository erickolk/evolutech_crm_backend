# Script PowerShell simples para testar a tabela Pagamentos
$supabaseUrl = "https://dceaogrgifgvhzvpbznp.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWFvZ3JnaWZndmh6dnBiem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzMxNjgsImV4cCI6MjA3NDc0OTE2OH0.YaixvQ5PvoZU1btskbC3YDTm-JSD_a6mvmXLnSiY_6o"

Write-Host "Testando estrutura da tabela Pagamentos..." -ForegroundColor Green

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

# Testar inserção para identificar colunas faltantes
Write-Host "Testando insercao..." -ForegroundColor Yellow

$testData = @{
    os_id = "710523f6-66f8-4805-a60f-8ad2edd3958c"
    valor_total = 1500.00
    valor_pago = 0.00
    valor_pendente = 1500.00
    forma_pagamento = "PIX"
    tipo_pagamento = "SERVICO"
    numero_parcelas = 1
    status = "PENDENTE"
    data_vencimento = "2024-02-15"
    observacoes = "Teste de estrutura"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/Pagamentos" -Method POST -Headers $headers -Body $testData
    Write-Host "Sucesso! Estrutura da tabela esta correta." -ForegroundColor Green
    Write-Host "Dados inseridos: $response" -ForegroundColor Cyan
}
catch {
    Write-Host "Erro na insercao (esperado): $($_.Exception.Message)" -ForegroundColor Red
    
    # Tentar extrair mais detalhes do erro
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
    }
}

Write-Host "Teste concluido." -ForegroundColor Green