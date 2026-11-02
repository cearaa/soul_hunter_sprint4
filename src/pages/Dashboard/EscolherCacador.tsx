import { Target, UserCheck } from "lucide-react";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import CacadorForm from "../../components/CacadorForm/CacadorForm";
import EstadoView from "../../components/EstadoView/EstadoView";
import { useGame } from "../../context/useGame";
import { nuncaVazio, useApi } from "../../hooks/useApi";
import { ROTAS } from "../../routes/paths";
import { usuarioService } from "../../services/usuarioService";
import type { UsuarioPayload } from "../../types";

/** Tela inicial do Dashboard: quem vai caçar? Escolher um caçador existente ou cadastrar um novo. */
export default function EscolherCacador() {
  const { selecionarUsuario, mostrarToast } = useGame();
  const buscar = useCallback((signal: AbortSignal) => usuarioService.listar(signal), []);
  const { estado, recarregar } = useApi(buscar, nuncaVazio);

  // A API devolve codigo null no POST, então buscamos a lista de novo para achar o código real.
  async function aoCadastrar(dados: UsuarioPayload) {
    try {
      const lista = await usuarioService.listar();
      const novo = lista.find((u) => u.email.toLowerCase() === dados.email.toLowerCase());
      if (novo) {
        selecionarUsuario(novo.codigo);
        mostrarToast(`Bem-vindo(a), ${novo.nome}! A caçada começou.`);
        return;
      }
    } catch {
      // Se a releitura falhar, a lista abaixo é recarregada e o usuário escolhe manualmente.
    }
    recarregar();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-soul-cyan/40 bg-soul-cyan/10 px-4 py-1 text-sm font-semibold text-soul-cyan">
          <Target className="h-4 w-4" aria-hidden="true" />
          Central de missões
        </span>
        <h2 className="text-3xl font-bold text-white sm:text-4xl xl:text-5xl">Dashboard</h2>
        <p className="mt-3 text-white/70">
          Quem vai caçar hoje? Escolha um caçador já cadastrado ou crie o seu. Sua essência e seu
          título ficam salvos no banco de dados.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-5 sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-white">Entrar como...</h3>
          <EstadoView
            estado={estado}
            onTentarNovamente={recarregar}
            textoCarregando="Chamando os caçadores..."
          >
            {(usuarios) =>
              usuarios.length === 0 ? (
                <p className="text-sm text-white/70">
                  Ainda não há caçadores. Cadastre o primeiro ao lado!
                </p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {usuarios.map((usuario) => (
                    <li key={usuario.codigo}>
                      <button
                        type="button"
                        onClick={() => {
                          selecionarUsuario(usuario.codigo);
                          mostrarToast(`Agora você joga como ${usuario.nome}!`);
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:border-soul-cyan/50 hover:bg-white/10"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-white">{usuario.nome}</span>
                          <span className="block truncate text-xs text-white/50">
                            {usuario.titulo} · {usuario.essencia} essência
                          </span>
                        </span>
                        <UserCheck className="h-4 w-4 shrink-0 text-soul-cyan" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )
            }
          </EstadoView>
          <p className="mt-4 text-xs text-white/50">
            Para editar ou excluir caçadores, use a página{" "}
            <Link to={ROTAS.cacadores} className="text-soul-cyan underline">
              Caçadores
            </Link>
            .
          </p>
        </div>

        <div className="glass-card p-5 sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-white">Criar novo caçador</h3>
          <CacadorForm idPrefixo="dashboard" onSalvo={aoCadastrar} />
        </div>
      </div>
    </div>
  );
}
