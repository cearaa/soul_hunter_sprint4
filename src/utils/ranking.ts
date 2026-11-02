import { Award, Crown, Medal, type LucideIcon } from "lucide-react";
import type { Medalha, Usuario, UsuarioComRanking } from "../types";

export interface MedalhaVisual {
  icon: LucideIcon;
  color: string;
  label: string;
}

/** Ícone e cor de cada medalha. Posições sem medalha retornam null. */
export const medalhaVisual: Record<Medalha, MedalhaVisual | null> = {
  ouro: { icon: Crown, color: "#fbbf24", label: "Medalha de ouro" },
  prata: { icon: Medal, color: "#cbd5e1", label: "Medalha de prata" },
  bronze: { icon: Award, color: "#d97706", label: "Medalha de bronze" },
  none: null,
};

function medalhaPorPosicao(posicao: number, essencia: number): Medalha {
  if (essencia <= 0) return "none";
  if (posicao === 1) return "ouro";
  if (posicao === 2) return "prata";
  if (posicao === 3) return "bronze";
  return "none";
}

/**
 * Transforma a lista de usuários da API em ranking: ordena por essência
 * (maior primeiro), calcula a posição (empates dividem a posição) e a medalha.
 */
export function montarRanking(usuarios: Usuario[]): UsuarioComRanking[] {
  const ordenados = [...usuarios].sort(
    (a, b) => b.essencia - a.essencia || a.nome.localeCompare(b.nome, "pt-BR"),
  );

  let posicaoAtual = 0;
  return ordenados.map((usuario, index) => {
    if (index === 0 || usuario.essencia !== ordenados[index - 1].essencia) {
      posicaoAtual = index + 1;
    }
    return {
      ...usuario,
      posicao: posicaoAtual,
      medalha: medalhaPorPosicao(posicaoAtual, usuario.essencia),
    };
  });
}
