import { Users } from "lucide-react";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AvisoBanner from "../../components/AvisoBanner/AvisoBanner";
import GhostField from "../../components/Ghost/GhostField";
import { integrantes } from "../../data/integrantes";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { lerAviso } from "../../utils/aviso";
import CardIntegrante from "../../components/Card/CardIntegrante";

const ghostColors = ["#22d3ee", "#8b5cf6", "#d946ef", "#fbbf24", "#2dd4bf"];

export default function Integrantes() {
  useDocumentTitle("Integrantes");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const aviso = lerAviso(location.state);

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <section className="relative overflow-hidden py-12">
      <GhostField
        ghosts={[
          {
            top: "5%",
            left: "4%",
            size: 55,
            color: "#8b5cf6",
            opacity: 0.3,
            variant: 2,
          },
          {
            bottom: "8%",
            right: "5%",
            size: 65,
            color: "#22d3ee",
            opacity: 0.3,
            variant: 1,
          },
        ]}
      />
      <div className="relative mx-auto w-[90%] max-w-6xl text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-soul-violet/40 bg-soul-violet/10 px-4 py-1 text-sm font-semibold text-soul-violet-soft">
          <Users className="h-4 w-4" aria-hidden="true" />A equipe por trás da
          caçada
        </span>
        <h2 className="mb-3 text-3xl font-bold text-white sm:text-5xl">
          Integrantes
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-white/70">
          Clique em <strong>"Ver mais sobre esse BBzão"</strong> para conhecer o
          papel de cada caçador(a) no desenvolvimento do SoulHunter.
        </p>

        {aviso && (
          <AvisoBanner
            aviso={aviso}
            onFechar={() =>
              navigate(location.pathname, { replace: true, state: null })
            }
          />
        )}

        <div
          className="overflow-hidden py-8"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          }}
        >
          <div
            className="marquee-track"
            style={{
              animationDuration: `${integrantes.length * 14}s`,
              animationPlayState: expandedId ? "paused" : undefined,
            }}
          >
            {[0, 1].map((copia) =>
              integrantes.map((integrante, index) => (
                <div
                  key={`${copia}-${integrante.id}`}
                  aria-hidden={copia === 1}
                  className="shrink-0 w-[280px] sm:w-[320px] flex pr-6"
                >
                  <CardIntegrante
                    integrante={integrante}
                    index={index}
                    isExpanded={expandedId === integrante.id}
                    ghostColor={ghostColors[index % ghostColors.length]}
                    onToggle={toggleExpanded}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}