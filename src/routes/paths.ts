/** Rotas estáticas: caminhos fixos da aplicação. */
export const ROTAS = {
  home: "/",
  integrantes: "/integrantes",
  sobre: "/sobre",
  faq: "/faq",
  contato: "/contato",
  dashboard: "/dashboard",
  ranking: "/ranking",
  cacadores: "/cacadores",
  fantasmas: "/fantasmas",
  jogar: "/soulhunter",
  cardgame: "/cardgame",
  fantasma: "/fantasma",
} as const;

export type RotaEstatica = (typeof ROTAS)[keyof typeof ROTAS];

/** Padrões de rotas dinâmicas (usados na definição do roteador). */
export const PADROES = {
  integrante: "integrantes/:id",
  cacador: "cacadores/:id",
} as const;

/** Construtores de URL das rotas dinâmicas. */
export const caminhoDe = {
  integrante: (id: string): string => `/integrantes/${encodeURIComponent(id)}`,
  cacador: (codigo: number | string): string => `/cacadores/${codigo}`,
};
