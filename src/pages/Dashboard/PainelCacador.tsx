import { Ghost as GhostIcon, LogOut, Target, Trophy } from "lucide-react";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button";
import EstadoView from "../../components/EstadoView/EstadoView";
import { useGame } from "../../context/useGame";
import { nuncaVazio, useApi } from "../../hooks/useApi";
import { ROTAS } from "../../routes/paths";
import { usuarioService } from "../../services/usuarioService";
import type { Fantasma, Usuario, UsuarioComRanking } from "../../types";
import { montarRanking } from "../../utils/ranking";
import { progressoTitulo } from "../../utils/titulos";
import DiarioSustentavel from "./DiarioSustentavel";
import PerguntaDoDia from "./PerguntaDoDia";
import { RegistroReciclagem, RegistroTransporte } from "./RegistroAcoes";

interface DadosPainel {
  usuario: Usuario;
  ranking: UsuarioComRanking[];
  fantasmas: Fantasma[];
}

export default function PainelCacador({ codigo }: { codigo: number }) {
  const { selecionarUsuario, mostrarToast } = useGame();

  // Três leituras em sequência (o back-end Java usa uma única conexão com o banco).
  const buscar = useCallback(
    async (signal: AbortSignal): Promise<DadosPainel> => {
      const usuario = await usuarioService.buscar(codigo, signal);
      const todos = await usuarioService.listar(signal);
      const fantasmas = await usuarioService.listarFantasmas(codigo, signal);
      return { usuario, ranking: montarRanking(todos), fantasmas };
    },
    [codigo],
  );
  const { estado, recarregar } = useApi(buscar, nuncaVazio);

  function aoRegistrar(antes: Usuario, depois: Usuario) {
    const ganho = depois.essencia - antes.essencia;
    const novoTitulo = depois.titulo !== antes.titulo ? ` Novo título: ${depois.titulo}!` : "";
    mostrarToast(`+${ganho} de essência!${novoTitulo}`);
    recarregar();
  }

  if (estado.status === "erro" && estado.tipo === "nao-encontrado") {
    return (
      <div role="alert" className="glass-card mx-auto max-w-xl p-8 text-center">
        <GhostIcon className="mx-auto mb-3 h-10 w-10 text-soul-violet-soft" aria-hidden="true" />
        <h2 className="mb-2 text-2xl font-bold text-white">Esse caçador não existe mais</h2>
        <p className="mb-5 text-white/70">
          O caçador #{codigo} foi excluído do banco. Escolha outro para continuar.
        </p>
        <Button onClick={() => selecionarUsuario(null)}>Escolher outro caçador</Button>
      </div>
    );
  }

  return (
    <EstadoView
      estado={estado}
      onTentarNovamente={recarregar}
      textoCarregando="Carregando seu painel de caçador..."
    >
      {({ usuario, ranking, fantasmas }) => {
        const progresso = progressoTitulo(usuario.essencia);
        const minha = ranking.find((r) => r.codigo === usuario.codigo);

        return (
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
              <div>
                <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-soul-cyan/40 bg-soul-cyan/10 px-4 py-1 text-sm font-semibold text-soul-cyan">
                  <Target className="h-4 w-4" aria-hidden="true" />
                  Central de missões
                </span>
                <h2 className="break-words text-3xl font-bold text-white sm:text-4xl">
                  Olá, <span className="text-soul-cyan neon-text">{usuario.nome}</span>!
                </h2>
                <p className="mt-1 text-white/70">
                  Cada atitude sustentável vira essência, guardada no banco de dados.
                </p>
              </div>
              <Button variant="ghost" onClick={() => selecionarUsuario(null)} className="px-4 py-2 text-sm">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Trocar de caçador
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="glass-card p-5 text-center">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-white/60">Essência</h3>
                <p className="text-3xl font-bold text-soul-cyan neon-text">{usuario.essencia}</p>
              </div>
              <div className="glass-card p-5 text-center">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-white/60">Título</h3>
                <p className="text-xl font-bold text-soul-gold neon-text sm:text-2xl">{usuario.titulo}</p>
              </div>
              <div className="glass-card p-5 text-center">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-white/60">
                  Posição no ranking
                </h3>
                <p className="text-3xl font-bold text-soul-violet-soft neon-text">
                  #{minha?.posicao ?? "—"}
                  <span className="text-base font-medium text-white/50"> de {ranking.length}</span>
                </p>
              </div>
            </div>

            <div className="glass-card p-5 sm:p-6">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <h3 className="font-semibold text-white">
                  {progresso.proximo
                    ? `Faltam ${progresso.faltam} de essência para ${progresso.proximo}`
                    : "Você é um Caçador Lendário!"}
                </h3>
                <span className="text-white/60">{progresso.percentual}%</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-soul-cyan via-soul-teal to-soul-violet transition-all duration-1000 ease-out"
                  style={{ width: `${progresso.percentual}%` }}
                  role="progressbar"
                  aria-label="Progresso para o próximo título"
                  aria-valuenow={progresso.percentual}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RegistroReciclagem
                codigo={usuario.codigo}
                onRegistrado={(depois) => aoRegistrar(usuario, depois)}
              />
              <RegistroTransporte
                codigo={usuario.codigo}
                onRegistrado={(depois) => aoRegistrar(usuario, depois)}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="glass-card p-5 sm:p-6">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                  <GhostIcon className="h-5 w-5 text-soul-violet-soft" aria-hidden="true" />
                  Suas almas ({fantasmas.length})
                </h3>
                {fantasmas.length === 0 ? (
                  <p className="text-sm text-white/70">
                    Você ainda não capturou nenhuma alma. Registre uma na página{" "}
                    <Link to={ROTAS.fantasmas} className="text-soul-cyan underline">
                      Fantasmas
                    </Link>
                    .
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {fantasmas.map((f) => (
                      <li
                        key={f.codigo}
                        className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 truncate text-white">{f.nome}</span>
                        <span className="shrink-0 text-xs text-white/50">{f.raridade}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to={ROTAS.ranking}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-soul-gold hover:underline"
                >
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                  Ver ranking completo
                </Link>
              </div>
              <PerguntaDoDia />
            </div>

            <DiarioSustentavel codigo={usuario.codigo} />
          </div>
        );
      }}
    </EstadoView>
  );
}
