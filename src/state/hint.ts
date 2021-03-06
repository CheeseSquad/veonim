import { on, initState } from '../state/trade-federation'
import { merge } from '../support/utils'

export interface Hint {
  label: string,
  labelStart: string,
  labelEnd: string,
  currentParam: string,
  documentation: string,
  paramDoc: string,
  anchorBottom: boolean,
  totalSignatures: number,
  selectedSignature: number,
  visible: boolean,
  row: number,
  col: number,
}

initState('hint', {
  label: '',
  labelStart: '',
  labelEnd: '',
  currentParam: '',
  documentation: '',
  paramDoc: '',
  anchorBottom: true,
  totalSignatures: 0,
  selectedSignature: 0,
  visible: false,
  row: 0,
  col: 0,
} as Hint)

interface ShowParams {
  row: number,
  col: number,
  label: string,
  currentParam: string,
  documentation?: string,
  paramDoc?: string,
  totalSignatures: number,
  selectedSignature: number,
}

export interface Actions {
  showHint: (params: ShowParams) => void,
  hideHint: () => void,
}

const sliceAndDiceLabel = (label: string, currentParam: string) => {
  const paramStart = label.indexOf(currentParam)
  const labelStart = label.slice(0, paramStart)
  const activeParam = label.slice(paramStart, paramStart + currentParam.length)
  const labelEnd = label.slice(paramStart + currentParam.length)
  return { labelStart, labelEnd, activeParam }
}

const fresh = ({ row, col, documentation, selectedSignature, totalSignatures }: any) => ({
  row,
  col,
  documentation,
  selectedSignature,
  totalSignatures,
})

on.showHint((s, {
  row,
  col,
  label,
  currentParam,
  documentation,
  paramDoc,
  selectedSignature,
  totalSignatures,
}) => {
  const { labelStart, labelEnd, activeParam } = sliceAndDiceLabel(label, currentParam)
  const same = s.hint.label === label && s.hint.row === row
  const stuff = same ? {} : fresh({ row, col, documentation, selectedSignature, totalSignatures })

  s.hint = {
    ...s.hint,
    ...stuff,
    label,
    labelStart,
    labelEnd,
    paramDoc,
    anchorBottom: row > 2,
    currentParam: activeParam,
    visible: true,
  }
})

on.hideHint(s => merge(s.hint, {
  visible: false,
  label: '',
  row: 0,
}))
