Requisição de Estoque – Fluig & Datasul
📌 Objetivo

Automatizar e integrar o processo de Solicitação de Compra e Requisição de Estoque entre Fluig e ERP Datasul, eliminando controles paralelos em planilhas, reduzindo inconsistências e garantindo maior rastreabilidade e eficiência.

🚀 Escopo

Fluxo de Solicitação

Abertura de requisição no Fluig (materiais).

Validações automáticas de saldo em estoque físico e Datasul.

Aprovação por centro de custo.

Atendimento via baixa de estoque ou ordem de compra.

Registro histórico das movimentações.

Formulários e Campos

Cabeçalho: tipo de solicitação, estabelecimento, info internas.

Itens: código, descrição, quantidade, unidade, saldos (físico/Datasul), status, observações.

Movimentações: histórico de entradas e saídas.

Recursos extras: botão de atualização de saldo e justificativa para divergências.

Validações

Bloqueio de itens obsoletos.

Verificação de saldos em tempo real.

Justificativa obrigatória em divergências.

Auditoria completa de movimentações.

Integrações

Fluig ↔ Datasul: consulta e baixa de saldo, status de item, atualização de inventário.

Fluig ↔ Controle Físico: consulta de saldo e registro de movimentação.

Fluig WCM ↔ ECM: cadastro e gestão de itens via GED.

⚙️ Requisitos Técnicos

Resposta de consultas em até 5s.

Processo (exceto aprovações) concluído em até 15 min.

Interface alinhada ao padrão Fluig.

Tecnologias: HTML5, JQuery, JavaScript, APIs REST (GET/POST/PUT).

Plataforma: Fluig BPM/ECM + ERP Datasul.

Suporte a inventário rotativo e geral.

🔒 Segurança

Acesso restrito a grupos autorizados.

Justificativa obrigatória para ajustes manuais.

Conformidade com LGPD.

🏗️ Arquitetura

Centralização do cadastro de materiais no Fluig.

Integração em tempo real com Datasul e estoque físico.

Rastreabilidade completa das movimentações.
