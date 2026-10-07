<template>
  <div class="KT-address-search">
    <label for="address-search">
      <p class="KT-address-search-el">Søg koordinat via adresse eller stednavn</p>
    </label>
    <div class="KT-address-search-field KT-address-search-el">
      <input
        id="address-search"
        v-model="query"
        type="search"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        aria-controls="address-search-results"
        :aria-expanded="results.length > 0"
        :aria-activedescendant="active >= 0 ? `address-search-result-${active}` : undefined"
        @input="search"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="choose(results[Math.max(active, 0)])"
        @keydown.esc="results = []"
        @blur="results = []"
      >
      <ul
        v-show="results.length"
        id="address-search-results"
        role="listbox"
        class="KT-address-search-results"
      >
        <li
          v-for="(match, i) in results"
          :id="`address-search-result-${i}`"
          :key="i"
          role="option"
          :aria-selected="i === active"
          @mousedown.prevent="choose(match)"
        >
          {{ match.result }}
          <span
            v-if="match.city"
            class="KT-address-search-city"
          >{{ match.city }}</span>
          <span class="KT-address-search-kind">{{ kind(match) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authFetch } from '../../../auth.js'
import { config } from '../../../runtimeConfig.js'

const emit = defineEmits(['select'])

const query = ref('')
const results = ref([])
const active = ref(-1)
let timer
let controller

const cities = new Map()
const kinds = { unit: 'adresse', entrance: 'adresse', street: 'vej', postcode: 'postnummer', city: 'by' }
const kind = (match) => {
  const [ref] = Object.keys(match.refs)
  return kinds[ref] ?? ref
}

const bifrost = async (endpoint, body, signal) => {
  const response = await authFetch(`${config.bifrostUrl}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!response.ok) throw new Error(`[AddressSearch] bifrost /${endpoint}: ${response.status}`)
  return response.json()
}

// streets only carry postcodes; look up the uncached city names in one batch
async function addCities(matches, signal) {
  const missing = [...new Set(matches.flatMap((match) => match.postcodes ?? []))].filter((code) => !cities.has(code))
  if (missing.length) {
    const found = await bifrost('search', missing.map((input) => ({ input, target: 'postcode', limit: 1 })), signal)
    for (const { input, matches } of found) {
      if (matches?.[0]) cities.set(input, matches[0].components.city)
    }
  }
  for (const match of matches) {
    match.city = match.postcodes?.map((code) => cities.get(code)).filter(Boolean).join(', ')
  }
}

function search() {
  clearTimeout(timer)
  controller?.abort()
  const input = query.value.trim()
  if (input.length < 2) {
    results.value = []
    return
  }
  timer = setTimeout(async () => {
    controller = new AbortController()
    const { signal } = controller
    try {
      // place names only exist in /search, not in /resolve
      const [addresses, places] = await Promise.all([
        bifrost('resolve', { input, limit: 5 }, signal),
        bifrost('search', { input, target: 'stednavn', limit: 3 }, signal),
      ])
      await addCities(addresses.matches, signal)
      results.value = [...addresses.matches, ...places.matches]
      active.value = -1
    } catch (error) {
      if (error.name !== 'AbortError') console.error(error)
    }
  }, 250)
}

function move(step) {
  active.value = Math.min(Math.max(active.value + step, 0), results.value.length - 1)
  document.getElementById(`address-search-result-${active.value}`)?.scrollIntoView({ block: 'nearest' })
}

function choose(match) {
  if (!match) return
  query.value = match.result
  results.value = []
  const [x, y] = match.point.coordinates
  emit('select', { v1: x, v2: y, v3: 0, v4: 0 })
}
</script>
