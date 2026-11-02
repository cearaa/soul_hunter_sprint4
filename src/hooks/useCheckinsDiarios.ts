import { useCallback, useState } from "react";

function chaveDoDia(codigo: number): string {
  const hoje = new Date();
  const dia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  return `soulhunter:checkins:${codigo}:${dia}`;
}

function ler(chave: string): string[] {
  try {
    const bruto = localStorage.getItem(chave);
    const lista: unknown = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/** Check-ins do diário sustentável: guardados no aparelho, por caçador e por dia (zeram à meia-noite). */
export function useCheckinsDiarios(codigo: number) {
  const chave = chaveDoDia(codigo);
  const [feitos, setFeitos] = useState<string[]>(() => ler(chave));

  const alternar = useCallback(
    (id: string) => {
      setFeitos((atual) => {
        const proximo = atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id];
        try {
          localStorage.setItem(chave, JSON.stringify(proximo));
        } catch {
          // Sem armazenamento disponível: o check-in vale apenas enquanto a página está aberta.
        }
        return proximo;
      });
    },
    [chave],
  );

  return { feitos, alternar };
}
