/**
 * Tipos do contrato com a API Java (Spring Boot + Oracle).
 * Base: https://soulhunter-rm571411.onrender.com/soulhunter
 */

/* ---------- Modelos retornados pela API (interfaces) ---------- */

export interface Usuario {
  codigo: number;
  nome: string;
  email: string;
  essencia: number;
  titulo: string;
}

export interface Fantasma {
  codigo: number;
  nome: string;
  tipo: string;
  raridade: string;
  valorEssencia: number;
  codUsuario: number;
}

/* ---------- Corpos enviados pelo front (POST/PUT) ---------- */

export interface UsuarioPayload {
  nome: string;
  email: string;
}

export interface FantasmaPayload {
  nome: string;
  tipo: string;
  raridade: string;
  valorEssencia: number;
  codUsuario: number;
}

export interface ReciclagemPayload {
  tipoMaterial: TipoMaterial;
  quilos: number;
}

export interface TransportePayload {
  tipoTransporte: TipoTransporte;
  km: number;
}

/* ---------- Union Types ---------- */

export type TipoMaterial = "Plástico" | "Vidro" | "Papel" | "Metal" | "Orgânico";

export type TipoTransporte = "Bicicleta" | "Caminhada" | "Ônibus" | "Metrô" | "Trem";

export type Raridade = "Comum" | "Raro" | "Épico" | "Lendário";

export type MetodoHttp = "GET" | "POST" | "PUT" | "DELETE";

export type ApiErrorKind =
  | "rede"
  | "nao-encontrado"
  | "validacao"
  | "regra"
  | "servidor"
  | "desconhecido";

/** Estado de uma tela que consome a API (união discriminada). */
export type Estado<T> =
  | { status: "carregando" }
  | { status: "erro"; mensagem: string; tipo: ApiErrorKind }
  | { status: "vazio" }
  | { status: "ok"; dados: T };

/* ---------- Tipos básicos e object ---------- */

export interface ApiConfig {
  baseUrl: string;
  tentarNovamente: boolean;
  tentativasMax: number;
}

export type CorpoHttp = Record<string, unknown>;

/* ---------- Intersection Types ---------- */

export type Fantasmas = { fantasmas: Fantasma[] };

export type UsuarioComFantasmas = Usuario & Fantasmas;
