import * as canvasContainer from '../core/canvas-container'
import * as dispatch from '../messaging/dispatch'
import { getCurrent, call } from '../core/neovim'
import { getWindow } from '../core/windows'
import { debounce } from '../support/utils'

export interface CanvasUnderline {
  col: number,
  row: number,
  width: number,
  color: string,
}

const container = document.getElementById('canvas-container') as HTMLElement
const canvas = document.createElement('canvas')
const ui = canvas.getContext('2d', { alpha: true }) as CanvasRenderingContext2D

canvas.style.position = 'absolute'
ui.imageSmoothingEnabled = false
canvas.setAttribute('id', 'canvas-underlines')
container.appendChild(canvas)

const cache = {
  lines: [] as CanvasUnderline[]
}

export const resize = () => {
  const { height, width } = container.getBoundingClientRect()

  canvas.height = height * window.devicePixelRatio
  canvas.width = width * window.devicePixelRatio
  canvas.style.height = `${height}px`
  canvas.style.width = `${width}px`

  ui.scale(window.devicePixelRatio, window.devicePixelRatio)
}

const dontDrawResult = { color: '#000000', render: false, x: -1, y: -1, w: -1 }

const calculateDrawPositions = async ({ col, row, width, color }: CanvasUnderline) => {
  const win = getWindow(row, col)
  if (!win) return dontDrawResult
  const buffer = await getCurrent.buffer
  const topLine = await buffer.getVar('topline') - 1

  if (row < topLine) return dontDrawResult

  const relativeRow = row - topLine

  return {
    color,
    render: true,
    x: win.colToX(col),
    y: win.rowToY(relativeRow) + canvasContainer.cell.height - canvasContainer.cell.padding,
    w: win.cellsToPixelWidth(width),
  }
}

const draw = async (x: number, y: number, w: number, color: string) => {
  ui.beginPath()
  ui.strokeStyle = color
  ui.lineWidth = 1
  ui.moveTo(x, y)
  ui.lineTo(x + w, y)
  ui.stroke()
}

const render = async (lines: CanvasUnderline[]) => {
  if (!lines.length) return ui.clearRect(0, 0, canvas.width, canvas.height)

  const coordinates = await Promise.all(lines.map(calculateDrawPositions))
  const validCoordinates = coordinates.filter(c => c.render)

  ui.clearRect(0, 0, canvas.width, canvas.height)
  validCoordinates.forEach(c => draw(c.x, c.y, c.w, c.color))
}

export const addUnderlines = (lines: CanvasUnderline[]) => {
  cache.lines = lines
  render(lines)
}

// TODO: would it make sense to do a diff new vs cached before
// render? or would the diff take longer to compute than rerender?
const batchedRender = debounce(() => render(cache.lines), 27)

resize()
canvasContainer.on('resize', resize)
dispatch.sub('redraw', batchedRender)

const updateTopLine = async () => {
  const buffer = await getCurrent.buffer
  const topLine = await call.line('w0')
  buffer.setVar('topline', topLine)
}

const batchedUpdateLine = debounce(updateTopLine, 1)

dispatch.sub('redraw', batchedUpdateLine)
