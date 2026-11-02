import { CircleCheck, Circle, NotebookPen } from "lucide-react";
import { gruposMissoes, totalMissoes } from "../../data/missoes";
import { useCheckinsDiarios } from "../../hooks/useCheckinsDiarios";

export default function DiarioSustentavel({ codigo }: { codigo: number }) {
  const { feitos, alternar } = useCheckinsDiarios(codigo);
  const percentual = Math.round((feitos.length / totalMissoes) * 100);

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          <NotebookPen className="h-5 w-5 text-soul-teal" aria-hidden="true" />
          Diário sustentável de hoje
        </h3>
        <span className="rounded-full bg-soul-teal/15 px-3 py-1 text-xs font-semibold text-soul-teal">
          {feitos.length}/{totalMissoes} hábitos
        </span>
      </div>

      <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-soul-teal to-soul-cyan transition-all duration-700"
          style={{ width: `${percentual}%` }}
          role="progressbar"
          aria-label="Progresso do diário sustentável"
          aria-valuenow={percentual}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="mb-5 text-xs text-white/50">
        Marque os hábitos que você cumpriu hoje. Ficam salvos neste aparelho e zeram à meia-noite.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {gruposMissoes.map((grupo) => {
          const feitosNoGrupo = grupo.missoes.filter((m) => feitos.includes(m.id)).length;
          return (
            <section key={grupo.categoria} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="mb-3 flex items-center justify-between gap-2 font-semibold text-white">
                <span className="flex items-center gap-2">
                  <grupo.icon className="h-4 w-4 text-soul-teal" aria-hidden="true" />
                  {grupo.titulo}
                </span>
                <span className="text-xs text-white/50">
                  {feitosNoGrupo}/{grupo.missoes.length}
                </span>
              </h4>
              <ul className="space-y-2">
                {grupo.missoes.map((missao) => {
                  const feito = feitos.includes(missao.id);
                  return (
                    <li key={missao.id}>
                      <button
                        type="button"
                        onClick={() => alternar(missao.id)}
                        aria-pressed={feito}
                        className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          feito
                            ? "border-soul-teal/50 bg-soul-teal/10 text-white"
                            : "border-white/10 text-white/80 hover:border-soul-cyan/40 hover:bg-white/5"
                        }`}
                      >
                        {feito ? (
                          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-soul-teal" aria-hidden="true" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
                        )}
                        <span>{missao.pergunta}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {grupo.dica && <p className="mt-3 text-xs text-soul-cyan-soft/80">{grupo.dica}</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
