export type Raridade = "comum" | "incomum" | "raro" | "epico" | "lendario";
export type Forca = { ataque: number; defesa: number };
export type Posicao = 0 | 1;

type Dupla<T> = [T, T];

export type Fantasma = Forca & {
  id: string;
  nome: string;
  tipo: "fantasma";
  uso: "jogavel" | "chefe";
  raridade: Raridade;
};

export type Mistica = {
  id: string;
  nome: string;
  tipo: "mistica";
  uso: "jogavel" | "promocional";
  habilidade: string;
};

export type Carta = Fantasma | Mistica;
export type Sessao = { id: string; token: string };

export type Jogada = { rodada: number; misticaId: string | null } & (
  | { fantasmaId: string }
  | { fantasmaBaixoId: string; fantasmaAltoId: string }
);

export type Rodada = {
  jogadas: Dupla<Jogada>;
  forcas: Dupla<Forca>;
  almas: Dupla<number>;
  capturouNexus?: Dupla<boolean>;
};

export type Partida = {
  id: string;
  status: "aguardando" | "em_andamento" | "finalizada";
  rodada: number | null;
  fase: "duelo" | "chefe" | null;
  raridadeDaRodada: Raridade | null;
  chefe: Fantasma;
  voce: {
    posicao: Posicao;
    nome: string;
    mao: { fantasmas: Fantasma[]; misticas: Mistica[] };
    fantasmasUsados: string[];
    misticasUsadas: string[];
    misticasDeDueloRestantes: number;
    jogadaEnviada: Jogada | null;
  };
  oponente: { posicao: Posicao; nome: string; jogou: boolean } | null;
  placar: Dupla<number>;
  historico: Rodada[];
  resultado: { vencedor: Posicao | null; empate: boolean } | null;
};

export class ErroApi extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Opcoes = {
  token?: string;
  corpo?: object;
  signal?: AbortSignal;
};

async function requisitar<T>(
  rota: string,
  { token, corpo, signal }: Opcoes = {},
): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (corpo) headers.set("Content-Type", "application/json");

  const prazo = AbortSignal.timeout(15_000);
  let resposta: Response;

  try {
    resposta = await fetch(`/api/cardgame${rota}`, {
      method: corpo ? "POST" : "GET",
      headers,
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: signal ? AbortSignal.any([signal, prazo]) : prazo,
      cache: "no-store",
    });
  } catch (erro) {
    if (signal?.aborted) throw erro;
    throw new ErroApi("A conexão com a arena falhou. Tente novamente.", 0);
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok || dados === null) {
    throw new ErroApi(
      dados?.mensagem ?? "A arena retornou uma resposta inesperada.",
      resposta.status,
    );
  }

  return dados as T;
}

export function listarCartas(signal?: AbortSignal) {
  return requisitar<{ total: number; cartas: Carta[] }>("/cartas", { signal });
}

export function acessarPartida(sessao: Sessao, nome: string, modo: "criar" | "entrar") {
  const { id, token } = sessao;

  return modo === "criar"
    ? requisitar<Partida>("/partidas", { token, corpo: { id, nome } })
    : requisitar<Partida>(`/partidas/${id}/entrar`, { token, corpo: { nome } });
}

export function consultarPartida({ id, token }: Sessao, signal: AbortSignal) {
  return requisitar<Partida>(`/partidas/${id}`, { token, signal });
}

export function enviarJogada({ id, token }: Sessao, jogada: Jogada) {
  return requisitar<Partida>(`/partidas/${id}/jogadas`, { token, corpo: jogada });
}