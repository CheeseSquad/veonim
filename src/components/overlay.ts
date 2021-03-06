import { h } from '../ui/uikit'

interface Props {
  name: string,
  visible: boolean,
  x: number,
  y: number,
  maxWidth?: number,
  anchorAbove: boolean,
  zIndex?: number,
}

export default ($: Props, content: any[]) => h('div', {
  id: $.name,
  style: {
    zIndex: $.zIndex,
    display: $.visible ? 'flex' : 'none',
    height: '100%',
    width: '100%',
    flexFlow: $.anchorAbove ? 'column-reverse' : 'column',
    position: 'absolute',
  }
}, [

  ,h('.spacer', {
    style: {
      height: $.anchorAbove ? `calc(100% - ${$.y}px)` : `${$.y}px`,
    }
  })

  ,h('div', {
    style: {
      display: 'flex',
      flexFlow: 'row nowrap',
    }
  }, [

    ,h('.col', {
      style: {
        width: `${$.x}px`,
      }
    })

    ,h('div', {
      style: {
        flexShrink: '0',
        maxWidth: $.maxWidth && `${$.maxWidth}px`,
      }
    }, content)

  ])
])
