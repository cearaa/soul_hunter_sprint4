import { Lightbulb } from "lucide-react";
import { useState } from "react";
import Button from "../../components/Button/Button";

type Resultado = "pendente" | "acertou" | "errou";

/** Pista diária local (sem API): ajuda o caçador a descobrir onde buscar uma alma. */
export default function PerguntaDoDia() {
  const [resposta, setResposta] = useState("");
  const [resultado, setResultado] = useState<Resultado>("pendente");

  function investigar() {
    const texto = resposta
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    if (texto === "") return;
    setResultado(texto === "se" || texto.includes("estacao se") || texto === "praca da se" ? "acertou" : "errou");
  }

  return (
    <div className="glass-card p-5 sm:p-6">
      <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
        <Lightbulb className="h-5 w-5 text-soul-gold" aria-hidden="true" />
        Pista do dia
      </h3>
      {resultado === "acertou" ? (
        <p className="text-sm font-semibold text-soul-teal">
          Acertou! É a estação Sé. Vá até lá para resgatar a alma da pista. Volte amanhã para uma
          nova dica.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-white/80">
            Dica do Caçador: esta estação fica no marco zero da cidade de São Paulo, de frente para
            uma grande catedral. Qual é a estação?
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="pista-resposta" className="sr-only">
              Sua resposta
            </label>
            <input
              id="pista-resposta"
              type="text"
              value={resposta}
              onChange={(e) => {
                setResposta(e.target.value);
                setResultado("pendente");
              }}
              onKeyDown={(e) => e.key === "Enter" && investigar()}
              placeholder="Digite aqui sua resposta"
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-soul-900/60 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-soul-cyan focus:outline-none focus:ring-2 focus:ring-soul-cyan/30"
            />
            <Button onClick={investigar} className="px-5 py-2.5 text-sm">
              Investigar
            </Button>
          </div>
          {resultado === "errou" && (
            <p role="status" className="text-sm text-rose-300">
              Alma não encontrada por aqui. Tente outra estação!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
