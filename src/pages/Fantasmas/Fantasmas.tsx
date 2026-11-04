import { Ghost as GhostIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import AvisoBanner from "../../components/AvisoBanner/AvisoBanner";
import Button from "../../components/Button/Button";
import EstadoView from "../../components/EstadoView/EstadoView";
import FantasmaForm from "../../components/FantasmaForm/FantasmaForm";
import GhostField from "../../components/Ghost/GhostField";
import PageIntro from "../../components/PageIntro/PageIntro";
import { nuncaVazio, useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { caminhoDe, ROTAS } from "../../routes/paths";
import { ApiError } from "../../services/api";
import { fantasmaService } from "../../services/fantasmaService";
import { usuarioService } from "../../services/usuarioService";
import type { AvisoRota, Fantasma, Usuario } from "../../types";

interface DadosFantasmas {
  fantasmas: Fantasma[];
  usuarios: Usuario[];
}

type Painel = { modo: "fechado" } | { modo: "novo" } | { modo: "editar"; fantasma: Fantasma };

const corRaridade: Record<string, string> = {
  Comum: "border-white/20 bg-white/5 text-white/80",
  Raro: "border-soul-cyan/50 bg-soul-cyan/10 text-soul-cyan",
  Épico: "border-soul-violet/60 bg-soul-violet/10 text-soul-violet-soft",
  Lendário: "border-soul-gold/60 bg-soul-gold/10 text-soul-gold",
};

export default function Fantasmas() {
  useDocumentTitle("Fantasmas");

  // Duas leituras em sequência: fantasmas e, depois, os donos (nome de cada caçador).
  const buscar = useCallback(async (signal: AbortSignal): Promise<DadosFantasmas> => {
    const fantasmas = await fantasmaService.listar(signal);
    const usuarios = await usuarioService.listar(signal);
    return { fantasmas, usuarios };
  }, []);
  const { estado, recarregar } = useApi(buscar, nuncaVazio);

  const [painel, setPainel] = useState<Painel>({ modo: "fechado" });
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [feedback, setFeedback] = useState<AvisoRota | null>(null);

  function aoSalvar(modo: "criado" | "editado") {
    setPainel({ modo: "fechado" });
    setFeedback({
      tipo: "sucesso",
      texto: modo === "criado" ? "Fantasma capturado com sucesso!" : "Fantasma atualizado!",
    });
    recarregar();
  }

  async function excluir(fantasma: Fantasma) {
    setExcluindo(true);
    try {
      await fantasmaService.excluir(fantasma.codigo);
      setFeedback({ tipo: "sucesso", texto: `${fantasma.nome} foi libertado.` });
      recarregar();
    } catch (erro) {
      setFeedback({
        tipo: "erro",
        texto: erro instanceof ApiError ? erro.message : "Não foi possível excluir o fantasma.",
      });
    } finally {
      setExcluindo(false);
      setConfirmando(null);
    }
  }

  return (
    <section className="relative overflow-hidden py-10 md:py-12">
      <GhostField
        ghosts={[
          { top: "5%", right: "5%", size: 55, color: "#d946ef", opacity: 0.25, variant: 3 },
          { bottom: "8%", left: "4%", size: 60, color: "#22d3ee", opacity: 0.25, variant: 1 },
        ]}
      />
      <div className="relative mx-auto w-[92%] max-w-7xl">
        <PageIntro
          icon={GhostIcon}
          selo="Solução · Coleção de almas"
          titulo="Fantasmas"
          endpoints={[
            "GET /fantasmas",
            "POST /fantasmas",
            "PUT /fantasmas/{codigo}",
            "DELETE /fantasmas/{codigo}",
          ]}
        >
          <p>
            Esta página existe para <strong>reaproveitar o back-end em Java</strong>: ela mostra a
            coleção de almas guardada no banco e usa os mesmos métodos da API para capturar
            (POST), editar (PUT) e libertar (DELETE) fantasmas.
          </p>
          <p>
            Cada fantasma pertence a um caçador, e a API não deixa excluir um caçador que ainda
            tenha fantasmas, regra de negócio que você vê funcionando aqui.
          </p>
        </PageIntro>

        {feedback && <AvisoBanner aviso={feedback} onFechar={() => setFeedback(null)} />}

        <EstadoView
          estado={estado}
          onTentarNovamente={recarregar}
          textoCarregando="Procurando almas pela cidade..."
        >
          {({ fantasmas, usuarios }) => {
            const donoDe = (codigo: number) =>
              usuarios.find((u) => u.codigo === codigo)?.nome ?? `Caçador #${codigo}`;

            return (
              <div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-white/60" aria-live="polite">
                    {fantasmas.length} fantasma(s) na coleção
                  </span>
                  {usuarios.length > 0 && (
                    <Button onClick={() => setPainel({ modo: "novo" })} className="px-4 py-2 text-sm">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Capturar fantasma
                    </Button>
                  )}
                </div>

                {usuarios.length === 0 && (
                  <AvisoBanner
                    aviso={{
                      tipo: "info",
                      texto:
                        "Para capturar um fantasma é preciso ter ao menos um caçador cadastrado, porque todo fantasma tem dono.",
                    }}
                  />
                )}

                {painel.modo !== "fechado" && (
                  <div className="glass-card mb-6 p-5 md:p-6">
                    <h3 className="mb-4 text-lg font-bold text-white">
                      {painel.modo === "novo"
                        ? "Capturar novo fantasma"
                        : `Editar ${painel.fantasma.nome}`}
                    </h3>
                    <FantasmaForm
                      key={painel.modo === "editar" ? painel.fantasma.codigo : "novo"}
                      usuarios={usuarios}
                      fantasma={painel.modo === "editar" ? painel.fantasma : undefined}
                      onSalvo={aoSalvar}
                      onCancelar={() => setPainel({ modo: "fechado" })}
                    />
                  </div>
                )}

                {fantasmas.length === 0 ? (
                  <div className="glass-card mx-auto max-w-xl p-8 text-center">
                    <GhostIcon className="mx-auto mb-3 h-9 w-9 text-soul-violet-soft" aria-hidden="true" />
                    <p className="font-semibold text-white">Nenhum fantasma capturado ainda.</p>
                    <p className="mt-1 text-sm text-white/70">
                      {usuarios.length > 0 ? (
                        "Use o botão acima para registrar a primeira alma."
                      ) : (
                        <>
                          Comece cadastrando um caçador na página{" "}
                          <Link to={ROTAS.cacadores} className="text-soul-cyan underline">
                            Caçadores
                          </Link>
                          .
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {fantasmas.map((fantasma) => (
                      <li key={fantasma.codigo} className="glass-card flex flex-col gap-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-white">{fantasma.nome}</h3>
                            <p className="truncate text-sm text-white/60">{fantasma.tipo}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                              corRaridade[fantasma.raridade] ?? corRaridade.Comum
                            }`}
                          >
                            {fantasma.raridade}
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                          <span className="text-white/70">
                            Dono:{" "}
                            <Link
                              to={caminhoDe.cacador(fantasma.codUsuario)}
                              className="font-semibold text-soul-cyan hover:underline"
                            >
                              {donoDe(fantasma.codUsuario)}
                            </Link>
                          </span>
                          <span className="font-bold text-soul-gold">+{fantasma.valorEssencia}</span>
                        </div>

                        {confirmando === fantasma.codigo ? (
                          <div
                            role="alertdialog"
                            aria-label={`Confirmar exclusão de ${fantasma.nome}`}
                            className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-3"
                          >
                            <p className="mb-3 text-sm text-rose-100">
                              Libertar <strong>{fantasma.nome}</strong> para sempre?
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                className="flex-1 px-3 py-2 text-sm"
                                onClick={() => setConfirmando(null)}
                                disabled={excluindo}
                              >
                                Cancelar
                              </Button>
                              <Button
                                className="flex-1 bg-none! bg-rose-400 px-3 py-2 text-sm text-soul-950!"
                                onClick={() => excluir(fantasma)}
                                disabled={excluindo}
                              >
                                {excluindo ? "Excluindo..." : "Excluir"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPainel({ modo: "editar", fantasma })}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmando(fantasma.codigo)}
                              aria-label={`Excluir ${fantasma.nome}`}
                              className="inline-flex items-center justify-center rounded-lg bg-rose-500/15 px-3 py-2 text-rose-300 transition-colors hover:bg-rose-500/25"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }}
        </EstadoView>
      </div>
    </section>
  );
}
