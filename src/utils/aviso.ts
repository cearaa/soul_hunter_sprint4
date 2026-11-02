import type { AvisoRota } from "../types";

/** Lê, com segurança, um aviso enviado por outra rota via `navigate(..., { state })`. */
export function lerAviso(state: unknown): AvisoRota | null {
  if (typeof state !== "object" || state === null || !("aviso" in state)) return null;
  const aviso = (state as { aviso: unknown }).aviso;
  if (typeof aviso !== "object" || aviso === null) return null;

  const { tipo, texto } = aviso as Record<string, unknown>;
  const tipoValido = tipo === "sucesso" || tipo === "erro" || tipo === "info";
  return tipoValido && typeof texto === "string" ? { tipo, texto } : null;
}
