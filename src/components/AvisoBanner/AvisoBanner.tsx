import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import type { AvisoRota } from "../../types";

interface AvisoBannerProps {
  aviso: AvisoRota;
  onFechar?: () => void;
}

const estilos: Record<AvisoRota["tipo"], string> = {
  sucesso: "border-soul-teal/50 bg-soul-teal/10 text-soul-teal",
  erro: "border-rose-400/50 bg-rose-500/10 text-rose-200",
  info: "border-soul-cyan/50 bg-soul-cyan/10 text-soul-cyan-soft",
};

const icones = { sucesso: CircleCheck, erro: TriangleAlert, info: Info } as const;

/** Faixa de feedback (sucesso, erro ou informação) usada após ações e redirecionamentos. */
export default function AvisoBanner({ aviso, onFechar }: AvisoBannerProps) {
  const Icone = icones[aviso.tipo];
  return (
    <div
      role={aviso.tipo === "erro" ? "alert" : "status"}
      className={`mx-auto mb-6 flex max-w-4xl items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium ${estilos[aviso.tipo]}`}
    >
      <Icone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 break-words">{aviso.texto}</p>
      {onFechar && (
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar aviso"
          className="shrink-0 rounded p-0.5 text-white/70 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
