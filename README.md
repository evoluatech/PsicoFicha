# Psicoficha — Plataforma PWA de Formulários, Fichas e Relatórios Psicopedagógicos

> **Aviso de Ambiente Demonstrativo:** Este protótipo foi desenvolvido exclusivamente para fins de validação de experiência, design e arquitetura front-end de Progressive Web App (PWA). Todos os dados são puramente fictícios e persistidos localmente no navegador do usuário (via LocalStorage/IndexedDB). **Não insira informações de pacientes ou dados clínicos reais nesta versão.**

---

## 1. Visão Geral do Produto

**Psicoficha** (Psicopedagogia | Fichas & Relatórios) é uma aplicação web progressiva projetada com base em princípios rigorosos de design de saúde mental e educação:
- **Identidade Visual e Logo:** Prancheta clínica integrada com a letra grega **Psi (Ψ)** e caneta estilete clínica, em gradientes de ciano elétrico (`#00E5FF`), teal vibrante (`#00C4CC`) e base obsidiana profunda (`#0B1015`).
- **Suporte Completo a 3 Temas:**
  1. **Tema Claro:** Superfícies nítidas, brancas e acolhedoras para ambientes bem iluminados.
  2. **Tema Escuro:** Estética moderna em obsidiana e ciano neon diretamente inspirada na identidade oficial da Psicoficha.
  3. **Tema do Sistema:** Sincronização em tempo real com as preferências do sistema operacional (`prefers-color-scheme`).
- **Acolhimento sem infantilização:** interface limpa, elegante e acolhedora, com alta legibilidade.
- **Neutralidade e Rigor Metodológico:** separação inequívoca entre *relato espontâneo da família*, *observação direta do profissional* e *hipóteses de trabalho*.
- **Sem Diagnósticos Automatizados por IA:** a plataforma apoia a organização documental e comunicação humanizada, sem gerar laudos, conclusões médicas ou rotulações diagnósticas precoces.
- **Autonomia Offline e Resiliência PWA:** funcionamento garantido em desktop, tablets e celulares, inclusive sem conexão de rede.

---

## 2. Arquitetura Front-End e Tecnologias Utilizadas

- **Framework:** Next.js 15+ (App Router) com TypeScript
- **Estilização:** Tailwind CSS v4 com tokens de design system dedicados
- **Ícones:** Lucide React (padronização linear sem pictogramas fragmentados)
- **Áudio e Alarme:** Web Audio API (sintetizador harmônico offline em ondas senoidais, sem dependência de arquivos externos)
- **Persistência Local:** Storage Engine reativo com eventos customizados, autosave contínuo, lixeira para restauração e importação/exportação de pacotes JSON
- **PWA:** Web App Manifest (`manifest.webmanifest`), Service Worker com pre-cache e stale-while-revalidate (`/public/sw.js`), detecção de instalação e suporte a deep links.
- **Impressão A4:** Estilos de impressão `@media print` dedicados com quebras de página previsíveis e ocultação de controles para geração de PDF direto no navegador.

---

## 3. Checklist de Acessibilidade (WCAG 2.2 Nível AA)

- [x] **Contraste de Cores:** Todos os textos atingem taxa mínima de contraste de 4.5:1 em relação ao fundo marfim (`#F7FAFA`) ou branco.
- [x] **Comunicação Multimodal:** Estados semânticos (sucesso, aviso, erro, status) utilizam sempre texto descritivo e ícones, nunca apenas cores.
- [x] **Navegação por Teclado e Foco:** Estados de `focus-visible` destacados em todos os botões, links e campos de formulário.
- [x] **Áreas de Toque (Mobile):** Todos os botões e áreas interativas possuem no mínimo 44 × 44 px nos dispositivos móveis.
- [x] **Ergonomia do Polegar (Thumb Zone):** Barra de navegação inferior móvel situada nos 40% inferiores da tela.
- [x] **Gráficos Acessíveis:** O mapa de domínios em radar e o gráfico de evolução possuem descrição textual completa e acessível a leitores de tela.
- [x] **Prevenção de Ações Destrutivas:** Nenhuma exclusão por um clique; modais explicativos com confirmação explícita.
- [x] **Suporte a Zoom:** Layout flexível sem corte de texto em ampliações de até 200%.

---

## 4. Checklist PWA e Notificações

- [x] **Web App Manifest Completo:** `id`, `name`, `short_name` (≤ 12 caracteres: `PráxisPsico`), `display: standalone`, `theme_color: #176B73`, `background_color: #F7FAFA`.
- [x] **Service Worker Ativo:** Gerencia cache essencial de assets, intercepta falhas de rede e redireciona para `/offline`.
- [x] **Instalação In-App:** Botão "Instalar App" no header e sidebar com captura do evento `beforeinstallprompt` e modal explicativo passo a passo para usuários de iOS Safari.
- [x] **Indicador de Conectividade:** Banner e indicador em tempo real de status Online / Offline.
- [x] **Alarme e Notificação Consciente:** Notificações disparadas apenas sob permissão explícita clicada pelo usuário; fallback sonoro harmônico via Web Audio API e vibração no navegador.

---

## 5. Documentação de Handoff para Figma (Design Tokens)

### Paleta Cromática
- `primary-700`: `#176B73` (Azul-petróleo profundo — botões primários, confiança e cabeçalhos)
- `primary-600`: `#238B8D` (Teal vibrante — elementos ativos, links e focos)
- `primary-100`: `#D4ECEC` / `primary-50`: `#F0F8F8` (Superfícies de destaque e badges)
- `secondary-500`: `#8B7BB5` (Lavanda — acolhimento, família e etapas reflexivas)
- `accent-500`: `#6FA58B` (Verde-sálvia — evolução, potencialidades e avanços)
- `surface-50`: `#F7FAFA` (Fundo geral da aplicação)
- `surface-100`: `#EEF5F4` (Divisores e bordas estruturais)
- `ink-900`: `#183238` (Texto principal de alta legibilidade)
- `ink-600`: `#52676B` (Texto de apoio e metadados)
- `warning-600`: `#A86B00` (Avisos e pendências)
- `danger-600`: `#B54747` (Ações destrutivas e alertas)

### Tipografia
- Família: `system-ui, -apple-system, Inter, sans-serif`
- Escala:
  - Display / Título de Página: 24px–30px, Semibold 700
  - Títulos de Seção: 14px–16px, Bold 700
  - Corpo / Textos de Leitura: 13px–14px, Regular 400 (line-height 1.6)
  - Metadados e Rótulos: 11px–12px, Medium 500
  - Cifras e Códigos: Tabular Numerals / `font-mono`

### Geometria e Superfícies
- Cartões e Modais: `rounded-2xl` (16px) a `rounded-3xl` (24px)
- Botões: `rounded-xl` (12px)
- Sombras: Sutis de nível único (`shadow-xs` / `shadow-sm`)

---

## 6. Limitações Técnicas e Itens Não Implementados (Requisitos para Produção)

Como especificado no escopo do projeto, os seguintes itens **NÃO** fazem parte deste protótipo e devem ser desenvolvidos em uma futura etapa corporativa:

1. **Backend e Banco de Dados Remoto:** O protótipo armazena dados em `localStorage` local. Uma versão de produção exigirá um banco relacional escalável (como PostgreSQL) com criptografia ponta a ponta.
2. **Autenticação Real e RBAC:** Não há login com senhas reais ou controle de acesso baseado em papéis (ex: administrador, psicopedagogo clínico, estagiário, coordenação escolar).
3. **Assinatura Digital Juridicamente Válida:** A assinatura exibida nos relatórios é demonstrativa e não possui validade ICP-Brasil ou certificados digitais X.509.
4. **Push Notifications em Segundo Plano Completo:** Notificações com o celular bloqueado ou navegador totalmente encerrado requerem infraestrutura de Web Push / VAPID e servidor dedicado.
5. **Auditoria e Logs de Acesso LGPD:** Em produção, é obrigatório registrar trilhas imutáveis de quem visualizou ou alterou cada prontuário sensível.
6. **Envio Real de E-mails / Mensagens:** Os formulários e lembretes apenas preparam o conteúdo localmente.

---

## 7. Instruções de Execução

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse em `http://localhost:3000`.
4. Para compilar a versão final:
   ```bash
   npm run build
   ```
