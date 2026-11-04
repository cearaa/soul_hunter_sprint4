import { useEffect, useState, type FormEvent } from 'react';
import { consultarPartida, enviarJogada, ErroApi, type Carta, type Jogada, type Partida, type Sessao } from '../../hooks/apiCardGame';
import { FaceCarta } from "../../components/Cartas/Cartas";
import { raridades, temaCarta } from "../../hooks/cartaUtils.ts";

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
      <legend>{titulo}</legend>
      <div className="grade-cartas escolha">
        {cartas.map((carta) => (
          <label className="opcao-carta" key={carta.id}>
            <input type="radio" name={nome} checked={valor === carta.id} onChange={() => escolher(carta.id)} />
            <span className="carta" data-tema={temaCarta(carta)}><FaceCarta carta={carta} /></span>
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
    <form onSubmit={jogar} className="formulario jogada">
      <fieldset disabled={enviando} className="formulario">
        <EscolherCarta cartas={fantasmas} nome="fantasma" titulo={chefe ? 'Fantasma comum ou incomum' : 'Escolha seu fantasma'} valor={fantasma} escolher={setFantasma} />
        {chefe ? <EscolherCarta cartas={fantasmasAltos} nome="fantasmaAlto" titulo="Fantasma raro ou épico" valor={fantasmaAlto} escolher={setFantasmaAlto} /> : null}
        {permiteMistica ? (
          <label className="campo-mistica">
            Mística opcional
            <select value={mistica} onChange={(e) => setMistica(e.target.value)}>
              <option value="">Sem mística</option>
              {misticas.map((carta) => <option key={carta.id} value={carta.id}>{carta.nome}</option>)}
            </select>
            {escolhaMistica ? <small>{escolhaMistica.habilidade}</small> : null}
          </label>
        ) : null}
        {erro ? <p className="erro" role="alert">{erro}</p> : null}
        <button className="botao primario" disabled={enviando || !fantasma || (chefe && !fantasmaAlto)}>
          {enviando ? 'Enviando…' : 'Confirmar jogada'} <span aria-hidden="true">→</span>
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
    <div className="formulario">
      <p>Envie o link ou o código abaixo para o segundo jogador. A primeira rodada começa quando ele entrar.</p>
      <label>Código da sala<input readOnly value={id} onFocus={(evento) => evento.target.select()} /></label>
      <button type="button" className="botao primario" onClick={copiar}>Copiar link do convite</button>
      <p role="status" className="suave">{aviso}</p>
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
    <section className="painel historico">
      <p className="etiqueta">REGISTRO DA ARENA</p>
      <h2>Rodadas reveladas</h2>
      <ol>
        {[...partida.historico].reverse().map((rodada) => {
          const numero = rodada.jogadas[0].rodada;
          return (
            <li key={numero}>
              <details open={numero === partida.historico.length}>
                <summary>
                  <strong>{numero === 7 ? 'Nexus NEXT' : `Duelo ${numero}`}</strong>
                  <span>{rodada.almas[voce.posicao]} × {rodada.almas[outro]} almas</span>
                </summary>
                <dl>
                  {[voce.posicao, outro].map((posicao) => (
                    <div key={posicao}>
                      <dt>{posicao === voce.posicao ? `${voce.nome} (você)` : oponente?.nome}</dt>
                      <dd>{descrever(rodada.jogadas[posicao])}</dd>
                      <dd>ATQ {rodada.forcas[posicao].ataque} · DEF {rodada.forcas[posicao].defesa}</dd>
                      {rodada.capturouNexus ? <dd>{rodada.capturouNexus[posicao] ? 'Capturou Nexus' : 'Nexus escapou'}</dd> : null}
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
    <div id="arena" className="arena">
      <div className="linha-secao">
        <div><p className="etiqueta"><span className="luz" /> ARENA · DUELO DE ALMAS</p><h1>{finalizada ? 'Partida encerrada' : 'Mesa de duelo'}</h1></div>
        <button className="botao" type="button" onClick={sair}>Voltar ao lobby</button>
      </div>

      {erro ? <p className="erro" role="alert">{erro}</p> : null}
      {!partida ? (erro ? null : <p role="status">Carregando partida…</p>) : (
        <>
          <section className="painel mesa" aria-label="Placar e progresso">
            <div className="placar">
              <div><span>{voce?.nome} · você</span><strong>{partida.placar[minhaPosicao]}</strong></div>
              <span className="versus">VS</span>
              <div><span>{rival?.nome ?? 'Aguardando rival'}</span><strong>{partida.placar[outraPosicao]}</strong></div>
            </div>
            <ol className="progresso" aria-label="Progresso das rodadas">
              {Array.from({ length: 7 }, (_, i) => (
                <li key={i} aria-current={partida.rodada === i + 1 ? 'step' : undefined}
                  data-concluida={i < partida.historico.length} aria-label={i === 6 ? 'Nexus NEXT' : `Duelo ${i + 1}`}>
                  {i === 6 ? '✦' : i + 1}
                </li>
              ))}
            </ol>
          </section>

          <section className="painel turno" aria-labelledby="turno-titulo">
            {partida.status === 'aguardando' ? (
              <>
                <p className="etiqueta">SALA ABERTA</p>
                <h2 id="turno-titulo">Aguardando outro caçador</h2>
                <Convite id={partida.id} />
              </>
            ) : resultado ? (
              <div role="status">
                <p className="etiqueta">RESULTADO FINAL</p>
                <h2 id="turno-titulo">{resultado.empate ? 'Empate' : resultado.vencedor === minhaPosicao ? 'Você venceu!' : `${rival?.nome ?? 'Seu rival'} venceu`}</h2>
                <p>Placar em almas · {partida.placar[minhaPosicao]} a {partida.placar[outraPosicao]}</p>
              </div>
            ) : (
              <>
                <p className="etiqueta">RODADA {partida.rodada} / 7</p>
                <h2 id="turno-titulo">{faseChefe ? partida.chefe.nome : `Duelo · ${partida.raridadeDaRodada ? raridades[partida.raridadeDaRodada] : ''}`}</h2>
                {faseChefe ? (
                  <p>Combine dois fantasmas já usados para alcançar pelo menos {partida.chefe.ataque} de ataque e {partida.chefe.defesa} de defesa. Se usar uma mística, ela afeta apenas o fantasma raro ou épico.</p>
                ) : <p>Místicas restantes nos duelos: {voce?.misticasDeDueloRestantes}.</p>}
                <p className="estado-rival" role="status">
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
