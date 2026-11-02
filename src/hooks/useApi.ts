import { useCallback, useEffect, useState } from "react";
import { ApiError, isAbortError, mensagemDeErro } from "../services/api";
import type { Estado } from "../types";

interface Resultado<T> {
  buscar: unknown;
  tentativa: number;
  estado: Estado<T>;
}

interface UseApi<T> {
  estado: Estado<T>;
  /** Busca de novo. Se já havia dados na tela, eles continuam visíveis até a resposta chegar. */
  recarregar: () => void;
}

function ehVazioPadrao(dados: unknown): boolean {
  return Array.isArray(dados) && dados.length === 0;
}

/**
 * Us quando a própria tela decide o que fazer com listas vazias.
 * IMPORTANTE: `ehVazio` precisa ter identidade estável (função de módulo),
 * senão o efeito reinicia a cada render e dispara requisições em loop.
 */
export function nuncaVazio(): boolean {
  return false;
}

/**
 * Executa uma função de leitura da API e devolve o estado da tela
 * (carregando, erro, vazio ou ok). `buscar` precisa ter identidade estável
 * (use `useCallback`), assim como `ehVazio`.
 */
export function useApi<T>(
  buscar: (signal: AbortSignal) => Promise<T>,
  ehVazio: (dados: T) => boolean = ehVazioPadrao,
): UseApi<T> {
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState<Resultado<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    buscar(controller.signal)
      .then((dados) => {
        if (controller.signal.aborted) return;
        setResultado({
          buscar,
          tentativa,
          estado: ehVazio(dados) ? { status: "vazio" } : { status: "ok", dados },
        });
      })
      .catch((erro: unknown) => {
        if (controller.signal.aborted || isAbortError(erro)) return;
        setResultado({
          buscar,
          tentativa,
          estado: {
            status: "erro",
            mensagem: mensagemDeErro(erro),
            tipo: erro instanceof ApiError ? erro.kind : "desconhecido",
          },
        });
      });

    return () => controller.abort();
  }, [buscar, tentativa, ehVazio]);

  let estado: Estado<T> = { status: "carregando" };
  if (resultado && resultado.buscar === buscar) {
    const atual = resultado.tentativa === tentativa;
    const mantemTela = resultado.estado.status === "ok" || resultado.estado.status === "vazio";
    if (atual || mantemTela) estado = resultado.estado;
  }

  const recarregar = useCallback(() => setTentativa((valor) => valor + 1), []);

  return { estado, recarregar };
}
