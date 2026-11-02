import type { Usuario } from "./api";

export * from "./api";

export interface Integrante {
  id: string;
  nome: string;
  rm: string;
  turma: string;
  foto: string;
  fotoPosition?: string;
  github: string;
  linkedin: string;
  bio: string;
  fantasmaFavorito: string;
}

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
}

export type Medalha = "ouro" | "prata" | "bronze" | "none";

/** Usuário da API + posição e medalha calculadas no front (Intersection Type). */
export type UsuarioComRanking = Usuario & {
  posicao: number;
  medalha: Medalha;
};

/** Aviso exibido após um redirecionamento (passado via `state` do React Router). */
export interface AvisoRota {
  tipo: "sucesso" | "erro" | "info";
  texto: string;
}

export interface Alma {
  id: string;
  nome: string;
  imagem: string;
}

export type MotivoContato =
  | "duvida"
  | "sugestao"
  | "parceria"
  | "bug"
  | "outro";

export type UrgenciaContato = "baixa" | "media" | "alta" | "urgente";

export interface ContatoFormData {
  nome: string;
  email: string;
  motivo: MotivoContato;
  urgencia: UrgenciaContato;
  mensagem: string;
}
