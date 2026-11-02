import GhostField from "../../components/Ghost/GhostField";
import { useGame } from "../../context/useGame";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import EscolherCacador from "./EscolherCacador";
import PainelCacador from "./PainelCacador";

export default function Dashboard() {
  useDocumentTitle("Dashboard");
  const { codigoUsuario } = useGame();

  return (
    <section className="relative overflow-hidden py-10">
      <GhostField
        ghosts={[
          { top: "4%", right: "4%", size: 50, color: "#8b5cf6", opacity: 0.25, variant: 2 },
          { bottom: "6%", left: "4%", size: 45, color: "#22d3ee", opacity: 0.25, variant: 1 },
        ]}
      />
      <div className="relative mx-auto w-[92%] max-w-7xl">
        {codigoUsuario === null ? (
          <EscolherCacador />
        ) : (
          <PainelCacador key={codigoUsuario} codigo={codigoUsuario} />
        )}
      </div>
    </section>
  );
}
