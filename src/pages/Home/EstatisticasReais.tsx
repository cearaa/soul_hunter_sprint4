import { useCallback } from "react";
import { nuncaVazio, useApi } from "../../hooks/useApi";
import { fantasmaService } from "../../services/fantasmaService";
import { usuarioService } from "../../services/usuarioService";

interface Totais {
  cacadores: number;
  almas: number;
  essencia: number;
}

/** Números reais do banco de dados (GET /usuarios e GET /fantasmas), no lugar de estatísticas fixas. */
export default function EstatisticasReais() {
  const buscar = useCallback(async (signal: AbortSignal): Promise<Totais> => {
    const usuarios = await usuarioService.listar(signal);
    const fantasmas = await fantasmaService.listar(signal);
    return {
      cacadores: usuarios.length,
      almas: fantasmas.length,
      essencia: usuarios.reduce((soma, u) => soma + u.essencia, 0),
    };
  }, []);
  const { estado } = useApi(buscar, nuncaVazio);

  const valor = (campo: keyof Totais): string => {
    if (estado.status === "ok") return estado.dados[campo].toLocaleString("pt-BR");
    return estado.status === "carregando" ? "…" : "—";
  };

  const itens = [
    { label: "Caçadores cadastrados", valor: valor("cacadores") },
    { label: "Almas capturadas", valor: valor("almas") },
    { label: "Essência acumulada", valor: valor("essencia") },
  ];

  return (
    <section className="mx-auto w-[90%] max-w-6xl py-16" aria-label="Números da plataforma">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {itens.map((item) => (
          <div
            key={item.label}
            className="glass-card p-8 text-center transition-transform duration-300 hover:-translate-y-1"
          >
            <p
              className="text-3xl font-bold text-soul-cyan neon-text"
              aria-live="polite"
              aria-busy={estado.status === "carregando"}
            >
              {item.valor}
            </p>
            <p className="text-white/70">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-white/40">
        {estado.status === "erro"
          ? "Não foi possível carregar os números agora."
          : "Dados em tempo real da API."}
      </p>
    </section>
  );
}
