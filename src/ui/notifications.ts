import { h, app, style, Actions } from '../ui/uikit'
import { Plugin, colors } from '../styles/common'
import { merge, uuid } from '../support/utils'
import { sub } from '../messaging/dispatch'
import Icon from '../components/icon'

enum NotifyKind {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Success = 'success',
  System = 'system',
}

interface Notification {
  id: string,
  kind: NotifyKind,
  message: string,
}

interface State {
  notifications: Notification[],
}

const state: State = {
  notifications: [],
}

const container = document.getElementById('notifications') as HTMLElement

merge(container.style, { zIndex: 80 })

const notification = {
  display: 'flex',
  marginBottom: '6px',
  padding: '10px',
  background: 'rgb(20, 20, 20)',
}

const Notification = style('div')({
  ...notification,
  color: '#eee',
})

const Err = style('div')({
  ...notification,
  color: colors.error,
})

const Success = style('div')({
  ...notification,
  color: colors.success,
})

const Warn = style('div')({
  ...notification,
  color: colors.warning,
})

// TODO: dedup with other similar styles
const IconBox = style('div')({
  display: 'flex',
  paddingRight: '8px',
  alignItems: 'center',
})

const box = (StyleObject: Function, message: string, icon: string) => StyleObject({}, [
  ,IconBox({}, [ Icon(icon) ])
  ,h('span', message)
  // TODO: show count for multiple messages of the same type?
])

const view = ($: State) => Plugin.top('notifications', true, [

  ,h('div', $.notifications.map(({ kind, message }) => {

    if (kind === NotifyKind.Error) return box(Err, message, 'error')
    if (kind === NotifyKind.Warning) return box(Warn, message, 'warning')
    if (kind === NotifyKind.Success) return box(Success, message, 'check-circle')
    if (kind === NotifyKind.Info) return box(Notification, message, 'message-circle')
    if (kind === NotifyKind.System) return box(Notification, message, 'info')

  }))

], {
  position: 'absolute',
  background: 'none',
  marginTop: '5px',
})

const a: Actions<State> = {}

a.notify = (s, a, notification: Notification) => {
  const time = notification.kind === NotifyKind.Info ? 800 : 3e3
  setTimeout(() => a.expire(notification.id), time)
  return { notifications: [...s.notifications, notification] }
}

a.expire = (s, _a, id: string) =>
  ({ notifications: s.notifications.filter(m => m.id !== id) })

const ui = app({ state, view, actions: a }, false, container)

// TODO: too much code here...
sub('notification:error', message => ui.notify({
  id: uuid(),
  message,
  kind: NotifyKind.Error
} as Notification))

sub('notification:warning', message => ui.notify({
  id: uuid(),
  message,
  kind: NotifyKind.Warning
} as Notification))

sub('notification:success', message => ui.notify({
  id: uuid(),
  message,
  kind: NotifyKind.Success
} as Notification))

sub('notification:info', message => ui.notify({
  id: uuid(),
  message,
  kind: NotifyKind.Info
} as Notification))

sub('notification:system', message => ui.notify({
  id: uuid(),
  message,
  kind: NotifyKind.System
} as Notification))
