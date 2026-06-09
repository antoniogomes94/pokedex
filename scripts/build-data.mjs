/**
 * Pipeline de dados da Pokédex.
 *
 * Baixa da PokéAPI todas as espécies, formas (megas, gmax, regionais...),
 * cadeias evolutivas, tipos, golpes e jogos, e gera JSONs estáticos em
 * public/data/ para o app consumir sem depender da API em runtime.
 *
 * Respostas brutas ficam cacheadas em scripts/.cache/ — rodadas seguintes
 * não refazem requests já feitos.
 *
 * Uso: node scripts/build-data.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE_DIR = path.join(ROOT, 'scripts', '.cache')
const OUT_DIR = path.join(ROOT, 'public', 'data')
const API = 'https://pokeapi.co/api/v2'
const CONCURRENCY = 12

let fetched = 0
let cached = 0

async function tryFetch(url, attempts) {
  let lastErr
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`)
      return await res.json()
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, attempt * attempt * 500))
    }
  }
  throw lastErr
}

async function fetchJson(url) {
  const key = createHash('sha1').update(url).digest('hex') + '.json'
  const cacheFile = path.join(CACHE_DIR, key)
  try {
    const raw = await readFile(cacheFile, 'utf8')
    cached++
    return JSON.parse(raw)
  } catch {
    /* cache miss */
  }
  let data
  try {
    data = await tryFetch(url, 4)
  } catch (err) {
    // A PokéAPI às vezes devolve 502 permanente para recursos específicos
    // (ex.: evolution-chain/133); o dump oficial api-data no GitHub cobre isso.
    const m = url.match(/^https:\/\/pokeapi\.co\/api\/v2\/([^?]+?)\/?$/)
    if (!m) throw err
    console.warn(`  usando mirror api-data para ${url}`)
    data = await tryFetch(
      `https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2/${m[1]}/index.json`,
      3
    )
  }
  await writeFile(cacheFile, JSON.stringify(data))
  fetched++
  if (fetched % 200 === 0) console.log(`  ... ${fetched} requests feitos (${cached} do cache)`)
  return data
}

async function pMap(items, fn, concurrency = CONCURRENCY) {
  const results = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

const idFromUrl = (url) => Number(url.replace(/\/+$/, '').split('/').pop())

/**
 * A PokéAPI não tem descrições em pt-BR, então traduzimos o texto exibido
 * no build (endpoint público do Google Translate, com o mesmo cache em disco).
 * Falha de tradução não derruba o build — cai para o inglês no app.
 */
async function translatePt(text) {
  if (!text) return null
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=' +
    encodeURIComponent(text)
  try {
    const data = await fetchJson(url)
    const out = data[0].map((seg) => seg[0]).join('')
    return out.trim() || null
  } catch {
    return null
  }
}

function formType(pokemonName, isDefault) {
  if (pokemonName.includes('-totem')) return 'other'
  if (pokemonName.includes('-mega')) return 'mega'
  if (pokemonName.includes('-gmax')) return 'gmax'
  if (pokemonName.includes('-alola')) return 'alolan'
  if (pokemonName.includes('-galar')) return 'galarian'
  if (pokemonName.includes('-hisui')) return 'hisuian'
  if (pokemonName.includes('-paldea')) return 'paldean'
  return isDefault ? 'normal' : 'other'
}

const LEARN_METHODS = { 'level-up': 'lv', machine: 'tm', egg: 'egg', tutor: 'tutor' }

/** Constrói uma descrição PT-BR legível das condições de evolução. */
function evoCondition(d) {
  const parts = []
  if (d.trigger?.name === 'trade') parts.push('Troca')
  if (d.min_level != null) parts.push(`Nível ${d.min_level}`)
  if (d.item) parts.push(`Usar ${prettify(d.item.name)}`)
  if (d.held_item) parts.push(`Segurando ${prettify(d.held_item.name)}`)
  if (d.min_happiness != null) parts.push('Felicidade alta')
  if (d.min_affection != null) parts.push('Afeição alta')
  if (d.min_beauty != null) parts.push('Beleza alta')
  if (d.time_of_day) parts.push(d.time_of_day === 'day' ? 'De dia' : 'À noite')
  if (d.location) parts.push(`Em ${prettify(d.location.name)}`)
  if (d.known_move) parts.push(`Sabendo ${prettify(d.known_move.name)}`)
  if (d.known_move_type) parts.push(`Sabendo golpe de tipo ${d.known_move_type.name}`)
  if (d.party_species) parts.push(`Com ${prettify(d.party_species.name)} na equipe`)
  if (d.party_type) parts.push(`Com Pokémon de tipo ${d.party_type.name} na equipe`)
  if (d.gender === 1) parts.push('Fêmea')
  if (d.gender === 2) parts.push('Macho')
  if (d.needs_overworld_rain) parts.push('Chovendo')
  if (d.turn_upside_down) parts.push('Console de cabeça para baixo')
  if (d.relative_physical_stats === 1) parts.push('Ataque > Defesa')
  if (d.relative_physical_stats === -1) parts.push('Ataque < Defesa')
  if (d.relative_physical_stats === 0) parts.push('Ataque = Defesa')
  if (d.trade_species) parts.push(`Trocado por ${prettify(d.trade_species.name)}`)
  if (d.trigger?.name === 'shed') parts.push('Espaço na equipe e Poké Ball extra')
  if (d.trigger?.name === 'spin') parts.push('Girar segurando doce')
  if (d.trigger?.name === 'three-critical-hits') parts.push('3 críticos em uma batalha')
  if (d.trigger?.name === 'take-damage') parts.push('Tomar dano e seguir adiante')
  if (d.trigger?.name === 'use-move') parts.push('Usar golpe específico 20 vezes')
  if (d.trigger?.name === 'recoil-damage') parts.push('Acumular dano de recuo')
  if (d.trigger?.name === 'agile-style-move') parts.push('Usar golpe no estilo ágil')
  if (d.trigger?.name === 'strong-style-move') parts.push('Usar golpe no estilo forte')
  if (d.trigger?.name === 'tower-of-darkness') parts.push('Torre da Escuridão')
  if (d.trigger?.name === 'tower-of-waters') parts.push('Torre das Águas')
  if (parts.length === 0 && d.trigger?.name === 'level-up') parts.push('Subir de nível')
  return parts.join(', ')
}

function prettify(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function buildEvoNode(chainLink) {
  return {
    species: chainLink.species.name,
    speciesId: idFromUrl(chainLink.species.url),
    evolvesTo: chainLink.evolves_to.map((next) => ({
      conditions: next.evolution_details.map(evoCondition).filter(Boolean),
      ...buildEvoNode(next),
    })),
  }
}

function pickSprites(sprites) {
  const art = sprites.other?.['official-artwork']
  const home = sprites.other?.home
  return {
    normal: art?.front_default ?? home?.front_default ?? sprites.front_default ?? null,
    shiny: art?.front_shiny ?? home?.front_shiny ?? sprites.front_shiny ?? null,
    icon: sprites.front_default ?? art?.front_default ?? null,
  }
}

async function main() {
  await mkdir(CACHE_DIR, { recursive: true })
  await mkdir(path.join(OUT_DIR, 'pokemon'), { recursive: true })

  console.log('1/7 Buscando lista de espécies...')
  const speciesList = await fetchJson(`${API}/pokemon-species?limit=2000`)
  console.log(`  ${speciesList.results.length} espécies`)

  console.log('2/7 Buscando espécies...')
  const species = await pMap(speciesList.results, (s) => fetchJson(s.url))

  console.log('3/7 Buscando pokémon (todas as formas)...')
  const varietyRefs = species.flatMap((sp) =>
    sp.varieties.map((v) => ({ url: v.pokemon.url, isDefault: v.is_default, species: sp }))
  )
  const pokemons = await pMap(varietyRefs, async (ref) => ({
    ...ref,
    data: await fetchJson(ref.url),
  }))
  console.log(`  ${pokemons.length} pokémon/formas`)

  console.log('4/7 Buscando cadeias evolutivas...')
  const chainUrls = [...new Set(species.map((sp) => sp.evolution_chain?.url).filter(Boolean))]
  const chains = await pMap(chainUrls, (url) => fetchJson(url))
  const chainBySpecies = new Map()
  for (const chain of chains) {
    const tree = buildEvoNode(chain.chain)
    const stack = [tree]
    while (stack.length) {
      const node = stack.pop()
      chainBySpecies.set(node.speciesId, tree)
      stack.push(...node.evolvesTo)
    }
  }

  console.log('5/7 Buscando tipos, gerações e jogos...')
  const typeList = await fetchJson(`${API}/type?limit=40`)
  const types = await pMap(
    typeList.results.filter((t) => !['unknown', 'shadow', 'stellar'].includes(t.name)),
    (t) => fetchJson(t.url)
  )
  const typesOut = {}
  for (const t of types) {
    typesOut[t.name] = {
      id: t.id,
      doubleFrom: t.damage_relations.double_damage_from.map((x) => x.name),
      halfFrom: t.damage_relations.half_damage_from.map((x) => x.name),
      noFrom: t.damage_relations.no_damage_from.map((x) => x.name),
      doubleTo: t.damage_relations.double_damage_to.map((x) => x.name),
      halfTo: t.damage_relations.half_damage_to.map((x) => x.name),
      noTo: t.damage_relations.no_damage_to.map((x) => x.name),
    }
  }

  const vgList = await fetchJson(`${API}/version-group?limit=50`)
  const versionGroups = await pMap(vgList.results, (vg) => fetchJson(vg.url))
  const gamesOut = {
    versionGroups: versionGroups
      .map((vg) => ({
        id: vg.id,
        name: vg.name,
        generation: idFromUrl(vg.generation.url),
        versions: vg.versions.map((v) => ({ id: idFromUrl(v.url), name: v.name })),
      }))
      .sort((a, b) => a.id - b.id),
  }

  console.log('6/7 Buscando golpes...')
  const moveUrls = [
    ...new Set(pokemons.flatMap((p) => p.data.moves.map((m) => m.move.url))),
  ]
  const moves = await pMap(moveUrls, (url) => fetchJson(url))
  const movesOut = {}
  for (const m of moves) {
    movesOut[m.id] = {
      name: m.name,
      type: m.type?.name ?? null,
      class: m.damage_class?.name ?? null,
      power: m.power,
      accuracy: m.accuracy,
      pp: m.pp,
    }
  }
  console.log(`  ${moves.length} golpes`)

  console.log('6½/7 Traduzindo descrições para pt-BR...')
  const ptBySpecies = new Map()
  await pMap(
    species,
    async (sp) => {
      const seen = new Set()
      const flavors = sp.flavor_text_entries
        .filter((f) => f.language.name === 'en')
        .map((f) => f.flavor_text.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim())
        .filter((t) => {
          if (seen.has(t)) return false
          seen.add(t)
          return true
        })
      const genus = sp.genera.find((g) => g.language.name === 'en')?.genus ?? null
      ptBySpecies.set(sp.id, {
        flavorPt: await translatePt(flavors[flavors.length - 1] ?? null),
        genusPt: await translatePt(genus),
      })
    },
    4
  )

  console.log('7/7 Gerando JSONs...')
  const index = []
  for (const { data: p, isDefault, species: sp } of pokemons) {
    const form = formType(p.name, isDefault)
    const sprites = pickSprites(p.sprites)
    const gen = idFromUrl(sp.generation.url)

    const moveList = p.moves.map((m) => ({
      id: idFromUrl(m.move.url),
      learn: m.version_group_details.map((d) => [
        idFromUrl(d.version_group.url),
        LEARN_METHODS[d.move_learn_method.name] ?? 'other',
        d.level_learned_at,
      ]),
    }))
    const gameVgs = [
      ...new Set(p.moves.flatMap((m) => m.version_group_details.map((d) => idFromUrl(d.version_group.url)))),
    ].sort((a, b) => a - b)
    const flavorSeen = new Set()
    const flavor = sp.flavor_text_entries
      .filter((f) => f.language.name === 'en')
      .map((f) => ({
        version: f.version.name,
        text: f.flavor_text.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim(),
      }))
      .filter((f) => {
        const key = f.text
        if (flavorSeen.has(key)) return false
        flavorSeen.add(key)
        return true
      })

    const detail = {
      id: p.id,
      name: p.name,
      speciesId: sp.id,
      dex: sp.id,
      form,
      generation: gen,
      types: p.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
      stats: Object.fromEntries(p.stats.map((s) => [s.stat.name, s.base_stat])),
      abilities: p.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
      height: p.height,
      weight: p.weight,
      baseExp: p.base_experience,
      sprites,
      cry: p.cries?.latest ?? p.cries?.legacy ?? null,
      genus: sp.genera.find((g) => g.language.name === 'en')?.genus ?? null,
      genusPt: ptBySpecies.get(sp.id)?.genusPt ?? null,
      flavor,
      flavorPt: ptBySpecies.get(sp.id)?.flavorPt ?? null,
      genderRate: sp.gender_rate,
      captureRate: sp.capture_rate,
      eggGroups: sp.egg_groups.map((e) => e.name),
      isLegendary: sp.is_legendary,
      isMythical: sp.is_mythical,
      evolution: chainBySpecies.get(sp.id) ?? null,
      varieties: sp.varieties.map((v) => {
        const vd = pokemons.find((pk) => pk.data.name === v.pokemon.name)
        return {
          id: idFromUrl(v.pokemon.url),
          name: v.pokemon.name,
          form: formType(v.pokemon.name, v.is_default),
          sprite: vd ? pickSprites(vd.data.sprites).normal : null,
        }
      }),
      games: gameVgs,
      moves: moveList,
    }
    await writeFile(path.join(OUT_DIR, 'pokemon', `${p.id}.json`), JSON.stringify(detail))

    index.push({
      id: p.id,
      dex: sp.id,
      name: p.name,
      types: detail.types,
      gen,
      form,
      sprite: sprites.normal,
      games: gameVgs,
      legendary: sp.is_legendary || sp.is_mythical,
    })
  }

  index.sort((a, b) => a.dex - b.dex || a.id - b.id)
  await writeFile(path.join(OUT_DIR, 'index.json'), JSON.stringify(index))
  await writeFile(path.join(OUT_DIR, 'types.json'), JSON.stringify(typesOut))
  await writeFile(path.join(OUT_DIR, 'games.json'), JSON.stringify(gamesOut))
  await writeFile(path.join(OUT_DIR, 'moves.json'), JSON.stringify(movesOut))

  console.log(`Pronto! ${index.length} entradas no índice. ${fetched} requests novos, ${cached} do cache.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
