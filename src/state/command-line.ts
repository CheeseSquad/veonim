import { CommandUpdate, CommandType } from '../core/render'
import { on, initState } from '../state/trade-federation'
import { merge, is } from '../support/utils'

export interface CommandLine {
  options: string[],
  visible: boolean,
  value: string,
  ix: number,
  position: number,
  kind: CommandType,
}

initState('commandLine', {
  options: [],
  visible: false,
  value: '',
  ix: 0,
  position: 0,
  kind: CommandType.Ex,
} as CommandLine)

export interface Actions {
  updateCommandLine: (params: CommandUpdate) => void,
  showCommandLine: () => void,
  hideCommandLine: () => void,
  updateWildmenu: (options: string[]) => void,
  selectWildmenu: (index: number) => void,
}

on.updateCommandLine((s, { cmd, kind, position }: CommandUpdate) => {
  merge(s.commandLine, {
    kind,
    position,
    visible: true,
    value: is.string(cmd) && s.commandLine.value !== cmd
      ? cmd
      : s.commandLine.value,
  })

  if (!cmd) s.commandLine.options = []
})

on.showCommandLine(s => s.commandLine.visible = true)
on.hideCommandLine(s => s.commandLine.visible = false)

on.updateWildmenu((s, options) => s.commandLine.options = [...new Set(options)] as string[])
on.selectWildmenu((s, ix) => s.commandLine.ix = ix)
