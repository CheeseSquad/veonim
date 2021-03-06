import * as canvasContainer from '../core/canvas-container'
const featherIcons = require('react-feather')
import { pascalCase } from '../support/utils'
import { h } from '../ui/uikit2'

export interface IconParams {
  color?: string,
  size?: number | string,
  weight?: number,
}

export default (iconName: string, params = {} as IconParams) => {
  const name = pascalCase(iconName)
  const { color, weight = 2, size = canvasContainer.font.size + 2 } = params
  if (!Reflect.has(featherIcons, name)) throw new Error(`rendering: icon ${name} was not found`)
  const component = Reflect.get(featherIcons, name)
  return h(component, { color, size, strokeWidth: weight })
}
