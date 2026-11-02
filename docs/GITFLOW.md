# Guia de versionamento (GitFlow) — Sprint 4

Regras da entrega: repositório **público**, **mínimo de 5 commits por integrante** e **mínimo de 15 no total**, feitos pela conta de cada pessoa.

## 1. Estrutura de branches

| Branch | Função |
|---|---|
| `main` | versão estável, é o que vai para a Vercel |
| `develop` | integração das funcionalidades |
| `feature/<nome>` | uma funcionalidade por branch, aberta a partir de `develop` |

## 2. Comandos do dia a dia

```bash
git clone <URL_DO_REPOSITORIO> && cd soul_hunter_sprint4
git checkout develop
git checkout -b feature/minha-tarefa

# trabalhe e faça commits pequenos
git add <arquivos>
git commit -m "feat(servicos): cria camada de integração com a API"

git push -u origin feature/minha-tarefa
# abra um Pull Request para develop, peça revisão de alguém e faça o merge
```

Ao final da Sprint: Pull Request de `develop` para `main`.

## 3. Padrão de mensagens

`tipo(escopo): descrição curta no imperativo` — tipos: `feat`, `fix`, `style`, `refactor`, `docs`, `chore`.

## 4. Sugestão de divisão (cada pessoa commita a própria parte)

Cada linha é um commit possível. Façam commits pequenos e frequentes: 6 por pessoa dá folga sobre o mínimo de 5.

### Tárik — arquitetura, rotas e tipos
- `feat(tipos): cria interfaces e tipos da API (Usuario, Fantasma, Estado)`
- `feat(tipos): adiciona union e intersection types (UsuarioComRanking)`
- `feat(rotas): migra para createBrowserRouter com rotas tipadas`
- `feat(rotas): adiciona rota dinâmica /cacadores/:id`
- `feat(contexto): separa GameContext e guarda o caçador atual`
- `chore(env): adiciona VITE_API_URL e .env.example`

### Giovanni — Tailwind e responsividade
- `style(header): menu hambúrguer até xl e novos itens de navegação`
- `style(cacadores): grid responsivo sm/md/xl nos cards`
- `style(fantasmas): grid responsivo e cartões de raridade`
- `style(jogar): reescreve a página com breakpoints md/lg`
- `fix(layout): remove rolagem horizontal em 320 px`
- `style(dashboard): painéis em duas colunas a partir de lg`

### Italo — Dashboard e Ranking
- `feat(dashboard): tela de escolha do caçador`
- `feat(dashboard): registro de reciclagem via POST`
- `feat(dashboard): registro de deslocamento via POST`
- `feat(dashboard): barra de progresso de título e posição no ranking`
- `feat(ranking): ranking a partir do GET /usuarios com medalhas`
- `feat(dashboard): diário sustentável com check-ins diários`

### Fabrício — formulários e validações
- `feat(formularios): CacadorForm com React Hook Form (POST/PUT)`
- `feat(formularios): FantasmaForm com validação de campos`
- `feat(cacadores): confirmação antes de excluir e mensagens da API`
- `feat(fantasmas): edição e exclusão de fantasmas`
- `fix(formularios): trata erros 400 retornados em texto pela API`
- `refactor(formularios): centraliza estilos em theme/formStyles`

### Carlos — serviços, estados de tela e documentação
- `feat(servicos): cria api.ts com fetch, ApiError e fila de requisições`
- `feat(servicos): usuarioService e fantasmaService`
- `feat(hooks): useApi com estados carregando/erro/vazio/ok`
- `feat(componentes): EstadoView, AvisoBanner e PageIntro`
- `chore(deploy): adiciona vercel.json`
- `docs(readme): atualiza README da Sprint 4 com links e capturas`

## 5. Antes de entregar

- [ ] Todos os integrantes têm 5+ commits visíveis em *Insights → Contributors*
- [ ] Total de 15+ commits
- [ ] Repositório **público**
- [ ] `main` atualizada e sem `node_modules` versionado
- [ ] Links de GitHub, Vercel, YouTube e API preenchidos no README
