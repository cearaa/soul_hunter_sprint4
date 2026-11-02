import type { ApiConfig, ApiErrorKind, CorpoHttp, MetodoHttp } from "../types";

const URL_PADRAO = "https://soulhunter-rm571411.onrender.com/soulhunter";

export const apiConfig: ApiConfig = {
  baseUrl: (import.meta.env.VITE_API_URL ?? URL_PADRAO).replace(/\/+$/, ""),
  tentarNovamente: true,
  tentativasMax: 2,
};

/** Erro padronizado de qualquer chamada à API. */
export class ApiError extends Error {
  kind: ApiErrorKind;
  status: number;

  constructor(message: string, kind: ApiErrorKind, status: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

export function isAbortError(erro: unknown): boolean {
  return erro instanceof DOMException && erro.name === "AbortError";
}

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) return erro.message;
  return "Algo inesperado aconteceu. Tente novamente.";
}

/**
 * O back-end Java usa uma única conexão estática com o banco, então duas
 * requisições simultâneas podem se atrapalhar. Esta fila garante que as
 * chamadas saiam sempre em sequência, mesmo que vários componentes peçam
 * dados ao mesmo tempo.
 */
let fila: Promise<unknown> = Promise.resolve();

function enfileirar<T>(tarefa: () => Promise<T>): Promise<T> {
  const execucao = fila.then(tarefa);
  fila = execucao.catch(() => undefined);
  return execucao;
}

interface Opcoes {
  method?: MetodoHttp;
  body?: CorpoHttp | object;
  signal?: AbortSignal;
}

function erroPorStatus(status: number, texto: string, ehJson: boolean): ApiError {
  if (status === 404) {
    return new ApiError(texto || "Registro não encontrado.", "nao-encontrado", status);
  }
  if (status === 400) {
    return ehJson
      ? new ApiError("Confira os campos informados e tente novamente.", "validacao", status)
      : new ApiError(texto || "Requisição inválida.", "regra", status);
  }
  if (status >= 500) {
    return new ApiError(
      "O servidor não conseguiu concluir a operação. Tente novamente em instantes.",
      "servidor",
      status,
    );
  }
  return new ApiError(texto || "Erro inesperado na API.", "desconhecido", status);
}

async function executar<T>(caminho: string, { method = "GET", body, signal }: Opcoes): Promise<T> {
  if (signal?.aborted) throw new DOMException("Requisição cancelada", "AbortError");

  let resposta: Response;
  try {
    resposta = await fetch(`${apiConfig.baseUrl}${caminho}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (erro) {
    if (isAbortError(erro)) throw erro;
    throw new ApiError(
      "Não foi possível conectar à API. Verifique sua internet ou tente de novo (a API gratuita pode levar até 1 minuto para acordar).",
      "rede",
      0,
    );
  }

  const texto = await resposta.text();
  const ehJson = (resposta.headers.get("content-type") ?? "").includes("application/json");

  if (!resposta.ok) throw erroPorStatus(resposta.status, ehJson ? "" : texto.trim(), ehJson);

  if (resposta.status === 204 || texto === "") return undefined as T;

  try {
    return JSON.parse(texto) as T;
  } catch {
    throw new ApiError("A API devolveu uma resposta em formato inesperado.", "desconhecido", resposta.status);
  }
}

/**
 * Ponto único de acesso HTTP (fetch nativo). Requisições GET são repetidas
 * uma vez em caso de falha de rede ou erro 500 (ex.: API acordando).
 */
export async function requisitar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const ehLeitura = (opcoes.method ?? "GET") === "GET";
  const tentativas = ehLeitura && apiConfig.tentarNovamente ? apiConfig.tentativasMax : 1;

  let ultimoErro: unknown;
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      return await enfileirar(() => executar<T>(caminho, opcoes));
    } catch (erro) {
      ultimoErro = erro;
      const repetivel = erro instanceof ApiError && (erro.kind === "rede" || erro.kind === "servidor");
      if (!repetivel) throw erro;
    }
  }
  throw ultimoErro;
}
