<script setup lang="ts">
import md from '~/data/regulations.md?raw'

const all = parseRegulations(md)

const theme = useCookie<'auto' | 'light' | 'dark'>('theme', { default: () => 'auto' })
const contrast = useCookie<boolean>('contrast', { default: () => false })
useHead({ htmlAttrs: { 'data-theme': theme, 'data-contrast': computed(() => (contrast.value ? '' : undefined)) } })

const query = ref('')
const block = ref<string | null>(null)

const sections = computed(() => {
  const q = query.value.trim().toLowerCase()
  return all
    .map((s) => ({
      ...s,
      items: s.items.filter(
        (i) => (!block.value || i.block === block.value) && (!q || i.text.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)),
      ),
    }))
    .filter((s) => s.items.length)
})
const count = computed(() => sections.value.reduce((n, s) => n + s.items.length, 0))

// режем текст по совпадениям для <mark>
function parts(text: string) {
  const q = query.value.trim()
  if (!q) return [{ t: text, hit: false }]
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.split(re).map((t, i) => ({ t, hit: i % 2 === 1 })).filter((p) => p.t)
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <nav class="sidebar__nav">
        <button class="sidebar__btn" :class="{ 'sidebar__btn--active': !block }" @click="block = null">Все</button>
        <button
          v-for="(key, name) in BLOCKS"
          :key="key"
          class="sidebar__btn"
          :class="[`sidebar__btn--${key}`, { 'sidebar__btn--active': block === name }]"
          @click="block = block === name ? null : name"
        >{{ name }}</button>
      </nav>
    </aside>

    <main class="page">
      <header class="page__head">
        <div class="theme">
          <button class="theme__btn" :class="{ 'theme__btn--active': theme === 'light' }" aria-label="Светлая тема" @click="theme = 'light'">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          </button>
          <button class="theme__btn" :class="{ 'theme__btn--active': theme === 'dark' }" aria-label="Тёмная тема" @click="theme = 'dark'">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          </button>
          <button class="theme__btn" :class="{ 'theme__btn--active': contrast }" :aria-pressed="contrast" aria-label="Высокая контрастность" @click="contrast = !contrast">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" /></svg>
          </button>
        </div>
        <h1 class="page__title">Регламент фотографа</h1>
        <p class="page__lead">Раздел 6 корпоративной книги</p>
        <input v-model="query" class="search" type="search" placeholder="Поиск: брак, телефон, стойка…" aria-label="Поиск по регламенту" />
        <p class="page__count">Найдено пунктов: {{ count }}</p>
      </header>

    <details v-for="s in sections" :key="s.id" class="card" :open="!!query || !!block || undefined">
      <summary class="card__head">
        <span class="card__id">{{ s.id }}</span>
        <span class="card__title">{{ s.title }}</span>
      </summary>
      <ul class="card__list">
        <li v-for="(i, n) in s.items" :key="n" class="rule" :class="`rule--${BLOCKS[i.block as keyof typeof BLOCKS]}`">
          <span class="rule__tag">{{ i.block }}</span>
          <span class="rule__text"><template v-for="(p, k) in parts(i.text)" :key="k"><mark v-if="p.hit" class="rule__mark">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template></span>
        </li>
      </ul>
    </details>

    <p v-if="!sections.length" class="page__empty">Ничего не найдено</p>
    </main>
  </div>
</template>
