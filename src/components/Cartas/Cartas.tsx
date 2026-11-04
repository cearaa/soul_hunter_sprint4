import { useId } from "react";
import type { Carta } from "../../services/cardGameService";
import { raridades } from "../../utils/cartas";

export function Espectro({ variante = 0 }: { variante?: number }) {
  const id = useId();

  return (
    <svg className="espectro" viewBox="0 0 180 144" fill="none" aria-hidden="true">
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
      <span className="carta-topo">
        <span>{fantasma ? raridades[carta.raridade] : "Mística"}</span>
        <span>{carta.id}</span>
      </span>

      <span className="carta-arte">
        <Espectro variante={fantasma ? Number(carta.id.slice(3)) : 2} />
      </span>

      <strong>{carta.nome}</strong>

      {fantasma ? (
        <span className="atributos">
          <span>ATQ <b>{carta.ataque}</b></span>
          <span>DEF <b>{carta.defesa}</b></span>
        </span>
      ) : (
        <span className="habilidade">{carta.habilidade}</span>
      )}

      {carta.uso === "promocional" ? <small>Promocional</small> : null}
      {carta.uso === "chefe" ? <small>Chefe final</small> : null}
    </>
  );
}