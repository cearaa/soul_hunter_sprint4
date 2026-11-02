import type {
  Fantasma,
  ReciclagemPayload,
  TransportePayload,
  Usuario,
  UsuarioPayload,
} from "../types";
import { requisitar } from "./api";

export const usuarioService = {
  listar: (signal?: AbortSignal) => requisitar<Usuario[]>("/usuarios", { signal }),

  buscar: (codigo: number, signal?: AbortSignal) =>
    requisitar<Usuario>(`/usuarios/${codigo}`, { signal }),

  listarFantasmas: (codigo: number, signal?: AbortSignal) =>
    requisitar<Fantasma[]>(`/usuarios/${codigo}/fantasmas`, { signal }),

  criar: (dados: UsuarioPayload) =>
    requisitar<Usuario>("/usuarios", { method: "POST", body: dados }),

  atualizar: (codigo: number, dados: UsuarioPayload) =>
    requisitar<Usuario>(`/usuarios/${codigo}`, { method: "PUT", body: dados }),

  excluir: (codigo: number) => requisitar<void>(`/usuarios/${codigo}`, { method: "DELETE" }),

  registrarReciclagem: (codigo: number, dados: ReciclagemPayload) =>
    requisitar<Usuario>(`/usuarios/${codigo}/reciclagem`, { method: "POST", body: dados }),

  registrarTransporte: (codigo: number, dados: TransportePayload) =>
    requisitar<Usuario>(`/usuarios/${codigo}/transporte`, { method: "POST", body: dados }),
};
