# Pokédex

Pokédex completa em React + TypeScript, publicável no GitHub Pages, com dados da [PokéAPI](https://pokeapi.co).

## Funcionalidades

- **Todos os Pokémon** (1025 espécies, 1350 formas) em ordem da Pokédex Nacional, com artwork oficial
- **Formas regionais** (Alola, Galar, Hisui, Paldea), **megaevoluções**, **Gigantamax** e outras variações, com toggles para exibir cada grupo
- **Filtros** por geração, tipo e jogo; **ordenação** por número (↑↓), nome (A–Z / Z–A) e tipo; **busca** por nome ou número
- **Página de detalhes**: descrição, stats com barras, fraquezas/resistências calculadas, linha evolutiva com ramificações e condições, golpes por jogo e método de aprendizado, jogos em que aparece, todas as formas
- **Shiny**: botão para alternar entre a arte normal e shiny
- **Favoritos** com persistência local e filtro "só favoritos"
- **Sons (cries)** de cada Pokémon
- **Comparador** de dois Pokémon lado a lado
- **Montador de equipe** (até 6) com análise de cobertura defensiva
- **Tema claro/escuro** e **PWA** (instalável, funciona offline após visitar)

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm run build    # build de produção em dist/
npm run preview  # serve o build localmente
```

### Dados

Os dados ficam pré-processados em `public/data/` (commitados no repositório), então o site não depende da PokéAPI em runtime. Para regenerá-los (ex.: quando sair uma nova geração):

```bash
npm run data
```

O script usa cache em `scripts/.cache/` e tem fallback para o mirror oficial `PokeAPI/api-data` quando a API retorna erro. Os ícones do PWA são gerados por `node scripts/make-icons.mjs`.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub chamado **`pokedex`** (o `base: '/pokedex/'` do `vite.config.ts` assume esse nome — ajuste se usar outro).
2. Em **Settings → Pages**, defina **Source: GitHub Actions**.
3. Faça o push:

   ```bash
   git remote add origin git@github.com:SEU_USUARIO/pokedex.git
   git push -u origin main
   ```

O workflow `.github/workflows/deploy.yml` builda e publica automaticamente a cada push na `main`. O site fica em `https://SEU_USUARIO.github.io/pokedex/`.

## Créditos

Dados e imagens da [PokéAPI](https://pokeapi.co) e do repositório [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon é marca registrada da Nintendo / Game Freak / Creatures Inc.
