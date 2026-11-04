import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Espectro, FaceCarta } from "../../components/Cartas/Cartas";
import { cg, temaCarta } from "../../utils/cartas";
import {
  acessarPartida,
  listarCartas,
  type Carta,
  type Partida,
  type Sessao,
} from "../../services/cardGameService";
import Arena from "../../components/Arena/Arena";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const chaveSessao = "soul-hunter-cardgame:sessao:v1";
const chaveTentativa = "soul-hunter-cardgame:entrada:v1";
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

type Modo = "criar" | "entrar";
type Tentativa = { modo: Modo; nome: string; sessao: Sessao };

function lerConvite() {
  return new URLSearchParams(location.search).get("sala")?.toLowerCase() ?? "";
}

function lerSessao(): Sessao | null {
  try {
    const dados = JSON.parse(sessionStorage.getItem(chaveSessao) ?? "null") as Sessao | null;
    const convite = lerConvite();

    if (dados && uuid.test(dados.id) && uuid.test(dados.token) && (!convite || convite === dados.id)) {
      return dados;
    }
  } catch {
    // O navegador pode bloquear o armazenamento.
  }

  return null;
}

function guardarSessao(sessao: Sessao | null) {
  try {
    if (sessao) {
      sessionStorage.setItem(chaveSessao, JSON.stringify(sessao));
    } else {
      sessionStorage.removeItem(chaveSessao);
    }

    sessionStorage.removeItem(chaveTentativa);
  } catch {
    // A partida continua disponível enquanto a aba estiver aberta.
  }
}

function gerarUuid() {
  if (crypto.randomUUID) return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function prepararTentativa(modo: Modo, nome: string, codigo: string): Sessao {
  try {
    const anterior = JSON.parse(sessionStorage.getItem(chaveTentativa) ?? "null") as Tentativa | null;

    if (
      anterior?.modo === modo &&
      anterior.nome === nome &&
      uuid.test(anterior.sessao.id) &&
      uuid.test(anterior.sessao.token) &&
      (modo === "criar" || anterior.sessao.id === codigo)
    ) {
      return anterior.sessao;
    }
  } catch {
    // Uma tentativa inválida pode ser descartada.
  }

  const sessao = {
    id: modo === "criar" ? gerarUuid() : codigo,
    token: gerarUuid(),
  };

  try {
    sessionStorage.setItem(chaveTentativa, JSON.stringify({ modo, nome, sessao }));
  } catch {
    // O envio funciona mesmo sem armazenamento.
  }

  return sessao;
}

function Lobby({ aoEntrar }: { aoEntrar: (sessao: Sessao, partida: Partida) => void }) {
  const [modo, setModo] = useState<Modo>(() => (lerConvite() ? "entrar" : "criar"));
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState(lerConvite);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;

    const nomeLimpo = nome.trim();
    const codigoLimpo = codigo.trim().toLowerCase();

    if (!nomeLimpo || (modo === "entrar" && !uuid.test(codigoLimpo))) {
      setErro("Preencha seu nome e confira o código da sala, se estiver entrando por convite.");
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      const sessao = prepararTentativa(modo, nomeLimpo, codigoLimpo);
      const partida = await acessarPartida(sessao, nomeLimpo, modo);
      aoEntrar(sessao, partida);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível acessar a sala.");
    } finally {
      setEnviando(false);
    }
  }

  function mudarModo(proximo: Modo) {
    setModo(proximo);
    setErro("");
  }

  return (
    <>
      <section
        className="relative isolate grid min-h-[412px] grid-cols-1 items-center pt-6 pb-[9px] before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_50%_70%,#1a2b52,transparent_70%)] before:opacity-[.68] md:grid-cols-2 md:gap-6 md:py-[38px] md:before:bg-[radial-gradient(ellipse_at_75%_49%,#172a54_0%,#121c35_35%,transparent_67%)]"
        aria-labelledby="titulo"
      >
        <div className="pt-2 pb-3">
          <p className={cg.etiqueta}>
            <span className={cg.luz} /> CARDGAME ONLINE · 1 CONTRA 1
          </p>
          <h1 id="titulo" className="mt-4 mb-5 text-[clamp(3.5rem,14vw,5.3rem)] leading-[.91] font-bold tracking-[-.078em] md:text-[clamp(4rem,8vw,7rem)]">
            Duelo de<br /><em className="text-cg-ciano not-italic">Almas</em>
          </h1>
          <p className="max-w-[35ch] text-[1.06rem] leading-relaxed text-cg-suave">
            Invoque seus fantasmas, combine cartas místicas e encare Nexus NEXT no confronto final.
          </p>
          <div className="mt-[26px] flex flex-wrap gap-x-[19px] gap-y-3 text-[.78rem] text-cg-suave [&_b]:mr-[3px] [&_b]:font-mono [&_b]:text-[#edf6ff]">
            <span><b>02</b> caçadores</span>
            <span><b>06</b> duelos</span>
            <span><b>01</b> chefe final</span>
          </div>
        </div>

        <div className="relative grid min-h-[252px] place-items-center md:min-h-[324px]" aria-hidden="true">
          <div className="absolute h-[91%] w-[83%] max-w-[425px] -rotate-14 rounded-full border border-[#66d4f72c]" />
          <div className="absolute h-[78%] w-[72%] max-w-[365px] rotate-13 rounded-full border border-dashed border-[#b59af83d]" />
          <div className="absolute flex flex-col items-center justify-center rounded-[13px] border border-current p-3 scale-[.77] md:scale-100 after:pointer-events-none after:absolute after:inset-[7px] after:rounded-lg after:border after:border-current after:opacity-20 h-[219px] w-[154px] bg-[linear-gradient(155deg,#172e45,#101326_72%)] text-cg-ciano shadow-[0_12px_30px_#0007] [transform:translate(-75px,19px)_rotate(-17deg)]"><Espectro /></div>
          <div className="absolute flex flex-col items-center justify-center rounded-[13px] border border-current p-3 scale-[.77] md:scale-100 after:pointer-events-none after:absolute after:inset-[7px] after:rounded-lg after:border after:border-current after:opacity-20 h-[219px] w-[154px] bg-[linear-gradient(155deg,#352851,#11142a_72%)] text-cg-violeta shadow-[0_12px_30px_#0007] [transform:translate(75px,19px)_rotate(17deg)]"><Espectro variante={2} /></div>
          <div className="absolute flex flex-col items-center justify-center rounded-[13px] border border-current p-3 scale-[.77] md:scale-100 after:pointer-events-none after:absolute after:inset-[7px] after:rounded-lg after:border after:border-current after:opacity-20 h-[245px] w-[168px] bg-[radial-gradient(circle_at_50%_45%,#524334,#1d1d2b_48%,#161727_74%)] text-[#ffda89] shadow-[0_18px_40px_#0009,0_0_30px_#ffcd7820] [transform:translateY(-10px)_rotate(-5deg)]">
            <div className="flex w-full justify-between px-[3px] font-mono text-[.58rem] font-bold tracking-[.04em]"><span>LENDÁRIO</span><span>SH-025</span></div>
            <Espectro variante={1} />
            <strong className="text-[1.02rem] tracking-[.075em]">NEXUS NEXT</strong>
            <small className="mt-[9px] font-mono text-[.53rem] tracking-[.13em]">✦ CHEFE FINAL ✦</small>
          </div>
        </div>
      </section>

      <section id="arena" className="grid grid-cols-1 gap-[18px] md:grid-cols-[1.13fr_1fr]">
        <div className={cg.painel}>
          <p className={cg.etiqueta}>LOBBY</p>
          <h2 className={cg.titulo}>Entrar na arena</h2>

          <div className="my-4 flex flex-wrap gap-1.5 rounded-[10px] border border-cg-linha bg-[#080f1e] p-1" aria-label="Modo de acesso">
            <button
              type="button"
              className={cg.alternar}
              onClick={() => mudarModo("criar")}
              aria-pressed={modo === "criar"}
              disabled={enviando}
            >
              Criar sala
            </button>
            <button
              type="button"
              className={cg.alternar}
              onClick={() => mudarModo("entrar")}
              aria-pressed={modo === "entrar"}
              disabled={enviando}
            >
              Tenho um convite
            </button>
          </div>

          <form onSubmit={enviar} className={cg.formulario}>
            <label className={cg.rotulo}>
              Nome de caçador
              <input
                className={cg.campo}
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                maxLength={40}
                required
                placeholder="Ex. Giovanni"
                autoComplete="nickname"
                disabled={enviando}
              />
            </label>

            {modo === "entrar" ? (
              <label className={cg.rotulo}>
                Código da sala
                <input
                  className={cg.campo}
                  value={codigo}
                  onChange={(evento) => setCodigo(evento.target.value)}
                  required
                  maxLength={36}
                  placeholder="Cole o código do convite"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={enviando}
                />
              </label>
            ) : null}

            {erro ? <p className={cg.erro} role="alert">{erro}</p> : null}

            <button className={cg.primario} disabled={enviando}>
              {enviando ? "Conectando…" : modo === "criar" ? "Criar partida" : "Entrar na partida"}
              <span className="ml-2" aria-hidden="true">→</span>
            </button>
          </form>
        </div>

        <div className={`${cg.painel} bg-[linear-gradient(155deg,#111c32,#0d1729)]`} id="regras">
          <p className={`${cg.etiquetaBase} text-cg-violeta`}>REGRAS RÁPIDAS</p>
          <h2 className={cg.titulo}>Como jogar</h2>

          <ol className="mt-4 grid gap-3.5 [&_li]:flex [&_li]:items-start [&_li]:gap-3 [&_li>span]:rounded-md [&_li>span]:border [&_li>span]:border-[#3c3561] [&_li>span]:bg-[#211d39] [&_li>span]:px-[7px] [&_li>span]:py-[5px] [&_li>span]:font-mono [&_li>span]:text-[.72rem] [&_li>span]:font-bold [&_li>span]:text-cg-violeta [&_p]:mt-0.5 [&_p]:text-[.88rem] [&_p]:leading-relaxed [&_p]:text-cg-suave">
            <li>
              <span>01</span>
              <div>
                <strong>Chame outro caçador</strong>
                <p>Crie uma sala e envie o link ou o código do convite.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Dispute seis duelos</strong>
                <p>Escolha um fantasma da raridade da rodada. Use até duas místicas ao longo dos duelos.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Enfrente Nexus NEXT</strong>
                <p>Combine dois fantasmas já usados, um de cada grupo de raridade. Quem somar mais almas vence.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}

function Catalogo({ cartas, erro, carregar }: {
  cartas: Carta[];
  erro: string;
  carregar: () => void;
}) {
  const [filtro, setFiltro] = useState<"todas" | "fantasma" | "mistica">("todas");
  const [expandido, setExpandido] = useState(false);

  const filtradas = cartas.filter((carta) => filtro === "todas" || carta.tipo === filtro);
  const visiveis = expandido ? filtradas : filtradas.slice(0, 6);

  return (
    <section id="catalogo" className={`${cg.painel} mt-[18px] mb-8`}>
      <div className={cg.linhaSecao}>
        <div>
          <p className={cg.etiqueta}>COLEÇÃO</p>
          <h2 className={cg.titulo}>Catálogo de cartas</h2>
        </div>

        {cartas.length > 0 ? (
          <label className={cg.rotulo}>
            Tipo de carta
            <select
              className={`${cg.campo} min-w-[130px]`}
              value={filtro}
              onChange={(evento) => {
                setFiltro(evento.target.value as typeof filtro);
                setExpandido(false);
              }}
            >
              <option value="todas">Todas</option>
              <option value="fantasma">Fantasmas</option>
              <option value="mistica">Místicas</option>
            </select>
          </label>
        ) : null}
      </div>

      {erro ? (
        <div>
          <p className={cg.erro} role="alert">{erro}</p>
          <button type="button" className={cg.botao} onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      ) : cartas.length === 0 ? (
        <p role="status">Carregando cartas…</p>
      ) : (
        <>
          <p className="text-cg-suave">{visiveis.length} de {filtradas.length} cartas</p>

          <ul className="my-3.5 grid grid-cols-[repeat(auto-fill,minmax(min(100%,142px),1fr))] items-stretch gap-3">
            {visiveis.map((carta) => (
              <li key={carta.id} className={cg.carta} data-tema={temaCarta(carta)}>
                <FaceCarta carta={carta} />
              </li>
            ))}
          </ul>

          {filtradas.length > 6 ? (
            <button
              type="button"
              className={cg.botao}
              aria-expanded={expandido}
              onClick={() => setExpandido(!expandido)}
            >
              {expandido ? "Mostrar menos cartas" : "Mostrar todas as cartas"}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}

export default function Cardgame() {
  useDocumentTitle("Card Game");
  const navigate = useNavigate();
  const [sessao, setSessao] = useState(lerSessao);
  const [partida, setPartida] = useState<Partida | null>(null);
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [erroCatalogo, setErroCatalogo] = useState("");
  const [tentativaCatalogo, setTentativaCatalogo] = useState(0);

  useEffect(() => {
    const controle = new AbortController();

    void listarCartas(controle.signal)
      .then(({ cartas }) => {
        if (controle.signal.aborted) return;
        if (cartas.length === 0) throw new Error("O catálogo está vazio.");

        setCartas(cartas);
      })
      .catch((erro: unknown) => {
        if (controle.signal.aborted) return;

        setErroCatalogo(
          erro instanceof Error ? erro.message : "Não foi possível carregar o catálogo.",
        );
      });

    return () => controle.abort();
  }, [tentativaCatalogo]);

  function tentarCatalogoNovamente() {
    setErroCatalogo("");
    setTentativaCatalogo((tentativa) => tentativa + 1);
  }

  function entrar(novaSessao: Sessao, novaPartida: Partida) {
    guardarSessao(novaSessao);

    const url = new URL(location.href);
    url.searchParams.set("sala", novaSessao.id);
    void navigate(`${url.pathname}${url.search}${url.hash}`, { replace: true });

    setPartida(novaPartida);
    setSessao(novaSessao);
  }

  function sair() {
    guardarSessao(null);

    const url = new URL(location.href);
    url.searchParams.delete("sala");
    void navigate(`${url.pathname}${url.search}`, { replace: true });

    setSessao(null);
    setPartida(null);
  }

  return (
    <section
      className="bg-cg-fundo font-[family-name:Segoe_UI,system-ui,sans-serif] text-[#eff4ff] scheme-dark"
      aria-label="Duelo de Almas"
    >
      <div className="mx-auto w-[calc(100%-32px)] pb-px md:w-[min(1120px,calc(100%-64px))]">
        {sessao ? (
          <Arena sessao={sessao} inicial={partida} cartas={cartas} aoSair={sair} />
        ) : (
          <Lobby aoEntrar={entrar} />
        )}

        <Catalogo
          cartas={cartas}
          erro={erroCatalogo}
          carregar={tentarCatalogoNovamente}
        />
      </div>
    </section>
  );
}