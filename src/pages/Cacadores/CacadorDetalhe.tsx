import { ArrowLeft, Ghost as GhostIcon, Trophy, UserCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button/Button";
import EstadoView from "../../components/EstadoView/EstadoView";
import GhostField from "../../components/Ghost/GhostField";
import { useGame } from "../../context/useGame";
import { nuncaVazio, useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ROTAS } from "../../routes/paths";
import { usuarioService } from "../../services/usuarioService";
import type { AvisoRota, UsuarioComFantasmas } from "../../types";
import { progressoTitulo } from "../../utils/titulos";

const SEGUNDOS_REDIRECIONAMENTO = 5;

/** Rota dinâmica /cacadores/:id — valida o parâmetro e delega o resto. */
export default function CacadorDetalhe() {
  const { id } = useParams<{ id: string }>();

  if (id === undefined || !/^[1-9]\d*$/.test(id)) {
    const aviso: AvisoRota = {
      tipo: "erro",
      texto: `"${id ?? ""}" não é um código válido de caçador. Escolha um da lista abaixo.`,
    };
    return <Navigate to={ROTAS.cacadores} replace state={{ aviso }} />;
  }

  return <CacadorDetalheConteudo key={id} codigo={Number(id)} />;
}

function NaoEncontrado({ codigo }: { codigo: number }) {
  const navigate = useNavigate();
  const [segundos, setSegundos] = useState(SEGUNDOS_REDIRECIONAMENTO);

  useEffect(() => {
    const timer = setInterval(() => setSegundos((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (segundos <= 0) {
      const aviso: AvisoRota = {
        tipo: "info",
        texto: `O caçador #${codigo} não existe (ou já foi excluído). Veja quem está na lista.`,
      };
      navigate(ROTAS.cacadores, { replace: true, state: { aviso } });
    }
  }, [segundos, codigo, navigate]);

  return (
    <div role="alert" className="glass-card mx-auto max-w-xl p-8 text-center">
      <GhostIcon className="mx-auto mb-3 h-10 w-10 text-soul-violet-soft" aria-hidden="true" />
      <h2 className="mb-2 text-2xl font-bold text-white">Caçador não encontrado</h2>
      <p className="mb-5 text-white/70">
        Nenhum caçador com o código <strong>#{codigo}</strong>. Esse fantasma sumiu! Você será
        levado de volta à lista em <strong>{Math.max(segundos, 0)}s</strong>.
      </p>
      <Link
        to={ROTAS.cacadores}
        className="font-semibold text-soul-cyan underline-offset-4 hover:underline"
      >
        Voltar agora para Caçadores
      </Link>
    </div>
  );
}

function CacadorDetalheConteudo({ codigo }: { codigo: number }) {
  const { codigoUsuario, selecionarUsuario, mostrarToast } = useGame();

  // Chamadas em sequência (o back-end Java usa uma única conexão com o banco).
  const buscar = useCallback(
    async (signal: AbortSignal): Promise<UsuarioComFantasmas> => {
      const usuario = await usuarioService.buscar(codigo, signal);
      const fantasmas = await usuarioService.listarFantasmas(codigo, signal);
      return { ...usuario, fantasmas };
    },
    [codigo],
  );
  const { estado, recarregar } = useApi(buscar, nuncaVazio);

  useDocumentTitle(estado.status === "ok" ? estado.dados.nome : `Caçador #${codigo}`);

  return (
    <section className="relative overflow-hidden py-10 md:py-12">
      <GhostField
        ghosts={[
          { top: "8%", left: "6%", size: 55, color: "#8b5cf6", opacity: 0.3, variant: 1 },
          { bottom: "10%", right: "8%", size: 60, color: "#22d3ee", opacity: 0.3, variant: 2 },
        ]}
      />
      <div className="relative mx-auto w-[92%] max-w-4xl">
        <Link
          to={ROTAS.cacadores}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-soul-cyan hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Todos os caçadores
        </Link>

        {estado.status === "erro" && estado.tipo === "nao-encontrado" ? (
          <NaoEncontrado codigo={codigo} />
        ) : (
          <EstadoView
            estado={estado}
            onTentarNovamente={recarregar}
            textoCarregando="Abrindo o perfil do caçador..."
          >
            {(usuario) => {
              const progresso = progressoTitulo(usuario.essencia);
              const souEu = usuario.codigo === codigoUsuario;
              return (
                <article className="glass-card p-5 sm:p-8">
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                    <div
                      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-soul-violet to-soul-cyan text-4xl font-bold text-soul-950 shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                      aria-hidden="true"
                    >
                      {usuario.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white/50">Caçador #{usuario.codigo}</p>
                      <h2 className="break-words text-2xl font-bold text-white neon-text sm:text-4xl">
                        {usuario.nome}
                      </h2>
                      <p className="break-all text-white/70">{usuario.email}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/5 p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Título</p>
                      <p className="mt-1 text-lg font-bold text-soul-gold">{usuario.titulo}</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Essência</p>
                      <p className="mt-1 text-3xl font-bold text-soul-cyan neon-text">{usuario.essencia}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-white/70">
                        {progresso.proximo
                          ? `Faltam ${progresso.faltam} para ${progresso.proximo}`
                          : "Título máximo alcançado!"}
                      </span>
                      <span className="text-white/50">{progresso.percentual}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-soul-cyan via-soul-teal to-soul-violet transition-all duration-700"
                        style={{ width: `${progresso.percentual}%` }}
                        role="progressbar"
                        aria-label="Progresso para o próximo título"
                        aria-valuenow={progresso.percentual}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>

                  <h3 className="mb-3 mt-8 flex items-center gap-2 text-lg font-bold text-white">
                    <GhostIcon className="h-5 w-5 text-soul-violet-soft" aria-hidden="true" />
                    Fantasmas capturados ({usuario.fantasmas.length})
                  </h3>
                  {usuario.fantasmas.length === 0 ? (
                    <p className="rounded-xl bg-white/5 p-4 text-sm text-white/70">
                      Ainda nenhuma alma capturada. Registre uma na página{" "}
                      <Link to={ROTAS.fantasmas} className="text-soul-cyan underline">
                        Fantasmas
                      </Link>
                      .
                    </p>
                  ) : (
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {usuario.fantasmas.map((fantasma) => (
                        <li
                          key={fantasma.codigo}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{fantasma.nome}</p>
                            <p className="truncate text-xs text-white/50">
                              {fantasma.tipo} · {fantasma.raridade}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-bold text-soul-cyan">
                            +{fantasma.valorEssencia}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button
                      onClick={() => {
                        selecionarUsuario(usuario.codigo);
                        mostrarToast(`Agora você joga como ${usuario.nome}!`);
                      }}
                      disabled={souEu}
                    >
                      <UserCheck className="h-4 w-4" aria-hidden="true" />
                      {souEu ? "Você joga como este caçador" : "Jogar como este caçador"}
                    </Button>
                    <Link
                      to={ROTAS.ranking}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-soul-gold/50 px-6 py-3 font-semibold text-soul-gold transition-colors hover:bg-soul-gold/10"
                    >
                      <Trophy className="h-4 w-4" aria-hidden="true" />
                      Ver no ranking
                    </Link>
                  </div>
                </article>
              );
            }}
          </EstadoView>
        )}
      </div>
    </section>
  );
}
