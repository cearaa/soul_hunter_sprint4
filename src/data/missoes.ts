import { Droplet, Recycle, ShoppingBag, Zap, Bus, type LucideIcon } from "lucide-react";

export type CategoriaMissao = "reciclagem" | "transporte" | "agua" | "energia" | "consumo";

export interface Missao {
  id: string;
  pergunta: string;
}

export interface GrupoMissoes {
  categoria: CategoriaMissao;
  titulo: string;
  icon: LucideIcon;
  /** Dica sobre como esse hábito vira essência de verdade na API (quando existe endpoint). */
  dica?: string;
  missoes: Missao[];
}

/**
 * Diário sustentável: hábitos do dia, agrupados por tema. São check-ins locais
 * (salvos neste aparelho). A essência que vale no ranking vem das ações
 * registradas na API (reciclagem e transporte).
 */
export const gruposMissoes: GrupoMissoes[] = [
  {
    categoria: "reciclagem",
    titulo: "Reciclagem",
    icon: Recycle,
    dica: "Registre os quilos em “Registrar reciclagem” e ganhe +5 de essência por kg.",
    missoes: [
      { id: "m1", pergunta: "Você separou algum material reciclável hoje?" },
      { id: "m2", pergunta: "Você separou o lixo orgânico do reciclável?" },
      { id: "m3", pergunta: "Você reutilizou algum material antes de descartá-lo?" },
    ],
  },
  {
    categoria: "transporte",
    titulo: "Transporte",
    icon: Bus,
    dica: "Registre o trajeto em “Registrar deslocamento”: bicicleta +3 e demais meios +2 por km.",
    missoes: [
      { id: "m4", pergunta: "Você usou transporte público hoje?" },
      { id: "m5", pergunta: "Você caminhou ou pedalou em algum trajeto?" },
      { id: "m6", pergunta: "Você compartilhou uma carona hoje?" },
    ],
  },
  {
    categoria: "agua",
    titulo: "Água",
    icon: Droplet,
    missoes: [
      { id: "m7", pergunta: "Você fechou a torneira enquanto escovava os dentes?" },
      { id: "m8", pergunta: "Você tomou um banho mais curto hoje?" },
      { id: "m9", pergunta: "Você reaproveitou água em alguma atividade?" },
    ],
  },
  {
    categoria: "energia",
    titulo: "Energia",
    icon: Zap,
    missoes: [
      { id: "m10", pergunta: "Você apagou as luzes ao sair de um cômodo?" },
      { id: "m11", pergunta: "Você evitou deixar aparelhos em modo de espera?" },
      { id: "m12", pergunta: "Você aproveitou a luz natural durante o dia?" },
    ],
  },
  {
    categoria: "consumo",
    titulo: "Consumo",
    icon: ShoppingBag,
    missoes: [
      { id: "m13", pergunta: "Você evitou comprar algo de que não precisava?" },
      { id: "m14", pergunta: "Você levou uma sacola reutilizável às compras?" },
      { id: "m15", pergunta: "Você escolheu um produto com menos embalagem?" },
    ],
  },
];

export const totalMissoes = gruposMissoes.reduce((total, g) => total + g.missoes.length, 0);
