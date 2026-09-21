import { ArrowRight, Check, MessagesSquare, Megaphone, Play, Repeat, Trophy, Users } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FacebookIcon, InstagramIcon, WhatsappIcon } from '../ui/BrandIcons';

// Telas do painel travado: interface e números são fictícios, feitos só para ilustrar cada etapa.

const EASE = [0.22, 1, 0.36, 1] as const;

// Números fictícios (não são resultados da ZT).
const ATTRACTION_BARS = [
  { label: 'Alcance', value: '48,2 mil', width: 92 },
  { label: 'Cliques', value: '1.940', width: 64 },
  { label: 'Conversas', value: '312', width: 38 },
];

function FeedCreative() {
  return (
    <>
      <span className="creative__metric">CTR 3,1%</span>
      <span className="creative__account">
        <i /> Patrocinado
      </span>
      <strong className="creative__headline">Agende sua avaliação</strong>
      <span className="creative__cta">
        Saiba mais <ArrowRight size={10} strokeWidth={3} />
      </span>
    </>
  );
}

function ReelsCreative() {
  return (
    <>
      <span className="creative__metric">CTR 2,4%</span>
      <span className="creative__play">
        <Play size={16} fill="currentColor" />
      </span>
      <span className="creative__caption">Reels · 0:15</span>
      <span className="creative__progress">
        <i />
      </span>
    </>
  );
}

function LeadCreative() {
  return (
    <>
      <span className="creative__metric creative__metric--dark">CPL R$ 6,80</span>
      <strong className="creative__headline creative__headline--dark">Fale com um especialista</strong>
      <span className="creative__form">
        <i />
        <i />
        <b>Enviar</b>
      </span>
    </>
  );
}

const CREATIVES = [
  { key: 'a', Content: FeedCreative },
  { key: 'b', Content: ReelsCreative },
  { key: 'c', Content: LeadCreative },
];

function AttractionScreen() {
  return (
    <div className="screen screen--attraction">
      <div className="screen__head">
        <span className="screen__badge">
          <Megaphone size={14} /> Tráfego pago
        </span>
        <span className="screen__channels">
          <InstagramIcon width={14} height={14} />
          <FacebookIcon width={14} height={14} />
        </span>
      </div>
      <div className="creatives">
        {CREATIVES.map(({ key, Content }, index) => (
          <motion.div
            key={key}
            className={`creative creative--${key}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08, ease: EASE }}
          >
            <Content />
          </motion.div>
        ))}
      </div>
      <div className="bars" role="presentation">
        {ATTRACTION_BARS.map((bar, index) => (
          <div key={bar.label} className="bars__row">
            <span>{bar.label}</span>
            <div className="bars__track">
              <motion.i
                initial={{ width: 0 }}
                animate={{ width: `${bar.width}%` }}
                transition={{ duration: 0.9, delay: 0.25 + index * 0.1, ease: EASE }}
              />
            </div>
            <b className="bars__value">{bar.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

const CONVERSATIONS = [
  { initials: 'AL', channel: 'wa', tag: 'Novo', tone: 'new' },
  { initials: 'RC', channel: 'ig', tag: 'Qualificado', tone: 'hot' },
  { initials: 'MF', channel: 'fb', tag: 'Em atendimento', tone: 'warm' },
  { initials: 'JP', channel: 'wa', tag: 'Qualificado', tone: 'hot' },
] as const;

function ChannelIcon({ channel }: { channel: 'wa' | 'ig' | 'fb' }) {
  if (channel === 'wa') return <WhatsappIcon width={12} height={12} />;
  if (channel === 'ig') return <InstagramIcon width={12} height={12} />;
  return <FacebookIcon width={12} height={12} />;
}

function QualificationScreen() {
  return (
    <div className="screen screen--crm">
      <div className="screen__head">
        <span className="screen__badge">
          <MessagesSquare size={14} /> CRM · caixa de entrada
        </span>
      </div>
      <ul className="inbox">
        {CONVERSATIONS.map((item, index) => (
          <motion.li
            key={item.initials}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + index * 0.08, ease: EASE }}
          >
            <span className="inbox__avatar">
              {item.initials}
              <span className={`inbox__channel inbox__channel--${item.channel}`}>
                <ChannelIcon channel={item.channel} />
              </span>
            </span>
            <span className="inbox__lines">
              <i />
              <i />
            </span>
            <span className={`inbox__tag inbox__tag--${item.tone}`}>{item.tag}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const SCRIPT = ['Abordagem', 'Entender a necessidade', 'Apresentar a solução', 'Tratar objeções', 'Proposta'];

function ConversionScreen() {
  return (
    <div className="screen screen--script">
      <div className="screen__head">
        <span className="screen__badge">
          <Users size={14} /> Roteiro comercial
        </span>
      </div>
      <ol className="script">
        {SCRIPT.map((item, index) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + index * 0.1, ease: EASE }}
          >
            <motion.span
              className="script__box"
              initial={{ backgroundColor: 'rgba(255,125,0,0)' }}
              animate={{ backgroundColor: index < 4 ? 'rgba(255,125,0,1)' : 'rgba(255,125,0,0)' }}
              transition={{ delay: 0.5 + index * 0.18 }}
            >
              {index < 4 ? <Check size={12} strokeWidth={3} /> : null}
            </motion.span>
            {item}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function ClosingScreen() {
  return (
    <div className="screen screen--pipeline">
      <div className="screen__head">
        <span className="screen__badge">
          <Trophy size={14} /> Funil de vendas
        </span>
      </div>
      <div className="pipeline">
        {['Proposta', 'Fechado', 'Recompra'].map((column, columnIndex) => (
          <div key={column} className="pipeline__col">
            <p>{column}</p>
            {Array.from({ length: columnIndex === 0 ? 2 : 1 }, (_, index) => (
              <motion.span
                key={index}
                className={`pipeline__card${columnIndex > 0 ? ' is-won' : ''}`}
                initial={{ opacity: 0, y: columnIndex === 0 ? 0 : -18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + columnIndex * 0.16 + index * 0.06, ease: EASE }}
              >
                <i />
                <i />
                {columnIndex === 2 ? <Repeat size={12} className="pipeline__icon" /> : null}
              </motion.span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREENS = [AttractionScreen, QualificationScreen, ConversionScreen, ClosingScreen];

export function ProcessScreen({ step }: { step: number }) {
  const reduce = useReducedMotion();
  const Screen = SCREENS[step] ?? AttractionScreen;

  return (
    <div className="process-screen">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          className="process-screen__frame"
          initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduce ? undefined : { opacity: 0, y: -14, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
