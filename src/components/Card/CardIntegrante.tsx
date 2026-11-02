import { ChevronDown, ChevronUp, Ghost as GhostIcon } from "lucide-react";
import { Link } from "react-router-dom";
import githubIcon from "../../assets/img/icones/github.png";
import linkedinIcon from "../../assets/img/icones/linkedin.png";
import Ghost from "../Ghost/Ghost";

export interface IntegranteType {
  id: string;
  nome: string;
  rm: string;
  turma: string;
  foto: string;
  fotoPosition?: string;
  github: string;
  linkedin: string;
  bio: string;
  fantasmaFavorito: string;
}

interface CardIntegranteProps {
  integrante: IntegranteType;
  index: number;
  isExpanded: boolean;
  ghostColor: string;
  onToggle: (id: string) => void;
}

export default function CardIntegrante({ integrante, index, isExpanded, ghostColor, onToggle }: CardIntegranteProps) {
  return (
    <div
      
      className="glass-card group relative overflow-hidden text-left transition-transform duration-300 hover:-translate-y-1 w-full h-full"
      style={{ boxShadow: isExpanded ? `0 0 26px ${ghostColor}33` : undefined }}
    >
    
      <div className="absolute right-3 top-3 z-10 opacity-70">
        <Ghost color={ghostColor} size={34} variant={((index % 3) + 1) as 1 | 2 | 3} />
      </div>

      <Link to={`/integrantes/${integrante.id}`} className="block overflow-hidden">
        <img
          src={integrante.foto}
          alt={integrante.nome}
          style={{ objectPosition: integrante.fotoPosition ?? "center" }}
          className="h-[240px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="p-4">
        <h3 className="font-semibold text-white">
          <Link to={`/integrantes/${integrante.id}`} className="hover:text-soul-cyan">
            {integrante.nome}
          </Link>
        </h3>
        <p className="text-sm text-white/60">RM: {integrante.rm}</p>
        <p className="text-sm text-white/60">Turma: {integrante.turma}</p>

        <div className="mt-3 flex items-center gap-3">
          <a
            href={integrante.github}
            target="_blank"
            rel="noreferrer"
            aria-label={`GitHub de ${integrante.nome}`}
            className="opacity-80 transition-opacity hover:opacity-100"
          >
            <img src={githubIcon} alt="ícone do GitHub" className="h-8 w-8 rounded-full bg-white p-1" />
          </a>
          <a
            href={integrante.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={`LinkedIn de ${integrante.nome}`}
            className="opacity-80 transition-opacity hover:opacity-100"
          >
            <img src={linkedinIcon} alt="ícone do LinkedIn" className="h-8 w-8 rounded-full bg-white p-1" />
          </a>
        </div>

        <button
          onClick={() => onToggle(integrante.id)}
          className="mt-4 flex items-center gap-1 text-sm font-semibold transition-colors"
          style={{ color: ghostColor }}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Mostrar menos" : "Ver mais sobre esse BBzão"}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 border-t border-white/10 pt-3 text-sm text-white/75">
            <p className="mb-2">{integrante.bio}</p>
            <p className="flex items-center gap-1 text-white/60">
              <GhostIcon className="h-4 w-4 shrink-0" style={{ color: ghostColor }} aria-hidden="true" /> Alma favorita:{" "}
              <span className="font-semibold text-white/85">
                {integrante.fantasmaFavorito}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}