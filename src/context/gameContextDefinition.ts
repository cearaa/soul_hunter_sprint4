import { createContext } from "react";

export interface Toast {
  id: number;
  message: string;
}

export interface GameContextValue {
  /** Código (API) do caçador que está jogando neste aparelho; null se ninguém foi escolhido. */
  codigoUsuario: number | null;
  selecionarUsuario: (codigo: number | null) => void;
  toasts: Toast[];
  mostrarToast: (message: string) => void;
  dismissToast: (id: number) => void;
}

export const GameContext = createContext<GameContextValue | undefined>(undefined);
