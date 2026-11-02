import { Minus, RefreshCw, Trophy } from "lucide-react";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button";
import EstadoView from "../../components/EstadoView/EstadoView";
import GhostField from "../../components/Ghost/GhostField";
import { useGame } from "../../context/useGame";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { caminhoDe, ROTAS } from "../../routes/paths";
import { usuarioService } from "../../services/usuarioService";
import { medalhaVisual, montarRanking } from "../../utils/ranking";

const cabecalho =
  "border border-white/10 bg-soul-800 px-3 py-3 text-white sm:px-4 sm:py-4 lg:px-6";
const celula = "border border-white/10 px-3 py-3 sm:px-4 sm:py-4";

export default function Ranking() {
  useDocumentTitle("Ranking");
  const { codigoUsuario } = useGame();

  const buscar = useCallback((signal: AbortSignal) => usuarioService.listar(signal), []);
  const { estado, recarregar } = useApi(buscar);

  return (
    <section className="relative overflow-hidden py-10 md:py-12">
      <GhostField
        ghosts={[
          { top: "6%", left: "5%", size: 55, color: "#fbbf24", opacity: 0.3, variant: 1 },
          { bottom: "8%", right: "6%", size: 60, color: "#d946ef", opacity: 0.3, variant: 3 },
        ]}
      />
      <div className="relative mx-auto w-[92%] max-w-4xl text-center xl:max-w-5xl">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-soul-gold/40 bg-soul-gold/10 px-4 py-1 text-sm font-semibold text-soul-gold">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Hall da fama
        </span>
        <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl xl:text-5xl">Ranking</h2>
        <p className="mx-auto mb-8 max-w-2xl text-white/70">
          Classificação em tempo real vinda da API (<code className="text-soul-cyan-soft">GET /usuarios</code>
          ), ordenada por essência. Registre reciclagem e deslocamentos no{" "}
          <Link to={ROTAS.dashboard} className="text-soul-cyan underline">
            Dashboard
          </Link>{" "}
          para subir de posição.
        </p>

        <EstadoView
          estado={estado}
          onTentarNovamente={recarregar}
          textoCarregando="Contando a essência dos caçadores..."
          vazio={
            <>
              <p className="font-semibold text-white">O ranking está vazio.</p>
              <p className="text-sm text-white/70">Ninguém entrou na caçada ainda.</p>
              <Link
                to={ROTAS.cacadores}
                className="font-semibold text-soul-cyan underline-offset-4 hover:underline"
              >
                Cadastrar o primeiro caçador
              </Link>
            </>
          }
        >
          {(usuarios) => {
            const ranking = montarRanking(usuarios);
            return (
              <>
                <div className="mb-4 flex justify-end">
                  <Button variant="ghost" onClick={recarregar} className="px-4 py-2 text-sm">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Atualizar
                  </Button>
                </div>

                <div className="w-full overflow-x-auto rounded-2xl">
                  <table className="w-full min-w-[520px] border-collapse overflow-hidden rounded-2xl">
                    <caption className="sr-only">Ranking dos caçadores por essência</caption>
                    <thead>
                      <tr>
                        <th scope="col" className={cabecalho}>#</th>
                        <th scope="col" className={`${cabecalho} text-left`}>Caçador</th>
                        <th scope="col" className={cabecalho}>Título</th>
                        <th scope="col" className={cabecalho}>Essência</th>
                        <th scope="col" className={cabecalho}>Medalha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.map((entrada) => {
                        const souEu = entrada.codigo === codigoUsuario;
                        const medalha = medalhaVisual[entrada.medalha];
                        return (
                          <tr
                            key={entrada.codigo}
                            data-level={entrada.medalha}
                            className={souEu ? "bg-soul-cyan/15" : "bg-white/[0.02]"}
                          >
                            <td className={`${celula} text-white/85`}>{entrada.posicao}º</td>
                            <td className={`${celula} text-left font-medium text-white/90`}>
                              <Link
                                to={caminhoDe.cacador(entrada.codigo)}
                                className="hover:text-soul-cyan hover:underline"
                              >
                                {entrada.nome}
                              </Link>{" "}
                              {souEu && <span className="text-soul-cyan">(você)</span>}
                            </td>
                            <td className={`${celula} text-sm text-soul-gold`}>{entrada.titulo}</td>
                            <td className={`${celula} font-semibold text-white/90`}>{entrada.essencia}</td>
                            <td className={celula}>
                              {medalha ? (
                                <span
                                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-full"
                                  style={{
                                    backgroundColor: `${medalha.color}22`,
                                    color: medalha.color,
                                    boxShadow: `0 0 14px ${medalha.color}44`,
                                  }}
                                  role="img"
                                  aria-label={medalha.label}
                                >
                                  <medalha.icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : (
                                <Minus className="mx-auto h-4 w-4 text-white/30" aria-label="Sem medalha" />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            );
          }}
        </EstadoView>
      </div>
    </section>
  );
}
