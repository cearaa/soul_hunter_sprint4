/** Faixas de título definidas pela regra de negócio do back-end Java. */
const faixas = [
  { nome: "Aprendiz de Caçador", minimo: 0 },
  { nome: "Caçador Iniciante", minimo: 30 },
  { nome: "Caçador Raro", minimo: 60 },
  { nome: "Caçador Lendário", minimo: 100 },
] as const;

export interface ProgressoTitulo {
  /** Título da faixa atual, calculado a partir da essência. */
  atual: string;
  /** Próximo título, ou null se já está no topo. */
  proximo: string | null;
  faltam: number;
  percentual: number;
}

export function progressoTitulo(essencia: number): ProgressoTitulo {
  let indice = 0;
  faixas.forEach((faixa, i) => {
    if (essencia >= faixa.minimo) indice = i;
  });

  const atual = faixas[indice];
  const proxima = faixas[indice + 1];
  if (!proxima) {
    return { atual: atual.nome, proximo: null, faltam: 0, percentual: 100 };
  }

  const amplitude = proxima.minimo - atual.minimo;
  const percentual = Math.round(((essencia - atual.minimo) / amplitude) * 100);
  return {
    atual: atual.nome,
    proximo: proxima.nome,
    faltam: proxima.minimo - essencia,
    percentual,
  };
}
