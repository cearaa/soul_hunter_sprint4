import type { TipoTransporte } from "../types";

/** Regras do back-end: reciclagem +5 por quilo; bicicleta +3 por km; demais meios +2 por km. */
export function essenciaReciclagem(quilos: number): number {
  return Math.round(quilos * 5);
}

export function essenciaTransporte(tipo: TipoTransporte, km: number): number {
  const porKm = tipo === "Bicicleta" ? 3 : 2;
  return Math.round(km * porKm);
}
