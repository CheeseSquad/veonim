import WorkerClient from '../messaging/worker-client'
import { filter as fuzzy } from 'fuzzaldrin-plus'
import { join } from 'path'

const { on } = WorkerClient()

const keywords = (() => {
  const m = new Map<string, string[]>()

  return {
    set: (cwd: string, file: string, words: string[]) => m.set(join(cwd, file), words),
    get: (cwd: string, file: string) => m.get(join(cwd, file)),
    add: (cwd: string, file: string, word: string) => {
      const e = m.get(join(cwd, file)) || []
      if (e.includes(word)) return
      m.set(join(cwd, file), (e.push(word), e))
    }
  }
})()

const harvest = (buffer: string[]) => {
  const keywords = new Set<string>()
  const totalol = buffer.length

  for (let ix = 0; ix < totalol; ix++) {
    const words = buffer[ix].match(/[A-Za-z]\w+/g) || []
    const wordsTotal = words.length

    for (let wix = 0; wix < wordsTotal; wix++) {
      const word = words[wix]
      if (word.length > 2) keywords.add(word)
    }
  }

  return [...keywords]
}

const filter = (cwd: string, file: string, query: string, maxResults = 20): string[] =>
  fuzzy(keywords.get(cwd, file) || [], query, { maxResults })

on.set((cwd: string, file: string, buffer: string[]) => keywords.set(cwd, file, harvest(buffer)))
on.add((cwd: string, file: string, word: string) => keywords.add(cwd, file, word))
on.query(async (cwd: string, file: string, query: string, max?: number) => await filter(cwd, file, query, max))
on.get(async (cwd: string, file: string) => await keywords.get(cwd, file))
