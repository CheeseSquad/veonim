import { RowNormal } from '../components/row-container'
import { activeWindow } from '../core/windows'
import { action, call } from '../core/neovim'
import Input from '../components/text-input'
import Overlay from '../components/overlay'
import { filter } from 'fuzzaldrin-plus'
import * as Icon from 'hyperapp-feather'
import { cursor } from '../core/cursor'
import { h, app } from '../ui/uikit'

const state = {
  id: 0,
  visible: false,
  value: '',
  items: [] as string[],
  cache: [] as string[],
  desc: '',
  index: 0,
  x: 0,
  y: 0,
}

type S = typeof state

const actions = {
  select: () => (s: S) => {
    if (!s.items.length) return { value: '', visible: false, index: 0 }
    const item = s.items[s.index]
    if (item) call.VeonimCallback(s.id, item)
    return { value: '', visible: false, index: 0 }
  },

  // TODO: not harcoded to 14
  change: (value: string) => (s: S) => ({ value, items: value
    ? filter(s.cache, value).slice(0, 14)
    : s.cache.slice(0, 14)
  }),

  show: ({ x, y, id, items, desc }: any) => ({ x, y, id, desc, items, cache: items, visible: true }),
  hide: () => ({ value: '', visible: false, index: 0 }),
  // TODO: not hardcoded to 14
  next: () => (s: S) => ({ index: s.index + 1 > Math.min(s.items.length - 1, 13) ? 0 : s.index + 1 }),
  prev: () => (s: S) => ({ index: s.index - 1 < 0 ? Math.min(s.items.length - 1, 13) : s.index - 1 }),
}

const view = ($: S, a: typeof actions) => Overlay({
  x: $.x,
  y: $.y,
  zIndex: 100,
  maxWidth: 600,
  visible: $.visible,
  anchorAbove: false,
}, [

  ,h('div', {
    style: {
      background: 'var(--background-40)',
    }
  }, [

    ,Input({
      hide: a.hide,
      next: a.next,
      prev: a.prev,
      change: a.change,
      select: a.select,
      value: $.value,
      focus: true,
      small: true,
      icon: Icon.User,
      desc: $.desc,
    })

    ,h('div', $.items.map((item, ix) => h(RowNormal, {
      key: item,
      active: ix === $.index,
    }, [
      ,h('span', item)
    ])))

  ])

])

const ui = app({ name: 'user-overlay-menu', state, actions, view })

action('user-overlay-menu', (id: number, desc: string, items = []) => {
  if (!items.length) return
  const x = activeWindow() ? activeWindow()!.colToX(cursor.col) : 0
  // TODO: anchorBottom maybe?
  const y = activeWindow() ? activeWindow()!.rowToTransformY(cursor.row + 1) : 0
  ui.show({ x, y, id, items, desc })
})
