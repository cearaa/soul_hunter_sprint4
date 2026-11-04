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