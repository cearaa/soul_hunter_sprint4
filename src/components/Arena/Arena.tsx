import { useEffect, useState, type FormEvent } from 'react';
import { consultarPartida, enviarJogada, ErroApi, type Carta, type Jogada, type Partida, type Sessao } from "../../services/cardGameService";
import { FaceCarta } from "../../components/Cartas/Cartas";
import { cg, raridades, temaCarta } from "../../utils/cartas";

function versao(partida: Partida) {
  // Entre rodadas, o rival entra e cada envio muda de pendente para confirmado uma vez.
  return partida.historico.length * 4
    + Number(Boolean(partida.oponente))
    + Number(Boolean(partida.oponente?.jogou))
    + Number(Boolean(partida.voce.jogadaEnviada));
}

function estadoMaisRecente(atual: Partida | null, novo: Partida) {
  return atual && versao(atual) > versao(novo) ? atual : novo;
}

function EscolherCarta({ cartas, nome, titulo, valor, escolher }: {
  cartas: Carta[];
  nome: string;
  titulo: string;
  valor: string;
  escolher: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className={cg.rotulo}>{titulo}</legend>
      <div className="my-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,128px),153px))] items-stretch gap-3">
        {cartas.map((carta) => (
          <label className="relative cursor-pointer" key={carta.id}>
            <input className="peer absolute top-2 right-2 z-1 accent-cg-ciano" type="radio" name={nome} checked={valor === carta.id} onChange={() => escolher(carta.id)} />
            <span className={`${cg.carta} h-full peer-checked:outline-2 peer-checked:outline-offset-2 peer-checked:outline-cg-ciano peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-white peer-focus-visible:outline-dashed`} data-tema={temaCarta(carta)}><FaceCarta carta={carta} /></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function EscolherJogada({ partida, sessao, atualizar }: {
  partida: Partida;
  sessao: Sessao;
  atualizar: (partida: Partida) => void;
}) {
  const [fantasma, setFantasma] = useState('');
  const [fantasmaAlto, setFantasmaAlto] = useState('');
  const [mistica, setMistica] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const chefe = partida.fase === 'chefe';
  const { mao, fantasmasUsados, misticasUsadas, misticasDeDueloRestantes } = partida.voce;
  const fantasmas = mao.fantasmas.filter((carta) => chefe
    ? fantasmasUsados.includes(carta.id) && ['comum', 'incomum'].includes(carta.raridade)
    : carta.raridade === partida.raridadeDaRodada && !fantasmasUsados.includes(carta.id));
  const fantasmasAltos = chefe
    ? mao.fantasmas.filter((carta) => fantasmasUsados.includes(carta.id) && ['raro', 'epico'].includes(carta.raridade))
    : [];
  const misticas = mao.misticas.filter((carta) => !misticasUsadas.includes(carta.id));
  const permiteMistica = (chefe || misticasDeDueloRestantes > 0) && misticas.length > 0;
  const escolhaMistica = misticas.find((carta) => carta.id === mistica);

  async function jogar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando || !partida.rodada || !fantasma || (chefe && !fantasmaAlto)) return;

    const base = { rodada: partida.rodada, misticaId: permiteMistica && mistica ? mistica : null };
    const jogada: Jogada = chefe
      ? { ...base, fantasmaBaixoId: fantasma, fantasmaAltoId: fantasmaAlto }
      : { ...base, fantasmaId: fantasma };

    setErro('');
    setEnviando(true);
    try {
      atualizar(await enviarJogada(sessao, jogada));
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível enviar a jogada.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={jogar} className={`${cg.formulario} mt-3`}>
      <fieldset disabled={enviando} className={`${cg.formulario} mt-3`}>
        <EscolherCarta cartas={fantasmas} nome="fantasma" titulo={chefe ? 'Fantasma comum ou incomum' : 'Escolha seu fantasma'} valor={fantasma} escolher={setFantasma} />
        {chefe ? <EscolherCarta cartas={fantasmasAltos} nome="fantasmaAlto" titulo="Fantasma raro ou épico" valor={fantasmaAlto} escolher={setFantasmaAlto} /> : null}
        {permiteMistica ? (
          <label className={`${cg.rotulo} max-w-[430px]`}>
            Mística opcional
            <select className={cg.campo} value={mistica} onChange={(e) => setMistica(e.target.value)}>
              <option value="">Sem mística</option>
              {misticas.map((carta) => <option key={carta.id} value={carta.id}>{carta.nome}</option>)}
            </select>
            {escolhaMistica ? <small className="mt-[7px] block font-normal text-cg-suave">{escolhaMistica.habilidade}</small> : null}
          </label>
        ) : null}
        {erro ? <p className={cg.erro} role="alert">{erro}</p> : null}
        <button className={cg.primario} disabled={enviando || !fantasma || (chefe && !fantasmaAlto)}>
          {enviando ? 'Enviando…' : 'Confirmar jogada'} <span className="ml-2" aria-hidden="true">→</span>
        </button>
      </fieldset>
    </form>
  );
}

function Convite({ id }: { id: string }) {
  const [aviso, setAviso] = useState('');
  const link = new URL(location.pathname, location.origin);
  link.searchParams.set('sala', id);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link.href);
      setAviso('Link do convite copiado.');
    } catch {
      setAviso('Copie o código da sala no campo acima.');
    }
  }

  return (
    <div className={`${cg.formulario} mt-3`}>
      <p className="text-cg-suave">Envie o link ou o código abaixo para o segundo jogador. A primeira rodada começa quando ele entrar.</p>
      <label className={`${cg.rotulo} max-w-[430px]`}>Código da sala<input className={cg.campo} readOnly value={id} onFocus={(evento) => evento.target.select()} /></label>
      <button type="button" className={cg.primario} onClick={copiar}>Copiar link do convite</button>
      <p role="status" className="text-cg-suave">{aviso}</p>
    </div>
  );
}

function Historico({ partida, cartas }: { partida: Partida; cartas: Carta[] }) {
  if (!partida.historico.length) return null;

  const { voce, oponente } = partida;
  const outro = voce.posicao === 0 ? 1 : 0;
  const nomes = new Map([...cartas, ...voce.mao.fantasmas, ...voce.mao.misticas].map((carta) => [carta.id, carta.nome]));

  function descrever(jogada: Jogada) {
    const ids = 'fantasmaId' in jogada ? [jogada.fantasmaId] : [jogada.fantasmaBaixoId, jogada.fantasmaAltoId];
    if (jogada.misticaId) ids.push(jogada.misticaId);
    return ids.map((id) => nomes.get(id) ?? id).join(' + ');
  }

  return (
    <section className={cg.painel}>
      <p className={cg.etiqueta}>REGISTRO DA ARENA</p>
      <h2 className={cg.titulo}>Rodadas reveladas</h2>
      <ol className="grid gap-2">
        {[...partida.historico].reverse().map((rodada) => {
          const numero = rodada.jogadas[0].rodada;
          return (
            <li key={numero}>
              <details className="rounded-lg border border-cg-linha bg-[#0a1324] px-3 py-2.5" open={numero === partida.historico.length}>
                <summary className="cursor-pointer text-[#e8f3ff]">
                  <strong>{numero === 7 ? 'Nexus NEXT' : `Duelo ${numero}`}</strong>
                  <span className="ml-3 text-[.83rem] text-cg-ciano">{rodada.almas[voce.posicao]} × {rodada.almas[outro]} almas</span>
                </summary>
                <dl className="mt-2.5 grid grid-cols-1 gap-2.5 min-[361px]:grid-cols-2">
                  {[voce.posicao, outro].map((posicao) => (
                    <div key={posicao}>
                      <dt className="font-bold wrap-anywhere">{posicao === voce.posicao ? `${voce.nome} (você)` : oponente?.nome}</dt>
                      <dd className="mt-0.5 text-[.86rem] text-cg-suave">{descrever(rodada.jogadas[posicao])}</dd>
                      <dd className="mt-0.5 text-[.86rem] text-cg-suave">ATQ {rodada.forcas[posicao].ataque} · DEF {rodada.forcas[posicao].defesa}</dd>
                      {rodada.capturouNexus ? <dd className="mt-0.5 text-[.86rem] text-cg-suave">{rodada.capturouNexus[posicao] ? 'Capturou Nexus' : 'Nexus escapou'}</dd> : null}
                    </div>
                  ))}
                </dl>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function Arena({ sessao, inicial, cartas, aoSair }: {
  sessao: Sessao;
  inicial: Partida | null;
  cartas: Carta[];
  aoSair: () => void;
}) {
  const [partida, setPartida] = useState(inicial);
  const [erro, setErro] = useState('');
  const finalizada = partida?.status === 'finalizada';

  useEffect(() => {
    if (finalizada) return;

    const controle = new AbortController();
    let proxima: number | undefined;

    async function atualizar() {
      try {
        const nova = await consultarPartida(sessao, controle.signal);
        if (controle.signal.aborted) return;
        setPartida((atual) => estadoMaisRecente(atual, nova));
        setErro('');
        if (nova.status === 'finalizada') return;
      } catch (falha) {
        if (controle.signal.aborted) return;
        setErro(falha instanceof Error ? falha.message : 'Falha ao consultar a arena.');
        if (falha instanceof ErroApi && [401, 404].includes(falha.status)) return;
      }
      proxima = window.setTimeout(atualizar, 2200);
    }

    void atualizar();
    return () => {
      controle.abort();
      window.clearTimeout(proxima);
    };
  }, [sessao, finalizada]);

  function sair() {
    if (!finalizada && !window.confirm('Voltar ao lobby? Você perderá o acesso a esta partida nesta aba.')) return;
    aoSair();
  }

  const voce = partida?.voce;
  const rival = partida?.oponente;
  const minhaPosicao = voce?.posicao ?? 0;
  const outraPosicao = minhaPosicao === 0 ? 1 : 0;
  const faseChefe = partida?.fase === 'chefe';
  const pendente = voce?.jogadaEnviada;
  const resultado = partida?.resultado;

  return (
    <div id="arena" className="grid gap-4 pt-[30px]">
      <div className={cg.linhaSecao}>
        <div><p className={cg.etiqueta}><span className={cg.luz} /> ARENA · DUELO DE ALMAS</p><h1 className="mt-[5px] text-[clamp(2rem,5vw,3.2rem)] leading-[1.04] font-bold tracking-[-.06em]">{finalizada ? 'Partida encerrada' : 'Mesa de duelo'}</h1></div>
        <button className={cg.botao} type="button" onClick={sair}>Voltar ao lobby</button>
      </div>

      {erro ? <p className={cg.erro} role="alert">{erro}</p> : null}
      {!partida ? (erro ? null : <p role="status">Carregando partida…</p>) : (
        <>
          <section className={`${cg.painel} bg-[radial-gradient(ellipse_at_top,#172946,var(--color-cg-painel)_74%)]`} aria-label="Placar e progresso">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5 text-center [&>div]:grid [&>div]:gap-[5px] [&>div]:text-[.9rem] [&>div]:text-cg-suave [&>div]:wrap-anywhere [&_strong]:text-[clamp(2.25rem,7vw,3.6rem)] [&_strong]:leading-none">
              <div><span>{voce?.nome} · você</span><strong className="text-cg-ciano">{partida.placar[minhaPosicao]}</strong></div>
              <span className="rounded-md border border-cg-linha px-[7px] py-[5px] font-mono text-[.72rem] font-bold text-cg-suave">VS</span>
              <div><span>{rival?.nome ?? 'Aguardando rival'}</span><strong className="text-cg-violeta">{partida.placar[outraPosicao]}</strong></div>
            </div>
            <ol className="mt-5 flex justify-center gap-[clamp(4px,2vw,8px)]" aria-label="Progresso das rodadas">
              {Array.from({ length: 7 }, (_, i) => (
                <li key={i} className="grid h-[31px] w-[31px] place-items-center rounded-[7px] border border-cg-linha font-mono text-[.73rem] font-bold text-cg-suave data-[concluida=true]:border-[#3d6d78] data-[concluida=true]:bg-[#122934] data-[concluida=true]:text-cg-ciano aria-[current=step]:border-cg-ciano aria-[current=step]:bg-cg-ciano aria-[current=step]:text-cg-fundo" aria-current={partida.rodada === i + 1 ? 'step' : undefined}
                  data-concluida={i < partida.historico.length} aria-label={i === 6 ? 'Nexus NEXT' : `Duelo ${i + 1}`}>
                  {i === 6 ? '✦' : i + 1}
                </li>
              ))}
            </ol>
          </section>

          <section className={cg.painel} aria-labelledby="turno-titulo">
            {partida.status === 'aguardando' ? (
              <>
                <p className={cg.etiqueta}>SALA ABERTA</p>
                <h2 id="turno-titulo" className={cg.titulo}>Aguardando outro caçador</h2>
                <Convite id={partida.id} />
              </>
            ) : resultado ? (
              <div role="status">
                <p className={cg.etiqueta}>RESULTADO FINAL</p>
                <h2 id="turno-titulo" className={cg.titulo}>{resultado.empate ? 'Empate' : resultado.vencedor === minhaPosicao ? 'Você venceu!' : `${rival?.nome ?? 'Seu rival'} venceu`}</h2>
                <p className="text-cg-suave">Placar em almas · {partida.placar[minhaPosicao]} a {partida.placar[outraPosicao]}</p>
              </div>
            ) : (
              <>
                <p className={cg.etiqueta}>RODADA {partida.rodada} / 7</p>
                <h2 id="turno-titulo" className={cg.titulo}>{faseChefe ? partida.chefe.nome : `Duelo · ${partida.raridadeDaRodada ? raridades[partida.raridadeDaRodada] : ''}`}</h2>
                {faseChefe ? (
                  <p className="text-cg-suave">Combine dois fantasmas já usados para alcançar pelo menos {partida.chefe.ataque} de ataque e {partida.chefe.defesa} de defesa. Se usar uma mística, ela afeta apenas o fantasma raro ou épico.</p>
                ) : <p className="text-cg-suave">Místicas restantes nos duelos: {voce?.misticasDeDueloRestantes}.</p>}
                <p className="mt-2 text-cg-suave" role="status">
                  {pendente ? 'Jogada registrada. Aguardando o rival.' : rival?.jogou ? 'Seu rival já jogou. Faça sua escolha.' : 'As duas jogadas ficam ocultas até a revelação.'}
                </p>
                {!pendente ? <EscolherJogada key={partida.rodada} partida={partida} sessao={sessao} atualizar={(nova) => {
                  setPartida((atual) => estadoMaisRecente(atual, nova));
                  setErro('');
                }} /> : null}
              </>
            )}
          </section>
          <Historico partida={partida} cartas={cartas} />
        </>
      )}
    </div>
  );
}
