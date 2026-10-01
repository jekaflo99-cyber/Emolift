# Relatório Completo: EmoLift – Daily Mood Support

Documentação técnica e funcional completa da aplicação **EmoLift – Daily Mood Support**.

---

## 1. Visão Geral e Objetivos da Aplicação

### 🎯 Objetivo Principal
O **EmoLift** é uma aplicação móvel de suporte e regulação emocional diária. Funciona como um **diário inteligente e empático**, concebido para permitir ao utilizador expressar os seus sentimentos e pensamentos com total privacidade, recebendo validação psicológica imediata, refrações positivas e pequenos exercícios de ancoragem gerados por Inteligência Artificial (Google Gemini).

### 💡 Objetivos Específicos e Valor para o Utilizador:
1. **Espaço Seguro e Sem Julgamentos:** Permitir ao utilizador registar honestamente o seu estado de espírito em menos de 10 segundos ou através de desabafos mais profundos.
2. **Prevenção do Esgotamento e Suporte Imediato:** Oferecer respostas de suporte empáticas e contextualizadas (ao invés de frases feitas ou respostas genéricas).
3. **Identificação de Padrões e Gatilhos de Vida:** Cruzar as emoções sentidas com áreas concretas do quotidiano (trabalho, relações, saúde, finanças, autovalorização) para identificar o que realmente afeta o bem-estar do utilizador.
4. **Construção de Hábito (Consistência Emocional):** Utilizar mecânicas leves de gamificação (*streaks*, frases do dia e badges) para incentivar a auto-observação diária contínua.
5. **Retrospectivas e Autoconhecimento:** Proporcionar rituais de fecho semanal e mensal guiados por IA, ajudando o utilizador a avaliar o seu progresso emocional ao longo do tempo.

---

## 2. Mapa Funcional e Capacidades Atuais

### 2.1. Fluxo de Onboarding (`screens/Onboarding.tsx`)
* **Apresentação em 3 passos:** Foco na simplicidade e clareza de valor:
  1. *"Escreve as tuas emoções."*
  2. *"Recebe apoio."*
  3. *"Sente-te melhor."*
* **Guarda de Estado:** Apresentado apenas na primeira utilização. Uma vez concluído, o estado `isOnboarded` é persistido e as próximas sessões abrem diretamente no ecrã principal.

---

### 2.2. Ecrã Principal (`screens/Home.tsx`)
O ecrã principal é o centro de entrada de dados diários e inclui:

1. **Frase do Dia Dinâmica (*Quote of the Day*):**
   * Apresenta uma citação inspiradora calculada de forma determinística por dia (baseada na data).
   * Ajusta-se à emoção do dia anterior do utilizador (ex.: frases de calma se ontem esteve stressado, de encorajamento se esteve triste).
   * Clicável no plano Pro para transferir a frase diretamente para a caixa de reflexão.
2. **Contador de Quota Diária:**
   * Mostra os apoios restantes no dia (Plano Gratuito: 2 apoios/dia; Plano Pro: 10 apoios/dia).
3. **Bento Grid de Emoções (7 Emoções Primárias):**
   * Layout assimétrico moderno estilo Bento Grid com cores temáticas, gradientes e emojis 3D:
     * 🤩 **Feliz** (Amarelo / Laranja)
     * 😢 **Triste** (Azul / Índigo)
     * 🤯 **Stressado** (Laranja / Vermelho)
     * 😰 **Ansioso** (Roxo / Fúcsia)
     * 😡 **Zangado / Com Raiva** (Vermelho / Rosa)
     * 😴 **Cansado** (Cinza / Ardósia)
     * 😐 **Neutro / Normal** (Verde-Azulado / Esmeralda)
4. **Context Chips (Gatilhos de Vida):**
   * Seleção opcional de áreas temáticas associadas ao sentimento:
     * 💼 *Trabalho/Estudos*
     * ❤️ *Relações*
     * 🩺 *Saúde*
     * 💰 *Finanças*
     * 👤 *Eu Próprio / Eu Mesmo*
     * ⭕ *Outro*
5. **Caixa de Texto Livre:**
   * Espaço limpo e sem distrações para escrever pensamentos e desabafos espontâneos.
6. **Ações Disponíveis:**
   * **Obter Apoio (Get Support):** Envia a emoção, o contexto e o texto para a IA e transita para o ecrã de resposta.
   * **Registo Rápido (Quick Log - Pro):** Regista instantaneamente o humor e os contextos no diário sem necessidade de redigir texto.
   * **Desabafo Urgente (Emergency Vent Mode - Pro):** 
     * Destinado a momentos de crise e intensidade emocional.
     * Regra de moderação de utilização: disponível **1 vez a cada 30 dias** com contador decrescente de dias restantes.

---

### 2.3. Motor de Inteligência Artificial (`services/geminiService.ts`)
A aplicação utiliza o SDK oficial `@google/genai` com o modelo **`gemini-2.5-flash`**, operando em modos especializados:

1. **Modo Standard (Apoio Diário):**
   * Resposta de 2 a 3 frases, acolhedora, empática e motivacional, diretamente adaptada à emoção e aos contextos selecionados.
2. **Modo Vent (Desabafo de Urgência):**
   * Resposta profunda de 6 a 7 frases com validação emocional calorosa, sugestão de micro-exercício de ancoragem/respiração corporal e reenquadramento gentil da situação.
   * **Protocolo de Segurança:** Instruções para lidar com expressões de risco ou ideação suicida, encaminhando com apoio para linhas de emergência sem emitir diagnósticos médicos.
3. **Modo Restart (Recomeçar o Dia):**
   * Resposta focada em quebrar ciclos de frustração de um dia que correu mal, oferecendo reforço de autoestima e sugerindo uma micro-ação de autocuidado.
4. **Insights de Correlação Analítica:**
   * A IA analisa os dados agregados da semana ou do mês (emoção #1, emoção #2 e contextos mais frequentes) e redige uma observação conversacional clara e sem jargão clínico (ex.: *"Parece que a ansiedade esteve presente esta semana ligada ao trabalho, mas também tiveste momentos de calma"*).
5. **Suporte Multilíngue Nativo:**
   * Prompts e respostas geradas nativamente no idioma ativo do utilizador: **Português (Portugal)**, **Português (Brasil)**, **Inglês** ou **Espanhol**.
   * Fallback com mensagens de apoio offline amigáveis caso ocorra indisponibilidade de rede.

---

### 2.4. Ecrã de Resposta e Gamificação (`screens/Response.tsx`)
* **Apresentação do Desabafo e da Resposta:** Visualização em balões estilizados com o avatar da emoção e o carimbo visual da EmoLift AI.
* **Marcadores Emocionais (Bookmarks Pro):**
   * O utilizador pode categorizar o registo com um selo especial:
     * 💡 *Clareza*
     * ⭐ *Vitória*
     * 🪶 *Reflexão Profunda*
     * 🛡️ *Desabafo*
     * ⚓ *Momento de Calma*
* **Badge de Streaks (Dias Seguidos):**
   * Ao guardar a entrada, exibe um modal comemorativo animado com os dias seguidos completados (*Streak* 🔥) e mensagens de reforço de resiliência.

---

### 2.5. Diário Emocional e Linha do Tempo (`screens/Journal.tsx`)
* **Timeline Vertical Estilizada:**
   * Linha vertical contínua com nós esféricos 3D com emojis de humor e indicação de hora e data.
   * Exibição de texto do utilizador, resposta da IA, etiquetas de contexto e marcadores.
* **Diferenciação Visual de Cartões:**
   * Registos diários padrão em cartões brancos/escuros flutuantes.
   * **Cartões Dourados/Âmbar** destacados para **Reflexões Semanais**.
   * **Cartões Púrpura/Gradiente** destacados para **Reflexões Mensais**.
* **Gestão de Entradas:**
   * Eliminação individual de registos com modal de confirmação seguro.
* **Regras de Acesso:**
   * Utilizadores Gratuitos: Visualizam até 5 registos no histórico.
   * Utilizadores Pro: Histórico ilimitado e sem restrições.

---

### 2.6. Estatísticas e Análise Avançada (`screens/Statistics.tsx`)
* **Período de Experimentação Gratuito (Trial de 7 Dias):**
   * Novos utilizadores têm acesso livre às estatísticas nos primeiros 7 dias após a instalação, após os quais é solicitado o plano Pro.
* **Mood Mix (Gráfico de Distribuição):**
   * Gráfico circular interativo (*Donut Chart*) em Recharts com filtros rápidos por **Dia**, **Semana** ou **Mês**.
   * Contagem total de entradas e lista detalhada por percentagem e contagem de cada humor.
* **Mood Calendar (Calendário Mensal de Humor):**
   * Começa à **Segunda-feira** (formato europeu).
   * Cada dia com registos exibe uma esfera preenchida com a cor sólida da emoção dominante desse dia.
   * Ponto indicador no dia atual.
   * **Navegação de Meses:** Permite avançar e recuar no histórico.
   * **Week Handle:** Pega de arrasto/clique na margem de cada linha semanal que filtra instantaneamente essa semana no gráfico.
* **Bottom Sheet de Entradas:**
   * Ao clicar no botão de resumo, abre uma gaveta inferior (*bottom sheet*) com todos os registos do período filtrado e botão direto *"Ver no Diário"*.
* **Modal de Reflexão Semanal Guiada (`components/WeeklyReflectionModal.tsx`):**
   * Passo 1: As 2 principais emoções da semana com percentagens.
   * Passo 2: Insight gerado pela IA cruzando as emoções com os contextos de vida.
   * Passo 3: Pergunta aberta de reflexão para o utilizador escrever e guardar na timeline.
* **Modal de Reflexão Mensal Guiada (`components/MonthlyReflectionModal.tsx`):**
   * Disparado automaticamente no início de cada mês para utilizadores Pro ou acessível diretamente no calendário para meses passados / último dia do mês.
   * Gráfico do mês, Top 3 emoções, cruzamento com contextos via IA e campo de reflexão pessoal.

---

### 2.7. Definições e Ferramentas (`screens/Settings.tsx`)
1. **Preferências do Sistema:**
   * Alternância de Tema Claro e Escuro (*Dark Mode* completo).
   * Seletor de Idiomas: Inglês, Português (PT), Português (BR) e Espanhol.
   * Ativação de Notificações / Lembretes Diários (Web Notifications API).
2. **Monetização:**
   * Informação de subscrição Pro ativa ou banner para atualizar para Pro.
   * Botão de restauro de compras.
3. **Zona de Desenvolvedor (Developer & Testing Tools):**
   * **Gerar 30 Dias + Ativar Pro:** Seeder integrado que gera 30 dias de dados realistas e históricos com múltiplos contextos e emoções, recalculando automaticamente os *streaks* para permitir testar todos os gráficos e reflexões sem esforço.
   * **Apagar Tudo (Reset DB):** Limpeza total de dados para testes em branco.
4. **Informações Legais:** Política de privacidade e versão da app.

---

### 2.8. Monetização e Paywall (`screens/Paywall.tsx`)
* Apresenta os benefícios do **EmoLift Pro** (€2,99 / mês):
  * Sem anúncios.
  * Modo Desabafo Urgente (*Emergency Vent*).
  * Funcionalidade de Recomeçar o Dia (*Restart Day*).
  * 10 apoios por dia com IA (em vez de 2).
  * Reflexão Semanal e Mensal guiadas por IA.
  * Acesso a estatísticas e gráficos históricos ilimitados.
  * Marcadores emocionais (*Bookmarks*).

---

## 3. Arquitetura Técnica e Armazenamento

* **Frontend:** React 19 SPA com TypeScript, estilizado com Tailwind CSS e componentes modulares.
* **Ícones e Gráficos:** `lucide-react` para iconografia e `recharts` para gráficos responsivos de humor.
* **Gestão de Estado Global:** `AppContext.tsx` gerindo definições do utilizador, histórico de entradas, cálculos de assiduidade (*streaks* diários e mais longos), cotas de consumo diárias e deteção de novos dias ao regressar à app (`visibilitychange`).
* **Persistência de Dados:** Armazenamento local seguro no navegador (`localStorage`), sem necessidade de registo de conta para máxima privacidade do utilizador.
* **Motor de IA:** SDK oficial `@google/genai` (v1.30+) utilizando o modelo `gemini-2.5-flash`.
