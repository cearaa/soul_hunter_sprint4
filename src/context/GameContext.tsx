import { useCallback, useMemo, useReducer, type ReactNode } from "react";
import { GameContext, type GameContextValue, type Toast } from "./gameContextDefinition";

const CHAVE_USUARIO = "soulhunter:usuario-atual";

interface GameState {
  codigoUsuario: number | null;
  toasts: Toast[];
}

type GameAction =
  | { type: "SELECIONAR_USUARIO"; codigo: number | null }
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "DISMISS_TOAST"; id: number };

function lerUsuarioSalvo(): number | null {
  try {
    const salvo = Number(localStorage.getItem(CHAVE_USUARIO));
    return Number.isInteger(salvo) && salvo > 0 ? salvo : null;
  } catch {
    return null;
  }
}

function salvarUsuario(codigo: number | null): void {
  try {
    if (codigo === null) localStorage.removeItem(CHAVE_USUARIO);
    else localStorage.setItem(CHAVE_USUARIO, String(codigo));
  } catch {
    // Armazenamento indisponível (modo privado): o jogo continua, só não lembra o caçador.
  }
}

function iniciar(): GameState {
  return { codigoUsuario: lerUsuarioSalvo(), toasts: [] };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECIONAR_USUARIO":
      return { ...state, codigoUsuario: action.codigo };
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.id) };
    default:
      return state;
  }
}

let proximoToast = 1;

/**
 * Estado global do jogo. Os pontos (essência) agora vivem no back-end; aqui
 * guardamos apenas QUEM está jogando (o código do caçador, lembrado no
 * aparelho) e as mensagens de feedback (toasts).
 */
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, iniciar);

  const selecionarUsuario = useCallback((codigo: number | null) => {
    salvarUsuario(codigo);
    dispatch({ type: "SELECIONAR_USUARIO", codigo });
  }, []);

  const mostrarToast = useCallback((message: string) => {
    dispatch({ type: "ADD_TOAST", toast: { id: proximoToast++, message } });
  }, []);

  const dismissToast = useCallback((id: number) => {
    dispatch({ type: "DISMISS_TOAST", id });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      codigoUsuario: state.codigoUsuario,
      selecionarUsuario,
      toasts: state.toasts,
      mostrarToast,
      dismissToast,
    }),
    [state, selecionarUsuario, mostrarToast, dismissToast],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
