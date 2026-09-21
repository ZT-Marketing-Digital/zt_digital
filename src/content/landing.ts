// Todo o texto da landing. Frases entre aspas no comentário "origem" são do site atual (ztdigital.com.br).
// Textos de interface (rótulos, microcopy) são novos, mas não fazem promessas nem trazem números sem lastro.

export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Processo', href: '#processo' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Clientes', href: '#clientes' },
  { label: 'Contato', href: '#contato' },
];

export const CTA = {
  primary: 'Quero vender mais',
  whatsapp: 'Chamar no WhatsApp',
  header: 'Fale com a ZT',
} as const;

export const HERO = {
  eyebrow: 'Assessoria de marketing completa',
  // origem: "Nosso negócio é vender o seu!"
  titleStart: 'Nosso negócio é',
  titleHighlight: 'vender o seu.',
  // origem: "Somos uma assessoria de marketing completa por um valor mensal menor que o de um funcionário."
  subtitle: 'Somos uma assessoria de marketing completa por um valor mensal menor que o de um funcionário.',
  tags: ['Tráfego pago', 'CRM para WhatsApp', 'Conteúdo', 'Sites', 'Calls semanais'],
  cards: {
    lead: { label: 'Novo lead', detail: 'via WhatsApp · CRM' },
    call: { label: 'Call semanal', detail: 'análise de métricas' },
    checkin: { label: 'Check-in mensal', detail: 'faturamento × funil' },
  },
  funnel: ['Atração', 'Qualificação', 'Conversão', 'Fechamento'],
} as const;

export const PAIN = {
  kicker: 'Se você...',
  title: 'Reconhece alguma dessas situações?',
  // origem: bloco "Se você..." + pilares da própria ZT
  items: [
    {
      before: 'Não possui um processo de geração de clientes.',
      after: 'Seu processo de vendas organizado em funil, em quatro etapas.',
    },
    {
      before: 'Já teve experiência com outra assessoria, mas sem resultados.',
      after: 'Acompanhamento interno: calls semanais e check-in mensal com os números.',
    },
    {
      before: 'Precisa vender mais, mas não sabe como?',
      after: 'Estratégia personalizada a partir do seu nicho e do seu público.',
    },
  ],
  // origem
  closing:
    'Aqui na ZT Digital você encontrará o melhor atendimento possível para a sua empresa. Entre em contato e seja a próxima empresa a faturar!',
} as const;

export const OVERVIEW = {
  kicker: 'Sobre a ZT',
  // origem: "Precisa escalar as suas vendas?"
  title: 'Precisa escalar as suas vendas?',
  // origem
  text: 'A ZT Digital é uma assessoria de marketing completa que ajudou a alavancar lucros e vendas de mais de 100 empresas, e contando. Nós utilizamos estratégias completas que vão além das mídias digitais, nosso acompanhamento interno preciso é o que nos diferencia dos demais.',
  pillars: [
    {
      title: 'Assessoria Completa',
      // origem
      text: 'Alavanque seus resultados com estratégias de marketing personalizadas e acompanhamento interno especializado, garantindo o crescimento sustentável da sua empresa.',
    },
    {
      title: 'Resultados',
      // origem
      text: 'Nosso objetivo é impulsionar seu número de vendas e maximizar o seu faturamento, através de estratégias eficazes e personalizadas que garantem um crescimento contínuo para o seu negócio.',
    },
  ],
  facts: [
    { label: 'Formato', value: 'Assessoria mensal' },
    { label: 'Acompanhamento', value: 'Calls semanais e check-in mensal' },
    { label: 'Atendimento', value: 'CRM integrado a WhatsApp, Facebook e Instagram' },
    { label: 'Sedes', value: 'Toledo-PR e Florianópolis-SC' },
  ],
} as const;

export type ProcessStep = {
  number: string;
  title: string;
  text: string;
  points: string[];
};

export const PROCESS = {
  kicker: 'Como funciona nosso processo?',
  title: 'Quatro etapas. Um funil de vendas.',
  // origem
  text: 'Por meio de quatro etapas, organizamos o seu processo de vendas num formato de funil e construímos uma estratégia para ajudar sua empresa a vender mais utilizando a internet como motor.',
  steps: [
    {
      number: '01',
      title: 'Atração',
      // origem
      text: 'Atrair pessoas para seus canais de vendas é indispensável para gerar novas vendas. Grande parte da atração é feita pelo tráfego pago.',
      points: ['Tráfego pago', 'Criação de conteúdo', 'Gestão de mídias sociais'],
    },
    {
      number: '02',
      title: 'Qualificação',
      // origem
      text: 'Conquistar a atenção dos seus clientes em potencial é o próximo caminho para gerar vendas e conversões.',
      points: ['CRM com WhatsApp, Facebook e Instagram', 'Atendimento automatizado', 'Copywriting'],
    },
    {
      number: '03',
      title: 'Conversão',
      // origem
      text: 'Para isso, empregamos estratégias que vão desde fortalecer sua equipe de vendas até desenvolver um roteiro comercial.',
      points: ['Fortalecimento da equipe de vendas', 'Roteiro comercial'],
    },
    {
      number: '04',
      title: 'Fechamento',
      // origem
      text: 'Por fim, a última etapa é induzir o cliente ao fechamento e reter o mesmo para que continue sempre comprando com sua empresa.',
      points: ['Fechamento', 'Retenção e recompra'],
    },
  ] satisfies ProcessStep[],
} as const;

export type ServiceId = 'trafego' | 'crm' | 'conteudo' | 'social' | 'sites' | 'design' | 'copy' | 'onboarding';

export type AdPlatformId = 'meta' | 'google' | 'linkedin';

export const SERVICES = {
  kicker: 'Serviços que a ZT Digital oferece',
  title: 'Tudo o que o seu marketing precisa, em uma assessoria só.',
  // Informado pela ZT em 18/09/2026 (o site atual cita só "anúncios para redes sociais").
  adPlatformsLabel: 'Plataformas de anúncios',
  adPlatforms: [
    { id: 'meta', name: 'Meta Ads' },
    { id: 'google', name: 'Google Ads' },
    { id: 'linkedin', name: 'LinkedIn Ads' },
  ] satisfies { id: AdPlatformId; name: string }[],
  items: [
    {
      id: 'trafego',
      title: 'Tráfego Pago',
      text: 'Criamos e gerenciamos campanhas estratégicas que aumentam sua visibilidade, atraem clientes qualificados e maximizam seu retorno sobre o investimento.',
    },
    {
      id: 'crm',
      title: 'CRM',
      text: 'Integre o chat do WhatsApp, Facebook e Instagram e automatize o processo de atendimento da sua empresa.',
    },
    {
      id: 'conteudo',
      title: 'Criação de Conteúdo',
      text: 'Criação de conteúdo para diferentes mídias, sejam eles para reter, atrair, nutrir, gerar receita ou engajar os leads.',
    },
    {
      id: 'social',
      title: 'Gestão de Mídias Sociais',
      text: 'Cuidamos da presença online da sua marca desde o início do planejamento, branding até a produção de conteúdo e monitoramento dos canais.',
    },
    {
      id: 'sites',
      title: 'Sites para Web',
      text: 'Oferecemos serviços de criação de sites modernos, responsivos e personalizados para destacar sua marca online.',
    },
    {
      id: 'design',
      title: 'Designing',
      text: 'Desenvolvemos identidades visuais impactantes e layouts únicos que refletem a essência da sua marca e encantam seus clientes.',
    },
    {
      id: 'copy',
      title: 'Copywriting',
      text: 'Textos persuasivos e envolventes que comunicam a essência da sua marca, engajam o público e impulsionam conversões.',
    },
    {
      id: 'onboarding',
      title: 'Onboarding',
      text: 'Integramos novos clientes de forma simples e acolhedora, garantindo uma ótima experiência desde o início.',
    },
  ] satisfies { id: ServiceId; title: string; text: string }[],
} as const;

export const MARQUEE = [
  'Tráfego pago',
  'CRM para WhatsApp',
  'Calls semanais',
  'Check-in mensal',
  'Criação de conteúdo',
  'Copywriting',
  'Sites para web',
  'Gestão de mídias sociais',
  'Roteiro comercial',
] as const;

export const HIGHLIGHT = {
  kicker: 'Como vamos ajudar a sua empresa?',
  // origem: "Não basta saber aonde quer chegar. É preciso saber como chegar lá!"
  titleStart: 'Não basta saber aonde quer chegar.',
  titleEnd: 'É preciso saber como chegar lá!',
  text: 'Cada etapa do funil vira um número acompanhado de perto: o que entra pela atração, o que avança na qualificação e o que fecha.',
  chartLabel: 'Funil de vendas',
} as const;

export const FOLLOW_UP = {
  kicker: 'Acompanhamento',
  title: 'O que acontece depois que você entra na ZT.',
  text: 'O acompanhamento interno é o que a ZT aponta como diferencial. Ele tem ritmo definido: toda semana e todo mês.',
  steps: [
    {
      tag: 'Início',
      title: 'Onboarding',
      text: 'Integramos novos clientes de forma simples e acolhedora, garantindo uma ótima experiência desde o início.',
    },
    {
      tag: 'Diagnóstico',
      title: 'Análise Interna',
      text: 'Nós da ZT Digital identificaremos seu nicho, o tipo do seu público e desenvolveremos um atendimento especial para suprir todas as suas necessidades.',
    },
    {
      tag: 'Estrutura',
      title: 'Ferramentas Inteligentes',
      text: 'Utilizamos das melhores tecnologias do mercado para criação de mídias e gerenciamento de anúncios para redes sociais. Serviços de CRM para automatizar o gerenciamento dos leads via WhatsApp.',
    },
    {
      tag: 'Toda semana',
      title: 'Acompanhamento',
      text: 'Calls semanais para análise detalhada das métricas, alinhamento de ideias para novas estratégias, otimização de processos, identificação de oportunidades e desenvolvimento de ações inovadoras e assertivas.',
    },
    {
      tag: 'Todo mês',
      title: 'Check-in Mensal',
      text: 'Reuniões para mostrar resultados, alinhar faturamentos juntamente com o funil de vendas e transformar essas métricas em estratégias para maximizar as vendas e impulsionar o desempenho da sua empresa em geral.',
    },
    {
      tag: 'Sempre',
      title: 'Assistência',
      text: 'Entre em contato a qualquer momento e nossa equipe de suporte atenderá você da melhor forma possível.',
    },
  ],
} as const;

export const CLIENTS = {
  kicker: 'Clientes',
  // origem: "Conheça alguns de nossos parceiros"
  title: 'Conheça alguns de nossos parceiros.',
  // Logos exibidos no site atual, na mesma ordem.
  items: [
    { slug: 'biopark', name: 'Biopark' },
    { slug: 'gou-odonto', name: 'Gou Odonto' },
    { slug: 'ortodoctor', name: 'OrtoDoctor Odontologia Especializada' },
    { slug: 'energy-sol', name: 'Energy Sol Sistemas Fotovoltaicos' },
    { slug: 'white-clinic', name: 'White Clinic Odontologia' },
    { slug: 'tiger-odontologia', name: 'Tiger Odontologia Digital' },
    { slug: 'odontoclinic', name: 'Odontoclinic' },
    { slug: 'oral-unic', name: 'Oral Unic' },
    { slug: 'ligga-telecom', name: 'Ligga Telecom' },
    { slug: 'leopoldo-menezes', name: 'Leopoldo Menezes Cirurgia Plástica' },
    { slug: 'body-prime', name: 'Body Prime Estética Avançada' },
    { slug: 'instituto-voce', name: 'Instituto Você' },
    { slug: 'vitacon', name: 'Vitacon' },
    { slug: 'ricardo-ribeiro', name: 'Ricardo Ribeiro' },
    { slug: 'odonto-company', name: 'Odonto Company' },
  ],
} as const;

export const ABOUT = {
  kicker: 'Quem somos',
  title: 'Uma assessoria com sede no Paraná e em Santa Catarina.',
  text: 'A ZT Marketing Digital atende empresas a partir de duas sedes: no Biopark, em Toledo-PR, e em Florianópolis-SC. O acompanhamento tem ritmo fixo, com calls semanais e check-in mensal.',
  stats: [
    { value: 100, prefix: '+', suffix: '', label: 'empresas que a ZT ajudou a alavancar vendas e lucros' },
    { value: 8, prefix: '', suffix: '', label: 'serviços dentro da mesma assessoria' },
  ],
  instagramCta: 'Acompanhe a ZT no Instagram',
} as const;

export const CONTACT = {
  kicker: 'Contato',
  title: 'Seja a próxima empresa a faturar.',
  // origem: "Caso ainda houver alguma dúvida, entre em contato com o nosso time de suporte."
  text: 'Conte um pouco sobre a sua empresa. A equipe da ZT retorna o contato para entender o seu momento. Se preferir, chame direto no WhatsApp.',
  channelsTitle: 'Fale direto com a equipe',
} as const;

export const FORM = {
  title: 'Conte sobre a sua empresa',
  subtitle: 'Campos marcados com (opcional) podem ficar em branco.',
  submit: 'Quero falar com a ZT',
  submitting: 'Enviando…',
  error: 'Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.',
  successTitle: 'Recebemos seus dados',
  successText: 'A equipe da ZT Digital vai entrar em contato pelo WhatsApp ou e-mail informado.',
  successMore: 'Quer adiantar a conversa?',
  reset: 'Enviar outra resposta',
  privacyLabelStart: 'Concordo em ser contatado(a) pela ZT Digital sobre esta solicitação e li a',
  privacyLink: 'Política de Privacidade',
} as const;

export const FORM_OPTIONS = {
  segment: [
    { value: 'saude_odontologia', label: 'Saúde e odontologia' },
    { value: 'estetica_beleza', label: 'Estética e beleza' },
    { value: 'varejo', label: 'Varejo / loja' },
    { value: 'servicos', label: 'Prestação de serviços' },
    { value: 'industria', label: 'Indústria' },
    { value: 'educacao', label: 'Educação' },
    { value: 'imobiliario', label: 'Imobiliário e construção' },
    { value: 'outro', label: 'Outro' },
  ],
  revenue: [
    { value: 'ate_20k', label: 'Até R$ 20 mil' },
    { value: '20k_50k', label: 'R$ 20 mil a R$ 50 mil' },
    { value: '50k_100k', label: 'R$ 50 mil a R$ 100 mil' },
    { value: '100k_300k', label: 'R$ 100 mil a R$ 300 mil' },
    { value: 'acima_300k', label: 'Acima de R$ 300 mil' },
    { value: 'nao_informar', label: 'Prefiro não informar' },
  ],
  interests: [
    { value: 'assessoria_completa', label: 'Assessoria completa' },
    { value: 'trafego', label: 'Tráfego pago' },
    { value: 'crm', label: 'CRM' },
    { value: 'conteudo', label: 'Conteúdo' },
    { value: 'social', label: 'Mídias sociais' },
    { value: 'sites', label: 'Site' },
    { value: 'design', label: 'Design' },
    { value: 'copy', label: 'Copywriting' },
  ],
  agency: [
    { value: 'sim', label: 'Sim, já tive' },
    { value: 'nao', label: 'Não, seria a primeira' },
  ],
  uf: [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
  ],
} as const;

export const FOOTER = {
  tagline: 'Nosso negócio é vender o seu.',
  navTitle: 'Navegação',
  contactTitle: 'Contato',
  officesTitle: 'Sedes',
  cookies: 'Preferências de cookies',
  privacy: 'Política de Privacidade e Pagamentos',
} as const;

export const CONSENT = {
  text: 'Usamos cookies e o Meta Pixel para medir a navegação e exibir anúncios da ZT no Facebook e no Instagram. Nada é carregado antes da sua escolha, e você pode mudar de ideia quando quiser em “Preferências de cookies”, no rodapé.',
  more: 'Política de Privacidade',
  accept: 'Aceitar',
  decline: 'Recusar',
} as const;
