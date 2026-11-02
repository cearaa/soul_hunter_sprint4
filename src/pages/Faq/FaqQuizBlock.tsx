import { PartyPopper, Sparkles } from "lucide-react";
import { useState } from "react";
import type { FaqQuiz } from "../../data/faq";

interface FaqQuizBlockProps {
  quiz: FaqQuiz;
}

export default function FaqQuizBlock({ quiz }: FaqQuizBlockProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const respondeu = selected !== null;
  const acertou = selected === quiz.respostaCorretaIndex;

  return (
    <div className="mt-3 rounded-xl border border-soul-magenta/30 bg-soul-magenta/5 p-4">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-soul-magenta">
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
        Quer revisar? Teste seu conhecimento!
      </p>
      <p className="mb-3 text-sm text-white/85">{quiz.pergunta}</p>
      <div className="flex flex-col gap-2">
        {quiz.opcoes.map((opcao, index) => {
          const isSelected = selected === index;
          const showCorrect = respondeu && index === quiz.respostaCorretaIndex;
          return (
            <button
              key={opcao}
              onClick={() => setSelected(index)}
              disabled={respondeu}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-200 disabled:cursor-not-allowed ${
                showCorrect
                  ? "border-green-400/60 bg-green-400/10 text-green-300"
                  : isSelected
                    ? "border-soul-magenta/60 bg-soul-magenta/10 text-white"
                    : "border-white/15 text-white/80 hover:border-soul-magenta/40 hover:bg-white/5"
              }`}
            >
              {opcao}
            </button>
          );
        })}
      </div>

      {respondeu && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-soul-gold" role="status">
          <PartyPopper className="h-4 w-4 shrink-0" aria-hidden="true" />
          {acertou
            ? "Certíssimo! Você manja mesmo de SoulHunter."
            : "Quase! A resposta certa está destacada em verde."}
        </p>
      )}
    </div>
  );
}
