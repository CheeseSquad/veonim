import { h } from '../ui/uikit'

export default ({ size = 24, color = 'currentColor', weight = 2 }) => h('svg', {
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': weight + '',
}, [
h('circle', {
    cx: '11',
    cy: '11',
    r: '8',
}),
h('line', {
    x1: '21',
    y1: '21',
    x2: '16.65',
    y2: '16.65',
}),
h('line', {
    x1: '11',
    y1: '8',
    x2: '11',
    y2: '14',
}),
h('line', {
    x1: '8',
    y1: '11',
    x2: '14',
    y2: '11',
})
])