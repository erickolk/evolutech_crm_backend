# Script para testar criação de pagamento com OS válida
# OS ID: 550e8400-e29b-41d4-a716-446655440002

$baseUrl = "http://localhost:3000"
$osId = "550e8400-e29b-41d4-a716-446655440002"

# Dados do pagamento para teste
$paymentData = @{
    ordem_servico_id = $osId
    valor = 1000.00
    metodo_pagamento = "cartao_credito"
    status_pagamento = "pendente"
    data_vencimento = "2024-02-15"
    observacoes = "Pagamento de teste para OS criada via script"
} | ConvertTo-Json -Depth 10

Write-Host "=== TESTE DE CRIAÇÃO DE PAGAMENTO ===" -ForegroundColor Green
Write-Host "OS ID: $osId" -ForegroundColor Yellow
Write-Host "URL: $baseUrl/api/pagamentos" -ForegroundColor Yellow
Write-Host ""

try {
    # Fazer requisição POST para criar pagamento
    $response = Invoke-RestMethod -Uri "$baseUrl/api/pagamentos" -Method POST -Body $paymentData -ContentType "application/json"
    
    Write-Host "✅ SUCESSO! Pagamento criado:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    
    # Salvar ID do pagamento para verificação posterior
    $paymentId = $response.id
    Write-Host ""
    Write-Host "💾 ID do pagamento criado: $paymentId" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERRO ao criar pagamento:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor White
    }
}

Write-Host ""
Write-Host "=== FIM DO TESTE ===" -ForegroundColor Green