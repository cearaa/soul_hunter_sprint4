import { Ghost as GhostIcon } from "lucide-react";
import { useState } from "react";

interface CardFantasmaProps {
  imagem: string;
  alt: string;
  nome: string;
}

export default function CardFantasma({ imagem, alt, nome }: CardFantasmaProps) {
  const [falhou, setFalhou] = useState(false);

  return (
    <figure className="glass-card flex w-full max-w-3xl flex-col items-center gap-3 overflow-hidden p-4 sm:p-5">
      {falhou ? (
        <div
          role="img"
          aria-label={alt}
          className="flex h-48 w-full items-center justify-center rounded-xl bg-white/5 text-soul-violet-soft sm:h-64"
        >
          <GhostIcon className="h-16 w-16" aria-hidden="true" />
        </div>
      ) : (
        <img
          src={imagem}
          alt={alt}
          loading="lazy"
          onError={() => setFalhou(true)}
          className="h-auto w-full rounded-xl object-contain"
        />
      )}
      <figcaption className="text-lg font-semibold text-white md:text-xl">{nome}</figcaption>
    </figure>
  );
}
