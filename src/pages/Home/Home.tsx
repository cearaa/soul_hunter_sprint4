import {
  CircleCheck,
  Ghost as GhostIcon,
  Handshake,
  IdCard,
  Leaf,
  Rocket,
  Target,
  Ticket,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { almas } from "../../data/almas";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const features: Feature[] = [
  {
    title: "Missões diárias",
    description:
      "Registre reciclagem e deslocamentos sustentáveis na Central de Missões do Dashboard e ganhe essência, guardada de verdade no banco de dados.",
    icon: Target,
    color: "#22d3ee",
  },
  {
    title: "Ranking competitivo",
    description:
      "Suba no ranking em tempo real: cada missão concluída te aproxima do topo da tabela — e dos caçadores lendários.",
    icon: Trophy,
    color: "#fbbf24",
  },
  {
    title: "Impacto sustentável",
    description:
      "Acompanhe estatísticas reais de reciclagem, uso de transporte público e redução de CO₂ enquanto joga.",
    icon: Leaf,
    color: "#2dd4bf",
  },
  {
    title: "Caça de almas",
    description:
      "Explore estações de metrô espalhadas pela cidade e capture fantasmas com raridades e personalidades únicas.",
    icon: GhostIcon,
    color: "#8b5cf6",
  },
  {
    title: "Trocas e recompensas",
    description:
      "Converta pontos acumulados em passagens de transporte público reais — o jogo literalmente te leva a algum lugar.",
    icon: Ticket,
    color: "#d946ef",
  },
  {
    title: "Comunidade de caçadores",
    description:
      "Convide amigos, compare progressos e descubra quem realmente entende de almas raras na sua região.",
    icon: Handshake,
    color: "#67e8f9",
  },
];

interface Step {
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: Step[] = [
  { title: "Crie seu perfil", description: "Defina seu nome de caçador direto no Dashboard.", icon: IdCard },
  { title: "Cumpra missões", description: "Registre reciclagem e deslocamentos sustentáveis do seu dia.", icon: CircleCheck },
  { title: "Capture almas", description: "Explore estações e desbloqueie fantasmas raros.", icon: GhostIcon },
  { title: "Suba no ranking", description: "Acompanhe sua posição competindo com outros caçadores.", icon: TrendingUp },
];

export default function Home() {
  useDocumentTitle("SoulHunter");
  const navigate = useNavigate();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-soul-900 via-soul-800 to-soul-600 py-24 text-center">
        <GhostField
          ghosts={[
            { top: "8%", left: "6%", size: 70, color: "#22d3ee", variant: 1, delay: 0 },
            { top: "18%", right: "8%", size: 90, color: "#8b5cf6", variant: 2, delay: 0.8 },
            { bottom: "12%", left: "12%", size: 60, color: "#d946ef", variant: 3, delay: 1.4 },
            { bottom: "6%", right: "16%", size: 55, color: "#fbbf24", variant: 1, delay: 2 },
            { top: "45%", left: "45%", size: 40, color: "#2dd4bf", variant: 2, delay: 1.1, opacity: 0.35 },
          ]}
        />
        <div className="relative mx-auto w-[90%] max-w-6xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-soul-cyan/40 bg-soul-cyan/10 px-4 py-1 text-sm font-semibold text-soul-cyan">
            <GhostIcon className="h-4 w-4" aria-hidden="true" />
            Bem-vindo(a), caçador(a) de almas
          </span>
          <h2 className="mb-4 text-4xl font-extrabold leading-tight text-white sm:text-6xl">
            Transforme <span className="neon-text text-soul-cyan">sustentabilidade</span> em{" "}
            <span className="neon-text text-soul-violet-soft">evolução</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
            Gamificação ecológica moderna: capture almas, cumpra missões diárias e transforme
            atitudes sustentáveis em pontos reais — trocáveis por passagens de transporte público.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <ButtonLink to="/dashboard" ariaLabel="Acessar Dashboard da plataforma">
              <Target className="h-5 w-5" aria-hidden="true" />
              Acessar Dashboard
            </ButtonLink>
            <ButtonLink to="/ranking" variant="outline" ariaLabel="Ver ranking de caçadores">
              <Trophy className="h-5 w-5" aria-hidden="true" />
              Ver Ranking
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-[90%] max-w-6xl py-16">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white sm:text-4xl">Funcionalidades</h2>
          <p className="mx-auto max-w-2xl text-white/70">
            Tudo o que você precisa para caçar almas, evoluir de nível e ajudar o planeta ao
            mesmo tempo — direto do navegador, sem instalar nada.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} glow={feature.color}>
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${feature.color}22`, color: feature.color }}
              >
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-white/70">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-soul-950/60 py-16">
        <div className="mx-auto w-[90%] max-w-6xl text-center">
          <h2 className="mb-10 text-3xl font-bold text-white sm:text-4xl">Como funciona</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="glass-card relative p-6 transition-transform duration-300 hover:-translate-y-1">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-soul-cyan px-3 py-0.5 text-xs font-bold text-soul-950">
                  {index + 1}
                </span>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-soul-cyan/10 text-soul-cyan">
                  <step.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-1 font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-white/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     