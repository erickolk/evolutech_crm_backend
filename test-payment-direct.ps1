# Script para testar criação de pagamento diretamente
$baseUrl = "http://localhost:3008"
$osId = "550e8400-e29b-41d4-a716-446655440002"

Write-Host "=== TESTE DE CRIAÇÃO DE PAGAMENTO DIRETO ===" -ForegroundColor Green
Write-Host "OS ID: $osId" -ForegroundColor Yellow
Write-Host "URL: $baseUrl/api/pagamentos" -ForegroundColor Yellow
Write-Host ""

# Criar arquivo JSON temporário
$jsonData = @"
{
    "ordem_servico_id": "$osId",
    "valor": 1000.00,
    "metodo_pagamento": "cartao_credito",
    "status_pagamento": "pendente",
    "data_vencimento": "2024-02-15",
    "observacoes": "Pagamento de teste para OS criada via script"
}
"@

$tempFile = "temp_payment.json"
$jsonData | Out-File -FilePath $tempFile -Encoding UTF8

try {
    # Usar curl para fazer a requisição
    $response = curl -X POST "$baseUrl/api/pagamentos" -H "Content-Type: application/json" -d "@$tempFile" 2>&1
    
    Write-Host "✅ Resposta recebida:" -ForegroundColor Green
    Write-Host $response -ForegroundColor White
    
} catch {
    Write-Host "❌ ERRO ao criar pagamento:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} finally {
    # Limpar arquivo temporário
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
    }
}

Write-Host ""
Write-Host "=== FIM DO TESTE ===" -ForegroundColor Green