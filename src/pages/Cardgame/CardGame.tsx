import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Espectro, FaceCarta } from "../../components/Cartas/Cartas";
import { temaCarta } from "../../utils/cartas";
import {
  acessarPartida,
  listarCartas,
  type Carta,
  type Partida,
  type Sessao,
} from "../../services/cardGameService";
import Arena from "../../components/Arena/Arena";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import "./estilos.css";

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
      <section className="hero" aria-labelledby="titulo">
        <div className="hero-texto">
          <p className="etiqueta">
            <span className="luz" /> CARDGAME ONLINE · 1 CONTRA 1
          </p>
          <h1 id="titulo">
            Duelo de<br /><em>Almas</em>
          </h1>
          <p className="descricao">
            Invoque seus fantasmas, combine cartas místicas e encare Nexus NEXT no confronto final.
          </p>
          <div className="hero-dados">
            <span><b>02</b> caçadores</span>
            <span><b>06</b> duelos</span>
            <span><b>01</b> chefe final</span>
          </div>
        </div>

        <div className="vitrine" aria-hidden="true">
          <div className="orbita orbita-externa" />
          <div className="orbita orbita-interna" />
          <div className="carta-vitrine carta-esquerda"><Espectro /></div>
          <div className="carta-vitrine carta-direita"><Espectro variante={2} /></div>
          <div className="carta-vitrine carta-central">
            <div><span>LENDÁRIO</span><span>SH-025</span></div>
            <Espectro variante={1} />
            <strong>NEXUS NEXT</strong>
            <small>✦ CHEFE FINAL ✦</small>
          </div>
        </div>
      </section>

      <section id="arena" className="entrada-grid">
        <div className="painel">
          <p className="etiqueta">LOBBY</p>
          <h2>Entrar na arena</h2>

          <div className="alternador" aria-label="Modo de acesso">
            <button
              type="button"
              onClick={() => mudarModo("criar")}
              aria-pressed={modo === "criar"}
              disabled={enviando}
            >
              Criar sala
            </button>
            <button
              type="button"
              onClick={() => mudarModo("entrar")}
              aria-pressed={modo === "entrar"}
              disabled={enviando}
            >
              Tenho um convite
            </button>
          </div>

          <form onSubmit={enviar} className="formulario">
            <label>
              Nome de caçador
              <input
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
              <label>
                Código da sala
                <input
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

            {erro ? <p className="erro" role="alert">{erro}</p> : null}

            <button className="botao primario" disabled={enviando}>
              {enviando ? "Conectando…" : modo === "criar" ? "Criar partida" : "Entrar na partida"}
              <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>

        <div className="painel guia" id="regras">
          <p className="etiqueta">REGRAS RÁPIDAS</p>
          <h2>Como jogar</h2>

          <ol className="passos">
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
    <section id="catalogo" className="painel catalogo">
      <div className="linha-secao">
        <div>
          <p className="etiqueta">COLEÇÃO</p>
          <h2>Catálogo de cartas</h2>
        </div>

        {cartas.length > 0 ? (
          <label>
            Tipo de carta
            <select
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
          <p className="erro" role="alert">{erro}</p>
          <button type="button" className="botao" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      ) : cartas.length === 0 ? (
        <p role="status">Carregando cartas…</p>
      ) : (
        <>
          <p className="suave">{visiveis.length} de {filtradas.length} cartas</p>

          <ul className="grade-cartas">
            {visiveis.map((carta) => (
              <li key={carta.id} className="carta" data-tema={temaCarta(carta)}>
                <FaceCarta carta={carta} />
              </li>
            ))}
          </ul>

          {filtradas.length > 6 ? (
            <button
              type="button"
              className="botao"
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
    <section className="cardgame" aria-label="Duelo de Almas">
      <div className="limite">
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