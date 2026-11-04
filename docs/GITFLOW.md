# 🌿 GitFlow do SoulHunter

Guia de versionamento usado pela equipe na Sprint 4.

## Branches

| Branch | Para que serve | Quem faz merge |
|---|---|---|
| `main` | Versão estável, publicada na Vercel. Só recebe código revisado. | Pull Request aprovado |
| `develop` | Integração das funcionalidades antes de irem para a `main`. | Pull Request de `feature/*` ou `fix/*` |
| `feature/<descricao>` | Uma funcionalidade nova (ex.: `feature/ranking`). | Autor abre PR para `develop` |
| `fix/<descricao>` | Correção de bug (ex.: `fix/foto-readme`). | Autor abre PR para `develop` |
| `hotfix/<descricao>` | Correção urgente direto da `main` em produção. | PR para `main` e depois para `develop` |

## Fluxo de trabalho

```bash
# 1. Atualize a develop
git switch develop
git pull origin develop

# 2. Crie a branch da tarefa
git switch -c feature/minha-tarefa

# 3. Faça commits pequenos e frequentes
git add .
git commit -m "feat: descrição curta do que mudou"

# 4. Envie e abra um Pull Request para a develop
git push -u origin feature/minha-tarefa
```

Antes de abrir o PR, rode `npm run build` e `npm run lint`: os dois precisam passar sem erros.

Quando a `develop` estiver estável, abrimos um PR `develop` → `main`, e a Vercel publica a nova versão.

## Padrão de mensagens (Conventional Commits)

| Prefixo | Uso |
|---|---|
| `feat:` | nova funcionalidade |
| `fix:` | correção de bug |
| `refactor:` | mudança de código sem alterar comportamento |
| `perf:` | melhoria de desempenho |
| `docs:` | documentação (README, guias) |
| `chore:` | configuração, dependências, scripts |

Exemplo: `feat: cadastro de caçador com POST /usuarios`.

## Regras da equipe

- Nada de commit direto na `main`.
- Cada integrante faz **no mínimo 5 commits** com o próprio usuário do GitHub (o total do projeto precisa passar de 15).
- Configure o Git com o mesmo e-mail da conta do GitHub, senão os commits não aparecem no seu perfil:

  ```bash
  git config user.name "Seu Nome"
  git config user.email "email-da-sua-conta@github.com"
  ```

- Nunca envie `node_modules`, `dist` ou `.env` (já estão no `.gitignore`).
