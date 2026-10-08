export interface Item { block: string; text: string }
export interface Section { id: string; title: string; items: Item[] }

// Формат MD: "## 6.1 Заголовок" → "### Блок" → "- пункт"
export function parseRegulations(md: string): Section[] {
  const sections: Section[] = []
  let block = ''
  for (const line of md.split('\n')) {
    const h2 = line.match(/^## (\S+) (.+)/)
    if (h2) sections.push({ id: h2[1]!, title: h2[2]!, items: [] })
    else if (line.startsWith('### ')) block = line.slice(4).trim()
    else if (line.startsWith('- ')) sections.at(-1)?.items.push({ block, text: line.slice(2).trim() })
  }
  return sections
}

export const BLOCKS = {
  'Обязанности': 'duties',
  'Запрещено': 'forbidden',
  'Стандарты съёмки': 'standards',
  'Взаимодействие': 'interaction',
} as const
