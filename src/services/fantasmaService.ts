import type { Fantasma, FantasmaPayload } from "../types";
import { requisitar } from "./api";

export const fantasmaService = {
  listar: (signal?: AbortSignal) => requisitar<Fantasma[]>("/fantasmas", { signal }),

  buscar: (codigo: number, signal?: AbortSignal) =>
    requisitar<Fantasma>(`/fantasmas/${codigo}`, { signal }),

  criar: (dados: FantasmaPayload) =>
    requisitar<Fantasma>("/fantasmas", { method: "POST", body: dados }),

  atualizar: (codigo: number, dados: FantasmaPayload) =>
    requisitar<Fantasma>(`/fantasmas/${codigo}`, { method: "PUT", body: dados }),

  excluir: (codigo: number) => requisitar<void>(`/fantasmas/${codigo}`, { method: "DELETE" }),
};
