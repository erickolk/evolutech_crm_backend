# Script PowerShell para corrigir a estrutura da tabela Pagamentos
$supabaseUrl = "https://dceaogrgifgvhzvpbznp.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWFvZ3JnaWZndmh6dnBiem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzMxNjgsImV4cCI6MjA3NDc0OTE2OH0.YaixvQ5PvoZU1btskbC3YDTm-JSD_a6mvmXLnSiY_6o"

Write-Host "Iniciando correcao da estrutura da tabela Pagamentos..." -ForegroundColor Green

# Primeiro, vamos verificar se conseguimos acessar a tabela
Write-Host "Testando acesso a tabela Pagamentos..." -ForegroundColor Yellow

try {
    $headers = @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
    }
    
    # Tentar fazer uma consulta simples na tabela
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/Pagamentos?select=id`&limit=1" -Method GET -Headers $headers
    Write-Host "✅ Acesso à tabela Pagamentos confirmado!" -ForegroundColor Green
    
    # Agora vamos tentar inserir um registro de teste para ver quais colunas estão faltando
    Write-Host "🧪 Testando inserção para identificar colunas faltantes..." -ForegroundColor Yellow
    
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
        $insertResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/Pagamentos" -Method POST -Headers $headers -Body $testData
        Write-Host "✅ Inserção bem-sucedida! A estrutura da tabela está correta." -ForegroundColor Green
        Write-Host "📄 Dados inseridos: $insertResponse" -ForegroundColor Cyan
        
        # Remover o registro de teste se a inserção foi bem-sucedida
        if ($insertResponse -and $insertResponse.id) {
            $deleteHeaders = $headers.Clone()
            $deleteHeaders["Prefer"] = "return=minimal"
            Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/Pagamentos?id=eq.$($insertResponse.id)" -Method DELETE -Headers $deleteHeaders
            Write-Host "Registro de teste removido." -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ Erro na inserção (esperado): $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "📝 Isso nos ajuda a identificar quais colunas estão faltando." -ForegroundColor Yellow
        
        # Extrair detalhes do erro
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "🔍 Detalhes do erro: $errorBody" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "❌ Erro ao acessar a tabela Pagamentos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🏁 Verificação concluída." -ForegroundColor Green