import { useId } from "react";
import type { Carta } from "../../services/cardGameService";
import { raridades } from "../../utils/cartas";

export function Espectro({ variante = 0 }: { variante?: number }) {
  const id = useId();

  return (
    <svg className="block w-full [filter:drop-shadow(0_0_10px_color-mix(in_srgb,currentColor_34%,transparent))]" viewBox="0 0 180 144" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="90" y1="16" x2="90" y2="128" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" stopOpacity=".87" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".08" />
        </linearGradient>
      </defs>

      <circle cx="90" cy="70" r="60" stroke="currentColor" opacity=".22" strokeDasharray="2 5" />
      <circle cx="90" cy="70" r="49" stroke="currentColor" opacity=".3" />
      <path d="M7 70h16m134 0h16M90 2v15m0 109v15" stroke="currentColor" opacity=".48" />
      <path
        d="m16 43 3 3-3 3-3-3 3-3Zm137 54 4 4-4 4-4-4 4-4Zm-7-73 2 3-2 3-2-3 2-3Z"
        fill="currentColor"
      />

      {variante % 3 === 2 ? (
        <>
          <path d="M90 22 126 59l-36 64-36-64 36-37Z" fill={`url(#${id})`} stroke="currentColor" />
          <path d="m90 22 10 39-10 62-10-62 10-39ZM54 59l36 16 36-16M90 5v9m0 112v9" stroke="currentColor" />
          <path d="m90 52 10 12-10 12-10-12 10-12Z" fill="#eefaff" />
        </>
      ) : (
        <>
          <path
            d={variante % 3 === 0
              ? "M47 99V69a43 43 0 0 1 86 0v30l-15-10-14 18-14-12-14 12-14-18-15 10Z"
              : "m45 103 7-50 20-22 18 7 18-7 20 22 7 50-17-9-14 16-14-9-14 9-14-16-17 9Z"}
            fill={`url(#${id})`}
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M62 76V64l13-8 15 4 15-4 13 8v12l-14 11H76L62 76Z" fill="#0a1022" fillOpacity=".9" />
          <path d="m71 68 14 3-5 7-8-3-1-7Zm38 0-14 3 5 7 8-3 1-7Z" fill="currentColor" />
          <path d="M76 49h28M84 97h12" stroke="currentColor" opacity=".6" />
        </>
      )}
    </svg>
  );
}

export function FaceCarta({ carta }: { carta: Carta }) {
  const fantasma = carta.tipo === "fantasma";

  return (
    <>
      {/* in-[label]: na escolha da arena, deixa espaço para o radio no canto */}
      <span className="flex flex-wrap justify-between gap-x-[5px] gap-y-[3px] font-mono text-[.59rem] leading-[1.3] font-bold uppercase in-[label]:pr-6">
        <span>{fantasma ? raridades[carta.raridade] : "Mística"}</span>
        <span>{carta.id}</span>
      </span>

      <span className="my-[5px] grid min-h-[88px] place-items-center rounded-md bg-[#080e1d70] [&>svg]:w-[min(100%,116px)]">
        <Espectro variante={fantasma ? Number(carta.id.slice(3)) : 2} />
      </span>

      <strong className="mb-[7px] text-[.88rem] text-[#f2f6ff] wrap-anywhere">{carta.nome}</strong>

      {fantasma ? (
        <span className="mt-auto flex flex-wrap gap-x-2.5 gap-y-[5px] font-mono text-[.65rem] leading-[1.4]">
          <span>ATQ <b className="text-[#edf4ff]">{carta.ataque}</b></span>
          <span>DEF <b className="text-[#edf4ff]">{carta.defesa}</b></span>
        </span>
      ) : (
        <span className="text-[.78rem] leading-[1.35] text-cg-suave">{carta.habilidade}</span>
      )}

      {carta.uso === "promocional" ? <small className="mt-1.5 text-[.7rem]">Promocional</small> : null}
      {carta.uso === "chefe" ? <small className="mt-1.5 text-[.7rem]">Chefe final</small> : null}
    </>
  );
}