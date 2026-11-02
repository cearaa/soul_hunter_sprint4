import { Inbox, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { Estado } from "../../types";
import Button from "../Button/Button";

interface EstadoViewProps<T> {
  estado: Estado<T>;
  /** Renderiza o conteúdo quando os dados chegam. */
  children: (dados: T) => ReactNode;
  onTentarNovamente?: () => void;
  /** Conteúdo exibido quando a API responde com lista vazia. */
  vazio?: ReactNode;
  textoCarregando?: string;
}

function Carregando({ texto }: { texto: string }) {
  const [demorando, setDemorando] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDemorando(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="glass-card mx-auto flex max-w-xl flex-col items-center gap-3 p-8 text-center"
    >
      <LoaderCircle className="h-9 w-9 animate-spin text-soul-cyan" aria-hidden="true" />
      <p className="font-semibold text-white">{texto}</p>
      {demorando && (
        <p className="text-sm text-white/60">
          A API gratuita hiberna quando fica parada e pode levar até 1 minuto para acordar. Já já
          os fantasmas aparecem!
        </p>
      )}
    </div>
  );
}

export default function EstadoView<T>({
  estado,
  children,
  onTentarNovamente,
  vazio,
  textoCarregando = "Invocando dados da API...",
}: EstadoViewProps<T>) {
  switch (estado.status) {
    case "carregando":
      return <Carregando texto={textoCarregando} />;

    case "erro":
      return (
        <div
          role="alert"
          className="glass-card mx-auto flex max-w-xl flex-col items-center gap-3 border-rose-400/40 p-8 text-center"
        >
          <TriangleAlert className="h-9 w-9 text-rose-300" aria-hidden="true" />
          <p className="font-semibold text-white">Ops! Não deu para carregar.</p>
          <p className="text-sm text-white/70">{estado.mensagem}</p>
          {onTentarNovamente && (
            <Button variant="outline" onClick={onTentarNovamente}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Tentar de novo
            </Button>
          )}
        </div>
      );

    case "vazio":
      return (
        <div className="glass-card mx-auto flex max-w-xl flex-col items-center gap-3 p-8 text-center">
          <Inbox className="h-9 w-9 text-soul-violet-soft" aria-hidden="true" />
          {vazio ?? <p className="text-white/70">Nada por aqui ainda.</p>}
        </div>
      );
                    
    case "ok":
      return <>{children(estado.dados)}</>;
  }
}
