# Script para testar criação de pagamento - versão final
$baseUrl = "http://localhost:3008"
$osId = "550e8400-e29b-41d4-a716-446655440002"

Write-Host "=== TESTE DE CRIAÇÃO DE PAGAMENTO FINAL ===" -ForegroundColor Green
Write-Host "OS ID: $osId" -ForegroundColor Yellow
Write-Host "URL: $baseUrl/api/pagamentos" -ForegroundColor Yellow
Write-Host ""

# Dados do pagamento
$body = @{
    ordem_servico_id = $osId
    valor = 1000.00
    metodo_pagamento = "cartao_credito"
    status_pagamento = "pendente"
    data_vencimento = "2024-02-15"
    observacoes = "Pagamento de teste para OS criada via script"
}

$jsonBody = $body | ConvertTo-Json -Depth 10

try {
    # Fazer requisição usando Invoke-WebRequest
    $response = Invoke-WebRequest -Uri "$baseUrl/api/pagamentos" -Method POST -Body $jsonBody -ContentType "application/json" -UseBasicParsing
    
    Write-Host "✅ SUCESSO! Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Resposta:" -ForegroundColor Cyan
    Write-Host $response.Content -ForegroundColor White
    
} catch {
    Write-Host "❌ ERRO ao criar pagamento:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Detalhes do erro:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor White
        } catch {
            Write-Host "Não foi possível ler o corpo da resposta de erro" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== FIM DO TESTE ===" -ForegroundColor Green