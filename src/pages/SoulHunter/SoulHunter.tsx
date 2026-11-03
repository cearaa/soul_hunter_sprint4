import { Gamepad2, MessageSquareHeart, ScanLine, Trophy, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import qrCodeBeta from "../../assets/img/qrcode/qrcode-beta.svg";
import CardFantasma from "../../components/CardFantasma/CardFantasma";
import GhostField from "../../components/Ghost/GhostField";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ROTAS } from "../../routes/paths";

/** Endereço da BETA. É a MESMA URL usada para gerar o qrcode-beta.svg. */
export const JOGO_BETA_URL = "https://soul-hunter-mvp.vercel.app";
const FANTASMA_EXEMPLO_URL = "https://i.ibb.co/0jzBdZgH/Captura-de-tela-2026-09-13-182316.png";

const passos = [
  {
    icon: ScanLine,
    titulo: "1. Escaneie o QR Code",
    texto: "Aponte a câmera do celular para o código ao lado e abra o jogo.",
  },
  {
    icon: UserPlus,
    titulo: "2. Cadastre-se",
    texto: "Crie seu caçador (a mesma conta vale aqui no site) e comece a caçada.",
  },
  {
    icon: Trophy,
    titulo: "3. Suba no ranking",
    texto: "Capture almas, registre hábitos sustentáveis e dispute o topo do Hall da fama.",
  },
] as const;

export default function SoulHunter() {
  useDocumentTitle("Jogar");

  return (
    <section className="relative overflow-hidden py-10 md:py-12">
      <GhostField
        ghosts={[
          { top: "6%", left: "5%", size: 55, color: "#8b5cf6", opacity: 0.3, variant: 2 },
          { bottom: "8%", right: "6%", size: 60, color: "#22d3ee", opacity: 0.3, variant: 1 },
        ]}
      />
      <div className="relative mx-auto w-[92%] max-w-5xl text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-soul-violet/40 bg-soul-violet/10 px-4 py-1 text-sm font-semibold text-soul-violet-soft">
          <Gamepad2 className="h-4 w-4" aria-hidden="true" />
          Versão BETA
        </span>
        <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl xl:text-5xl">Vamos jogar!</h2>
        <p className="mx-auto mb-10 max-w-2xl text-sm text-white/75 sm:text-base">
          Escaneie o QR Code, cadastre-se e divirta-se com o SoulHunter na versão BETA.
        </p>

        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[auto_1fr] md:gap-10 md:text-left">
          <div className="glass-card mx-auto flex w-56 flex-col items-center gap-3 p-4 sm:w-60">
            <img
              src={qrCodeBeta}
              alt={`QR Code para abrir a versão BETA do SoulHunter em ${JOGO_BETA_URL}`}
              width={192}
              height={192}
              className="h-44 w-44 rounded-xl bg-white p-2 sm:h-48 sm:w-48"
            />
            <p className="text-xs text-white/60">Aponte a câmera para jogar</p>
          </div>

          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
            {passos.map((passo) => (
              <li key={passo.titulo} className="glass-card p-4 text-center md:text-left xl:text-center">
                <passo.icon
                  className="mx-auto mb-2 h-6 w-6 text-soul-cyan md:mx-0 xl:mx-auto"
                  aria-hidden="true"
                />
                <h3 className="mb-1 font-semibold text-white">{passo.titulo}</h3>
                <p className="text-sm text-white/70">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-xl border border-soul-gold/40 bg-soul-gold/10 p-4 text-left text-sm text-soul-gold">
          <MessageSquareHeart className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            <strong>Aviso:</strong> o jogo está em fase BETA e ainda tem bugs e funções a melhorar.
            Queremos o seu feedback! Conte o que achou pela página de{" "}
            <Link to={ROTAS.contato} className="underline">
              Contato
            </Link>{" "}
            e fique de olho nas próximas atualizações.
          </p>
        </div>

        <h3 className="mb-4 mt-12 text-xl font-bold text-white sm:text-2xl">Almas já encontradas</h3>
        <div className="flex justify-center">
          <CardFantasma
            imagem={FANTASMA_EXEMPLO_URL}
            alt="Captura de tela do fantasma Senhor Cartola dentro do jogo"
            nome="Senhor Cartola"
          />
        </div>
      </div>
    </section>
  );
}