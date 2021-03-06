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
h('line', {
    x1: '22',
    y1: '12',
    x2: '2',
    y2: '12',
}),
h('path', {
    d: 'M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
}),
h('line', {
    x1: '6',
    y1: '16',
    x2: '6',
    y2: '16',
}),
h('line', {
    x1: '10',
    y1: '16',
    x2: '10',
    y2: '16',
})
])