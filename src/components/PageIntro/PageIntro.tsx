import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageIntroProps {
  icon: LucideIcon;
  selo: string;
  titulo: string;
  children: ReactNode;
  /** Endpoints da API Java reaproveitados pela página (ex.: "GET /usuarios"). */
  endpoints: string[];
}

/** Topo das páginas da solução: explica o que a página faz e quais endpoints do back-end ela usa. */
export default function PageIntro({ icon: Icon, selo, titulo, children, endpoints }: PageIntroProps) {
  return (
    <header className="mb-8">
      <div className="text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-soul-cyan/40 bg-soul-cyan/10 px-4 py-1 text-sm font-semibold text-soul-cyan">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {selo}
        </span>
        <h2 className="text-3xl font-bold text-white sm:text-4xl xl:text-5xl">{titulo}</h2>
      </div>

      <div className="glass-card mx-auto mt-6 flex max-w-4xl flex-col gap-4 p-5 text-left md:flex-row md:items-start md:gap-6 md:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-soul-cyan to-soul-violet text-soul-950">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="space-y-2 text-sm text-white/80 sm:text-base">{children}</div>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Endpoints da API usados nesta página">
            {endpoints.map((endpoint) => (
              <li
                key={endpoint}
                className="rounded-lg border border-white/10 bg-soul-900/70 px-2.5 py-1 font-mono text-xs text-soul-cyan-soft"
              >
                {endpoint}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
