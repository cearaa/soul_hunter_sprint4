import { Crosshair, Pencil, Search, Trash2, UserCheck, UserPlus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AvisoBanner from "../../components/AvisoBanner/AvisoBanner";
import Button from "../../components/Button/Button";
import CacadorForm from "../../components/CacadorForm/CacadorForm";
import EstadoView from "../../components/EstadoView/EstadoView";
import GhostField from "../../components/Ghost/GhostField";
import PageIntro from "../../components/PageIntro/PageIntro";
import { useGame } from "../../context/useGame";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { caminhoDe, ROTAS } from "../../routes/paths";
import { ApiError } from "../../services/api";
import { usuarioService } from "../../services/usuarioService";
import type { AvisoRota, Usuario } from "../../types";
import { lerAviso } from "../../utils/aviso";

type Painel = { modo: "fechado" } | { modo: "novo" } | { modo: "editar"; usuario: Usuario };

export default function Cacadores() {
  useDocumentTitle("Caçadores");
  const location = useLocation();
  const navigate = useNavigate();
  const { codigoUsuario, selecionarUsuario, mostrarToast } = useGame();

  const buscar = useCallback((signal: AbortSignal) => usuarioService.listar(signal), []);
  const { estado, recarregar } = useApi(buscar);

  const [painel, setPainel] = useState<Painel>({ modo: "fechado" });
  const [busca, setBusca] = useState("");
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [feedback, setFeedback] = useState<AvisoRota | null>(null);

  const avisoDeRota = lerAviso(location.state);
  const aviso = feedback ?? avisoDeRota;

  function fecharAviso() {
    setFeedback(null);
    if (avisoDeRota) navigate(location.pathname, { replace: true, state: null });
  }

  function aoSalvar(modo: "criado" | "editado") {
    setPainel({ modo: "fechado" });
    setFeedback({
      tipo: "sucesso",
      texto: modo === "criado" ? "Caçador cadastrado com sucesso!" : "Caçador atualizado com sucesso!",
    });
    recarregar();
  }

  async function excluir(usuario: Usuario) {
    setExcluindo(true);
    try {
      await usuarioService.excluir(usuario.codigo);
      if (usuario.codigo === codigoUsuario) selecionarUsuario(null);
      setFeedback({ tipo: "sucesso", texto: `${usuario.nome} foi removido(a) da caçada.` });
      recarregar();
    } catch (erro) {
      setFeedback({
        tipo: "erro",
        texto: erro instanceof ApiError ? erro.message : "Não foi possível excluir o caçador.",
      });
    } finally {
      setExcluindo(false);
      setConfirmando(null);
    }
  }

  function tornarMeuCacador(usuario: Usuario) {
    selecionarUsuario(usuario.codigo);
    mostrarToast(`Agora você joga como ${usuario.nome}!`);
  }

  const filtro = busca.trim().toLowerCase();
  const filtrar = useMemo(
    () => (lista: Usuario[]) =>
      filtro === ""
        ? lista
        : lista.filter(
            (u) => u.nome.toLowerCase().includes(filtro) || u.email.toLowerCase().includes(filtro),
          ),
    [filtro],
  );

  return (
    <section className="relative overflow-hidden py-10 md:py-12">
      <GhostField
        ghosts={[
          { top: "5%", left: "4%", size: 55, color: "#22d3ee", opacity: 0.25, variant: 1 },
          { bottom: "6%", right: "5%", size: 60, color: "#8b5cf6", opacity: 0.25, variant: 2 },
        ]}
      />
      <div className="relative mx-auto w-[92%] max-w-7xl">
        <PageIntro
          icon={Crosshair}
          selo="Solução · Gestão de caçadores"
          titulo="Caçadores"
          endpoints={[
            "GET /usuarios",
            "POST /usuarios",
            "PUT /usuarios/{codigo}",
            "DELETE /usuarios/{codigo}",
          ]}
        >
          <p>
            Esta página existe para <strong>reaproveitar o back-end em Java</strong> que o grupo
            construiu na disciplina de DDD: aqui você usa, direto do navegador, os mesmos métodos
            HTTP (GET, POST, PUT e DELETE) do cadastro de usuários, gravados no banco Oracle.
          </p>
          <p>
            Cadastre caçadores, edite nome e e-mail, exclua e abra o perfil de cada um. A essência
            e o título são calculados pela API e não podem ser editados à mão.
          </p>
        </PageIntro>

        {aviso && <AvisoBanner aviso={aviso} onFechar={fecharAviso} />}

        <EstadoView
          estado={estado}
          onTentarNovamente={recarregar}
          textoCarregando="Buscando caçadores..."
          vazio={
            <>
              <p className="font-semibold text-white">Nenhum caçador cadastrado ainda.</p>
              <p className="text-sm text-white/70">Seja o primeiro a entrar na caçada!</p>
              <Button onClick={() => setPainel({ modo: "novo" })}>
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Cadastrar o primeiro caçador
              </Button>
            </>
          }
        >
          {(usuarios) => {
            const visiveis = filtrar(usuarios);
            return (
              <div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:max-w-sm">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                      aria-hidden="true"
                    />
                    <label htmlFor="busca-cacador" className="sr-only">
                      Buscar caçador por nome ou e-mail
                    </label>
                    <input
                      id="busca-cacador"
                      type="search"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar por nome ou e-mail"
                      className="w-full rounded-xl border border-white/15 bg-soul-900/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-soul-cyan focus:outline-none focus:ring-2 focus:ring-soul-cyan/30"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="text-sm text-white/60" aria-live="polite">
                      {visiveis.length} de {usuarios.length} caçador(es)
                    </span>
                    <Button
                      onClick={() => setPainel({ modo: "novo" })}
                      className="px-4 py-2 text-sm"
                    >
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      Novo caçador
                    </Button>
                  </div>
                </div>

                {painel.modo !== "fechado" && (
                  <div className="glass-card mb-6 p-5 md:p-6">
                    <h3 className="mb-4 text-lg font-bold text-white">
                      {painel.modo === "novo" ? "Cadastrar caçador" : `Editar ${painel.usuario.nome}`}
                    </h3>
                    <CacadorForm
                      key={painel.modo === "editar" ? painel.usuario.codigo : "novo"}
                      usuario={painel.modo === "editar" ? painel.usuario : undefined}
                      onSalvo={(_, modo) => aoSalvar(modo)}
                      onCancelar={() => setPainel({ modo: "fechado" })}
                    />
                  </div>
                )}

                {visiveis.length === 0 ? (
                  <p className="glass-card p-6 text-center text-white/70">
                    Nenhum caçador encontrado para &ldquo;{busca}&rdquo;.
                  </p>
                ) : (
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visiveis.map((usuario) => {
                      const souEu = usuario.codigo === codigoUsuario;
                      return (
                        <li
                          key={usuario.codigo}
                          className={`glass-card flex flex-col gap-4 p-5 ${
                            souEu ? "border-soul-cyan/60 shadow-[0_0_24px_rgba(34,211,238,0.2)]" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-soul-violet to-soul-cyan text-lg font-bold text-soul-950"
                              aria-hidden="true"
                            >
                              {usuario.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-lg font-bold text-white">
                                {usuario.nome}{" "}
                                {souEu && <span className="text-sm text-soul-cyan">(você)</span>}
                              </h3>
                              <p className="truncate text-sm text-white/60">{usuario.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                            <span className="text-sm font-semibold text-soul-gold">
                              {usuario.titulo}
                            </span>
                            <span className="text-sm text-white/70">
                              <strong className="text-lg text-soul-cyan">{usuario.essencia}</strong>{" "}
                              essência
                            </span>
                          </div>

                          {confirmando === usuario.codigo ? (
                            <div
                              role="alertdialog"
                              aria-label={`Confirmar exclusão de ${usuario.nome}`}
                              className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-3"
                            >
                              <p className="mb-3 text-sm text-rose-100">
                                Excluir <strong>{usuario.nome}</strong>? Isso não pode ser desfeito.
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
                                  onClick={() => excluir(usuario)}
                                  disabled={excluindo}
                                >
                                  {excluindo ? "Excluindo..." : "Excluir"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={caminhoDe.cacador(usuario.codigo)}
                                className="inline-flex flex-1 items-center justify-center rounded-lg bg-soul-cyan/15 px-3 py-2 text-sm font-semibold text-soul-cyan transition-colors hover:bg-soul-cyan/25"
                              >
                                Ver perfil
                              </Link>
                              <button
                                type="button"
                                onClick={() => tornarMeuCacador(usuario)}
                                disabled={souEu}
                                aria-label={`Jogar como ${usuario.nome}`}
                                title="Jogar como este caçador"
                                className="inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20 disabled:cursor-default disabled:text-soul-cyan"
                              >
                                <UserCheck className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPainel({ modo: "editar", usuario })}
                                aria-label={`Editar ${usuario.nome}`}
                                title="Editar"
                                className="inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmando(usuario.codigo)}
                                aria-label={`Excluir ${usuario.nome}`}
                                title="Excluir"
                                className="inline-flex items-center justify-center rounded-lg bg-rose-500/15 px-3 py-2 text-rose-300 transition-colors hover:bg-rose-500/25"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                <p className="mt-8 text-center text-sm text-white/50">
                  Quer ver quem está na frente? Confira o{" "}
                  <Link to={ROTAS.ranking} className="text-soul-cyan underline">
                    Ranking
                  </Link>
                  .
                </p>
              </div>
            );
          }}
        </EstadoView>
      </div>
    </section>
  );
}
