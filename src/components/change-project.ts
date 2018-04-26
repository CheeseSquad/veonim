import { getDirFiles, exists, pathRelativeToHome, simplifyPath, absolutePath } from '../support/utils'
import { RowNormal, RowImportant } from '../components/row-container'
import { action, current, cmd, onStateChange } from '../core/neovim'
import { createVim, renameCurrentToCwd } from '../core/sessions'
import { Plugin } from '../components/plugin-container'
import configReader from '../config/config-service'
import config from '../config/config-service'
import Input from '../components/text-input'
import { filter } from 'fuzzaldrin-plus'
import { h, app } from '../ui/uikit'
import { join, sep } from 'path'
import { homedir } from 'os'

const $HOME = homedir()

interface FileDir {
  name: string,
  file: boolean,
  dir: boolean,
}

const state = {
  value: '',
  cwd: '',
  path: '',
  paths: [] as FileDir[],
  cache: [] as FileDir[],
  visible: false,
  index: 0,
  create: false,
}

type S = typeof state

const absPath = (path = '') => path.startsWith('~') ? join($HOME, path.slice(1)) : path
const validPath = async (path = '') => {
  if (!path) return ''
  const fullpath = absPath(path)
  return await exists(fullpath) ? fullpath : ''
}

let ignored = config('explorer.ignore.dirs', m => ignored = m)
const filterDirs = (filedirs: FileDir[]) => filedirs.filter(f => f.dir && !ignored.includes(f.name))

let listElRef: HTMLElement

const resetState = { value: '', path: '', visible: false, index: 0 }

const actions = {
  select: () => (s: S) => {
    if (!s.paths.length) return resetState
    const { name } = s.paths[s.index]
    if (!name) return
    const dirpath = join(s.path, name)
    s.create ? createVim(name, dirpath) : cmd(`cd ${dirpath}`)
    return resetState
  },

  change: (value: string) => (s: S) => ({ value, paths: value
    ? filterDirs(filter(s.paths, value, { key: 'name' }))
    : s.cache
  }),

  tab: () => (s: S) => {
    if (!s.paths.length) return resetState
    const { name } = s.paths[s.index]
    if (!name) return
    const path = join(s.path, name)
    getDirFiles(path).then(paths => ui.show({ path, paths: filterDirs(paths) }))
  },

  jumpNext: () => (s: S) => {
    const { name, dir } = s.paths[s.index]
    if (!dir) return
    const path = join(s.path, name)
    getDirFiles(path).then(paths => ui.show({ path, paths: filterDirs(paths) }))
  },

  jumpPrev: () => (s: S) => {
    const next = s.path.split(sep)
    next.pop()
    const path = join(sep, ...next)
    getDirFiles(path).then(paths => ui.show({ path, paths: filterDirs(paths) }))
  },

  show: ({ paths, path, cwd, create }: any) => (s: S) => ({
    path, paths, create,
    cwd: cwd || s.cwd,
    index: 0,
    value: '',
    visible: true,
    cache: paths,
  }),

  // TODO: be more precise than this? also depends on scaled devices
  down: () => (s: S) => {
    listElRef.scrollTop += 300
    return { index: Math.min(s.index + 17, s.paths.length - 1) }
  },

  up: () => (s: S) => {
    listElRef.scrollTop -= 300
    return { index: Math.max(s.index - 17, 0) }
  },

  top: () => { listElRef.scrollTop = 0 },
  bottom: () => { listElRef.scrollTop = listElRef.scrollHeight },
  hide: () => resetState,
  next: () => (s: S) => ({ index: s.index + 1 >= s.paths.length ? 0 : s.index + 1 }),
  prev: () => (s: S) => ({ index: s.index - 1 < 0 ? s.paths.length - 1 : s.index - 1 }),
}

const view = ($: S, a: typeof actions) => Plugin($.visible, [

  ,Input({
    up: a.up,
    top: a.top,
    tab: a.tab,
    next: a.next,
    prev: a.prev,
    down: a.down,
    hide: a.hide,
    select: a.select,
    change: a.change,
    bottom: a.bottom,
    jumpNext: a.jumpNext,
    jumpPrev: a.jumpPrev,
    value: $.value,
    focus: true,
    icon: 'home',
    desc: $.create ? 'create new vim session with project' : 'change project',
  })

  ,h(RowImportant, [
    ,h('span', pathRelativeToHome($.path))
  ])

  ,h('div', {
    ref: (e: HTMLElement) => {
      if (e) listElRef = e
    },
    style: {
      maxHeight: '50vh',
      overflowY: 'hidden',
    }
  }, $.paths.map(({ name }, ix) => h(RowNormal, {
    key: name,
    active: ix === $.index,
  }, [
    ,h('span', name)
  ])))

])

const ui = app({ name: 'change-project', state, actions, view })

const go = async (userPath: string, create = false) => {
  const cwd = await validPath(userPath) || current.cwd
  const filedirs = await getDirFiles(cwd)
  const paths = filterDirs(filedirs)
  ui.show({ paths, cwd, path: cwd, create })
}

action('change-dir', (path = '') => go(path, false))
action('vim-create-dir', (path = '') => go(path, true))

onStateChange.cwd((cwd: string) => configReader('project.root', (root: string) => {
  renameCurrentToCwd(simplifyPath(cwd, absolutePath(root)))
}))
