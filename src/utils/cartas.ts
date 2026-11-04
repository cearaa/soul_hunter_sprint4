import type { Carta, Raridade } from "../services/cardGameService";

export const raridades: Record<Raridade, string> = {
  comum: "Comum",
  incomum: "Incomum",
  raro: "Raro",
  epico: "Épico",
  lendario: "Lendário",
};

export function temaCarta(carta: Carta) {
  return carta.tipo === "fantasma" ? carta.raridade : "mistica";
}
const foco = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cg-ciano";
const clicavel = `cursor-pointer disabled:cursor-not-allowed disabled:opacity-55 ${foco}`;
const etiquetaBase = "font-mono text-[.68rem] leading-normal font-bold tracking-[.15em]";

// Classes Tailwind repetidas entre o lobby, a arena e o catálogo do Card Game.
export const cg = {
  etiquetaBase,
  etiqueta: `${etiquetaBase} text-cg-ciano`,
  luz: "mr-1 inline-block h-[7px] w-[7px] rounded-full bg-cg-ciano shadow-[0_0_10px_#75edf880]",
  painel: "min-w-0 rounded-2xl border border-cg-linha bg-cg-painel p-[clamp(16px,3vw,26px)]",
  titulo: "mt-1 mb-3 text-[clamp(1.42rem,3vw,1.8rem)] leading-[1.18] font-bold tracking-[-.035em]",
  linhaSecao: "flex flex-wrap items-center justify-between gap-x-5 gap-y-3",
  formulario: "grid min-w-0 gap-[13px]",
  rotulo: "text-[.91rem] font-[650] text-[#e0ecfd]",
  campo: `mt-1.5 block w-full min-w-0 rounded-lg border border-[#344765] bg-[#090f1f] px-3 py-2.5 text-[#eef3ff] placeholder:text-[#9baac2] ${foco}`,
  botao: `min-h-10 w-fit rounded-lg border border-[#3a5171] bg-[#15243b] px-3.5 py-2 text-[.9rem] font-bold text-[#edf4ff] enabled:hover:border-cg-ciano ${clicavel}`,
  primario: `min-h-[45px] w-full rounded-lg border border-cg-ciano bg-cg-ciano px-3.5 py-2 text-[.9rem] font-bold text-[#071923] enabled:hover:bg-[#a0f6ff] ${clicavel}`,
  alternar: `flex-[1_1_130px] rounded-[7px] border border-transparent p-2 text-[.9rem] font-[650] text-cg-suave aria-pressed:border-[#2e4b66] aria-pressed:bg-[#172a42] aria-pressed:text-cg-ciano ${clicavel}`,
  erro: "rounded-lg border border-[#66374b] bg-[#381e30] px-3 py-2.5 text-[#ffd2db]",
  carta:
    "flex min-w-0 flex-col items-stretch rounded-[10px] border border-[color:color-mix(in_srgb,var(--cor)_48%,#17243b)] bg-[linear-gradient(150deg,color-mix(in_srgb,var(--cor)_11%,#111c30),#10172a)] p-[9px] text-left text-(color:--cor) " +
    "[--cor:#77dbea] data-[tema=incomum]:[--cor:#74e8bd] data-[tema=raro]:[--cor:#92bfff] data-[tema=epico]:[--cor:#d7b8ff] data-[tema=lendario]:[--cor:#ffda89] data-[tema=mistica]:[--cor:#ffc0f3]",
};
