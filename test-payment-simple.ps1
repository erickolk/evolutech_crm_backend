# Script para testar criação de pagamento sem dependência de OS
Write-Host "Testando criação de pagamento..." -ForegroundColor Green

# Primeiro, vamos testar se o enum foi corrigido fazendo uma inserção direta na tabela de histórico
$testHistoricoBody = @{
    pagamento_id = "550e8400-e29b-41d4-a716-446655440000"
    acao = "CRIACAO"
    valor_anterior = 0
    valor_novo = 1000
    observacoes = "Teste do enum"
} | ConvertTo-Json

Write-Host "Testando inserção no histórico de pagamentos..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://ckfbdcvkdxkqjgvdcwqvbgvqkqjl.supabase.co/rest/v1/HistoricoPagamentos" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{
            "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZmJkY3ZrZHhrcWpndmRjd3F2Ymd2cWtxamwiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTc1NzI5NCwiZXhwIjoyMDUxMzMzMjk0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
            "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZmJkY3ZrZHhrcWpndmRjd3F2Ymd2cWtxamwiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTc1NzI5NCwiZXhwIjoyMDUxMzMzMjk0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
        } `
        -Body $testHistoricoBody

    Write-Host "Sucesso! Enum CRIACAO foi aceito." -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "Erro ao testar enum:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nTeste concluído." -ForegroundColor Green