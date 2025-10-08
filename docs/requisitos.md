Documento de Arquitetura do Sistema: Backend
Projeto: Evolutech CRM
Versão do Documento: 1.0
Data: 08 de Outubro de 2025
Autor: Gemini (Arquiteto de Software)

1. Visão Geral e Filosofia de Arquitetura
O backend do Evolutech CRM é projetado para ser o "cérebro" central e a única fonte da verdade para toda a aplicação. Sua principal responsabilidade é gerenciar a lógica de negócio, a segurança dos dados e fornecer uma API robusta e bem definida para que qualquer cliente (seja o nosso frontend web, um futuro aplicativo móvel ou os agentes de IA) possa interagir com o sistema de forma segura e previsível.

Princípios Fundamentais:

Separation of Concerns (Separação de Responsabilidades): Cada parte do sistema tem uma única responsabilidade. A lógica de negócio é separada do acesso a dados, que por sua vez é separado da gestão de requisições HTTP.

Robustez e Escalabilidade: A arquitetura deve suportar o crescimento do negócio, desde o gerenciamento de dezenas até milhares de Ordens de Serviço (OS), sem a necessidade de grandes refatorações.

Segurança em Primeiro Lugar: O acesso aos dados é controlado, e nenhuma informação sensível é exposta indevidamente.

2. Stack Tecnológica
Componente	Tecnologia Escolhida	Justificativa Arquitetural
Ambiente de Execução	Node.js (v22+)	Plataforma performática, com um vasto ecossistema e baseada em JavaScript, mantendo consistência de linguagem com o frontend.
Linguagem	TypeScript	Garante a segurança de tipos (type-safety), previne bugs e melhora drasticamente a manutenibilidade e a experiência de desenvolvimento com autocompletar.
Framework de API	Express.js	Minimalista, flexível e com um ecossistema gigante. Nos dá total controle para implementar nossa arquitetura em camadas sem nos forçar a seguir um padrão rígido.
Banco de Dados	PostgreSQL (via Supabase)	Um banco de dados relacional robusto e confiável. O Supabase nos fornece a infraestrutura gerenciada, autenticação e uma API de dados automática como bônus.
Sistema de Módulos	ESM (ECMAScript Modules)	Padrão moderno do JavaScript (import/export), alinhado com as melhores práticas atuais e com o ecossistema do frontend.

Exportar para as Planilhas
3. Arquitetura em Camadas: Controller-Service-Repository
O código-fonte é organizado em três camadas lógicas para cada módulo de negócio (Domínio):

Camada de Repository (Repositório):

Responsabilidade: Comunicação exclusiva com o banco de dados. É a única camada que "sabe" que estamos usando o Supabase.

Função: Executar operações CRUD (Create, Read, Update, Delete) puras. Ex: clienteRepository.findById(id).

Exemplo: cliente.repository.ts

Camada de Service (Serviço):

Responsabilidade: Orquestrar a lógica de negócio. É o coração da aplicação.

Função: Validar dados de entrada, aplicar regras (ex: "não permitir alterar o CPF de um cliente"), chamar um ou mais repositórios e formatar os dados para a resposta.

Exemplo: cliente.service.ts

Camada de Controller (Controlador):

Responsabilidade: Lidar com a requisição HTTP. É o ponto de entrada da API.

Função: Extrair dados de req.params e req.body, chamar o método de serviço apropriado e enviar a resposta HTTP (com o status code correto e o corpo em JSON).

Exemplo: cliente.controller.ts

Fluxo de uma Requisição:
Requisição HTTP -> routes.ts -> Controller -> Service -> Repository -> Banco de Dados

4. Modelo de Dados (Schema do Banco de Dados)
O banco de dados foi projetado para espelhar as entidades do negócio, com base nos requisitos levantados. As tabelas principais são:

Clientes: Armazena dados de pessoas físicas e jurídicas.

Dispositivos: Equipamentos pertencentes a um cliente.

OrdensDeServico: O registro central de cada serviço.

Orcamentos: Permite múltiplas versões de um orçamento para uma mesma OS.

OrcamentoItens: Detalha cada peça e serviço dentro de um orçamento, permitindo aprovação parcial.

Fornecedores: Empresas que fornecem as peças.

Produtos: O catálogo de peças e itens de estoque.

EstoqueMovimentacoes: Um registro histórico de todas as entradas e saídas de estoque para fins de auditoria.

Prática Implementada: Todas as tabelas possuem um campo deleted_at (timestamptz, nulo por padrão) para suportar Soft Deletes. As consultas de leitura sempre filtram registros onde deleted_at não é nulo.

5. Funcionalidades e Endpoints da API
Ao final, o backend será capaz de gerenciar todo o fluxo operacional da assistência técnica. A API, com prefixo /api, fornecerá os seguintes endpoints:

Autenticação (Futuro):

POST /auth/login: Para autenticação de usuários (técnicos, atendentes).

Clientes: CRUD completo em /clientes.

Dispositivos: CRUD completo em /clientes/:id/dispositivos e /dispositivos/:id.

Ordens de Serviço: CRUD completo em /ordensDeServico. Os endpoints GET devem retornar os dados aninhados de Cliente e Dispositivo para otimizar as consultas do frontend.

Orçamentos: CRUD completo para gerenciar orçamentos e seus itens, aninhados sob uma OS (/ordensDeServico/:id/orcamentos).

Estoque e Produtos: CRUD completo para Fornecedores e Produtos, e endpoints para registrar movimentações de estoque.

Agentes de IA (Futuro):

Endpoints específicos para os agentes, como POST /webhook/whatsapp para receber mensagens e GET /agente/status-os/:id como uma ferramenta para o agente consultar o status de um serviço.

### **Sobre a Etapa 1: Recebimento da Demanda**

O PDF já diz quais perguntas fazer ao cliente. O que precisamos saber é como gerenciar esses clientes.

1. **Clientes Novos vs. Antigos:** "Quando um cliente entra em contato, como vocês fazem hoje para saber se ele já é um cliente antigo ou se é a primeira vez dele na loja?"
    - *(Por que perguntamos?)* Isso nos ajuda a entender a necessidade de uma busca rápida de clientes no sistema.
    Não conseguimos saber do ano passado pra tras a partir da mudança de sistema, depois que mudou sabe do começo do ano pra ca sabe pela jornada do cliente que tem no sistema atual
2. **Múltiplos Equipamentos:** "Já aconteceu de um mesmo cliente trazer mais de um equipamento de uma vez, por exemplo, um notebook e uma impressora? Se sim, vocês abrem um chamado para cada um ou um só para o cliente?"
    - *(Por que perguntamos?)* Isso define a arquitetura: se um cliente pode ter várias ordens de serviço abertas ao mesmo tempo.
    - Sim, um cliente pode e já chegou com mais de um equipamento

---

### **Sobre a Etapa 2: Recebimento do Equipamento**

O PDF diz para cadastrar o cliente e o equipamento. Precisamos detalhar

*o que* cadastrar.

1. **Detalhes do Equipamento:** "Além do tipo (notebook, impressora), quais informações do equipamento são **essenciais** para vocês registrarem na entrada? Por exemplo, número de série? Cor? Algum detalhe sobre a aparência (se está arranhado, amassado)?"
    - *(Por que perguntamos?)* Para definir os campos exatos na tabela `Dispositivos`. Isso é importante para proteção legal.
    - Ela disse que esses detalhes poderia ser armazenado por fotos tiradas na entrada.
    - O sistema indicaria como as fotos teriam de ser tiradas
2. 
    
    **Acessórios:** "O cliente costuma deixar acessórios junto com o equipamento, como carregador, mouse ou capa? Vocês precisam anotar isso em algum lugar para não esquecer na hora da devolução?"
    
    - *(Por que perguntamos?)* Para saber se precisamos de um campo "observações" ou "acessórios inclusos" na Ordem de Serviço.
    - Ela geralmente não fica com acessórios, mas há exceções, quando o problema pode ser na fonte, ou quando por algum motivo extraordinário acontecer de ficar o acessório

---

### **Sobre as Etapas 4 e 5: Laudo, Orçamento e Autorização**

O PDF detalha o que vai no laudo e que é preciso uma autorização. Precisamos entender as variáveis do orçamento.

1. **Detalhamento do Orçamento:** "No orçamento que vocês enviam, os valores das peças e do serviço (mão de obra) são mostrados de forma separada ou é apresentado um valor total?"
    - *(Por que perguntamos?)* Para decidir como o sistema vai calcular e exibir os orçamentos.
    - - BUSCAR
    - tem que ter como editar valor dos serviços e peças, não é fixa mas precisa poder aplicar desconto por item
    - Cada peça ou serviço é tratado como um item do orçamento
    - Ordem de serviço só pode ter 1 equipamento, mas um equipamento pode ter várias ordens de serviço
    - Os de Retorno é só ter a opção nos tipo
    - tem que ter tipos de os de serviço, de retorno etc…
    - tem que ter status da os
    - Pode ter um segundo orçamento editando os items da os, aumentando ou diminuindo
    - Geral, Problemas, serviços, itens utilizados, orçamento/sinal, contatos VER NAS FOTOS E DETALHAR CADA TELA
    - Um laudo é dentro da os ? ou ele é algo separado ? ele pertence  a os tem de ter
    - Melhor cenario criar algo, mvp poder quebrar linhas
2. **Garantia:** "A garantia que vocês oferecem  tem um prazo fixo (ex: '90 dias' para todo serviço) ou ela pode variar dependendo da peça ou do tipo de conserto?"
    - *(Por que perguntamos?)* Para definir se o campo `garantia` será um texto livre, um número de dias ou uma opção pré-definida.
    - 90 DIAS SERVIÇO - fixo
    - Pode variar dependendo da peça
3. **Autorização Parcial:** "Já aconteceu de um cliente aprovar só uma parte do orçamento? Por exemplo, 'autorizo arrumar o teclado, mas não precisa trocar a bateria'. Se sim, como vocês lidam com isso hoje?"
    - *(Por que perguntamos?)* Para entender se o sistema precisa permitir múltiplas "linhas" de serviço no orçamento, com aprovações individuais.
    - Precisa ser parcial, pois nem sempre ele autoriza tudo. por itens a ideia dela.
    - Ele pode tambem autorizar o serviço mas trazer a peça de fora
    - Ele pode autorizar tudo
    - Pode autorizar a compra da peça mas não do serviço

---

### **Sobre a Etapa 7: Entrega do Equipamento**

O PDF menciona o registro do pagamento (à vista, parcelado, desconto). Precisamos detalhar isso.

1. **Formas de Pagamento:** "Sobre o pagamento, quais são as formas que os clientes mais usam? (PIX, dinheiro, cartão de crédito, débito)."
    - *(Por que perguntamos?)* Para talvez criar um campo de seleção, facilitando o registro.
    - Cartão de crédito à vista, Cartão de crédito parcelado, Dinheiro, Pix, Débito.
2. **Parcelamento:** "Quando o pagamento é parcelado, vocês precisam registrar em quantas vezes foi feito?"
    - *(Por que perguntamos?)* Para saber se precisamos de um campo adicional para o número de parcelas.
    - Sim, é importante. ter tudo muito claro. nesse sentido
3. **Descontos:** "E sobre os descontos, vocês costumam dar um valor fixo (ex: R$ 20 de desconto) ou uma porcentagem (10% de desconto)?"
    - *(Por que perguntamos?)* Para o sistema saber como calcular e registrar o desconto corretamente. É até 10 %, mas tem que ter flexibilização para casos extremos. (Colocar no sistema o motivo da exceção) - Ter critérios para permitir essas excessões

---

### **Perguntas Gerais de Encerramento**

1. **O Pior Cenário:** "Para finalizar, qual é a situação ou o tipo de serviço que hoje mais dá dor de cabeça para organizar e controlar?” organização dos equipamentos por status e operacional, ordem de precedencia.
2.  Onde a comunicação com o cliente mais se perde?" Cliente, não lê ou ignora as informações claras passadas como prazos, entre outras coisas, e também não passa informações claras muitas vezes. Cliente esquece da orientação de trazer a Os, que sem ela não temos como devolver o equipamento.
3. **A Informação Mais Importante:** "Se o sistema pudesse te mostrar uma única informação de forma rápida e fácil na tela principal, qual seria a informação mais útil para o seu dia a dia?"

Lembre-se de anotar as respostas. Elas são os requisitos detalhados que vão garantir que o sistema que você está construindo seja exatamente o que a empresa precisa.

Aqui estão as perguntas, organizadas por cada "assunto" (que para nós, são as tabelas).

**Introdução Sugerida:** *"Para garantir que o sistema guarde todas as informações importantes e nada se perca, pensei em algumas situações do dia a dia. Queria só confirmar com você se os dados que pensei em guardar são suficientes."*

---

### **1. Perguntas para Validar a Tabela `Clientes`**

Nosso plano atual é guardar apenas `nome` e `whatsapp_id`. Vamos ver se isso é o bastante.

1. **Contato e Documentação:** "Além do nome e do WhatsApp, existe alguma outra informação de contato do cliente que é importante para vocês hoje, como um **e-mail** ou um **segundo telefone**?"
2. **Clientes Empresa (Pessoa Jurídica):** "Vocês atendem empresas? Se sim, precisam registrar o **nome da empresa** ou um **CNPJ**, além do nome da pessoa de contato?"
3. **Nota Fiscal ou Garantia:** "Para emitir uma nota fiscal ou um termo de garantia, vocês precisam do **CPF** do cliente?"
4. **Endereço:** "O **endereço** do cliente é algo que vocês costumam registrar, talvez para um serviço de entrega ou para o cadastro mesmo?"

*(**Sua Análise:** Se a resposta for "sim" para qualquer uma dessas, significa que precisamos adicionar os campos `email`, `telefone_2`, `nome_empresa`, `cnpj`, `cpf` ou campos de endereço na tabela `Clientes`)*.

Dados para Cadastro

Nome completo:
CPF:
CEP:
Endereço:
Número da residência:
Bairro:
Cidade:
Telefone para contato:
Data de nascimento:

Tela de cadastro de pessoa Jurídica é uma opção que altera e bota cnpj no lugar do cpf

tem que ter como cadastrar o cliente direto da tela de os, e fora também

---

### **2. Perguntas para Validar a Tabela `Dispositivos`**

Atualmente, planejamos guardar `tipo` e `marca_modelo`.

1. **Identificação Única:** "O **'número de série'** do equipamento é algo que vocês sempre anotam ou que seria útil ter registrado para identificar o item exato?"
2. **Situação Real:** "Imagine que um cliente deixou dois equipamentos iguais, por exemplo, dois notebooks Dell do mesmo modelo. Como vocês diferenciam um do outro na prateleira e no sistema hoje?"
    - *(**Sua Análise:** Essa pergunta reforça a importância do campo `numero_serie`)*.
3. **Acesso para Testes:** "E senhas? Quando um cliente deixa um notebook ou computador, vocês precisam registrar a **senha de login** em algum lugar seguro para conseguir fazer os testes?"
    - *(**Sua Análise:** Se sim, precisamos de um campo `senha_equipamento`, e temos que pensar na segurança dele)*.
    - 
    
    ![image.png](attachment:4f95aa9d-fa11-4e42-917c-2d25bc9aaade:image.png)
    

---

### **3. Perguntas para Validar a Tabela `OrdensDeServico`**

Esta é a tabela principal, que conecta tudo. O PDF já nos deu muitos campos, mas vamos confirmar alguns detalhes operacionais.

1. **Responsabilidade Interna:** "Dentro da equipe, vocês precisam saber qual **técnico ficou responsável** por cada conserto?"
    - *(**Sua Análise:** Se sim, isso sugere a necessidade de uma tabela `Usuarios` ou `Tecnicos` e um campo `tecnico_responsavel_id` na Ordem de Serviço)*.
        
        Sim precisa
        
2. **Urgência:** "Existe algum serviço que é mais urgente que outro? Vocês trabalham com algum tipo de **'prioridade'** (Normal, Urgente) que precise ser sinalizada no sistema?"
    - *(**Sua Análise:** Sugere um campo `prioridade` na Ordem de Serviço)*. Sim precisa, Baixa, Normal e urgente
3. **Peças e Fornecedores:** "Quando uma peça precisa ser encomendada de um fornecedor, vocês precisam registrar qual é a **peça**, de qual **fornecedor** ela veio ou a **data do pedido** da peça?"
    - *(**Sua Análise:** Pode indicar a necessidade de campos de texto como `pecas_pedidas`, `fornecedor_pecas`, `data_pedido_pecas`)*. Sim - mas é complexo e ficou pendente, precisa destrinchar - modulo de estoque
    - 
4. **Número do Documento Físico:** "A 'AOS' (aquele documento de entrada que o cliente assina)  tem um número de identificação impresso? Vocês precisam registrar esse
    
    **número da AOS** no sistema para vincular o papel ao chamado digital?" Sim
    
    - *(**Sua Análise:** Sugere um campo `numero_aos` na Ordem de Serviço)*.
- Se adaptar a comunicação do cliente, mas tentar pelo menos uma vez fazer ele responder o que queremos.

LEMBRAR DA MANUTENÇÃO PREVENTIVA

Cliente não autorizou, o que fazer ? verificar tipo de cliente ? se cliente elegível > oferecer desconto.

![WhatsApp Image 2025-10-06 at 09.32.25.jpeg](attachment:a09b87ed-708e-497a-a2d0-9d4664af3797:WhatsApp_Image_2025-10-06_at_09.32.25.jpeg)

![WhatsApp Image 2025-10-06 at 09.32.24 (3).jpeg](attachment:c680351c-c406-4352-b125-fb99c25c4dd1:WhatsApp_Image_2025-10-06_at_09.32.24_(3).jpeg)

![WhatsApp Image 2025-10-06 at 09.32.24 (2).jpeg](attachment:4350ad78-686b-47a1-af87-9854115e8b8f:WhatsApp_Image_2025-10-06_at_09.32.24_(2).jpeg)

![WhatsApp Image 2025-10-06 at 09.32.24 (1).jpeg](attachment:73a44deb-992e-4c0d-baec-65ac42daea60:WhatsApp_Image_2025-10-06_at_09.32.24_(1).jpeg)

![WhatsApp Image 2025-10-06 at 09.32.24.jpeg](attachment:4603c26b-a37e-41d6-a0c9-1983ab6a8047:WhatsApp_Image_2025-10-06_at_09.32.24.jpeg)

![WhatsApp Image 2025-10-06 at 09.32.23.jpeg](attachment:1121e625-94ea-4cf7-acdb-46cc3c2c3a30:WhatsApp_Image_2025-10-06_at_09.32.23.jpeg)