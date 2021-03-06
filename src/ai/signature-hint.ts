import { SignatureInformation } from 'vscode-languageserver-types'
import { action, current as vimState, on } from '../core/neovim'
import { signatureHelp, triggers } from '../langserv/adapter'
import { go } from '../state/trade-federation'
import { merge } from '../support/utils'
import { cursor } from '../core/cursor'

const cache = {
  signatures: [] as SignatureInformation[],
  selectedSignature: 0,
  totalParams: 0,
  currentParam: 0,
}

const shouldCloseSignatureHint = (totalParams: number, currentParam: number, triggers: string[], leftChar: string): boolean => {
  if (currentParam < totalParams - 1) return false

  const hasEasilyIdentifiableSymmetricalMatcherChar = triggers.some(t => ['(', '{', '['].includes(t))
  if (!hasEasilyIdentifiableSymmetricalMatcherChar) return true

  return (leftChar === ')' && triggers.includes('('))
    || (leftChar === '}' && triggers.includes('{'))
    || (leftChar === ']' && triggers.includes('['))
}

const cursorPos = () => ({ row: cursor.row, col: cursor.col })

const showSignature = (signatures: SignatureInformation[], which?: number | null, param?: number | null) => {
  const { label = '', documentation = '', parameters = [] } = signatures[which || 0]
  const activeParameter = param || 0

  const baseOpts = { ...cursorPos(), totalSignatures: signatures.length }

  if (activeParameter < parameters.length) {
    const { label: currentParam = '', documentation: paramDoc } = parameters[activeParameter]
    cache.totalParams = parameters.length

    go.showHint({
      ...baseOpts,
      label,
      paramDoc,
      currentParam,
      documentation,
      selectedSignature: (which || 0) + 1,
    })
  }

  else {
    const nextSignatureIndex = signatures
      .slice()
      .filter(s => s.parameters && s.parameters.length)
      .sort((a, b) => a.parameters!.length - b.parameters!.length)
      .findIndex(s => s.parameters!.length > activeParameter)

    if (!~nextSignatureIndex) return go.hideHint()

    const { label = '', documentation = '', parameters = [] } = signatures[nextSignatureIndex]
    const { label: currentParam = '' } = parameters[activeParameter]
    merge(cache, { selectedSignature: nextSignatureIndex, totalParams: parameters.length })

    go.showHint({
      ...baseOpts,
      label,
      currentParam,
      documentation,
      selectedSignature: nextSignatureIndex + 1,
    })
  }
}

const getSignatureHint = async (lineContent: string) => {
  const triggerChars = triggers.signatureHelp(vimState.cwd, vimState.filetype)
  const leftChar = lineContent[Math.max(vimState.column - 2, 0)]

  // TODO: should probably also hide if we jumped to another line
  // how do we determine the difference between multiline signatures and exit signature?
  // would need to check if cursor is outside of func brackets doShit(    )   | <- cursor
  const closeSignatureHint = shouldCloseSignatureHint(cache.totalParams, cache.currentParam, triggerChars, leftChar)
  if (closeSignatureHint) return go.hideHint()

  if (!triggerChars.includes(leftChar)) return

  const hint = await signatureHelp(vimState)
  if (!hint) return

  const { activeParameter, activeSignature, signatures = [] } = hint
  if (!signatures.length) return

  merge(cache, { signatures, currentParam: activeParameter, selectedSignature: 0 })
  showSignature(signatures, activeSignature, activeParameter)
}

on.cursorMove(go.hideHint)
on.insertEnter(go.hideHint)
on.insertLeave(go.hideHint)

action('signature-help-next', () => {
  const next = cache.selectedSignature + 1
  cache.selectedSignature = next >= cache.signatures.length ? 0 : next
  cache.currentParam = 0

  showSignature(cache.signatures, cache.selectedSignature)
})

action('signature-help-prev', () => {
  const next = cache.selectedSignature - 1
  cache.selectedSignature = next < 0 ? cache.signatures.length - 1 : next
  cache.currentParam = 0

  showSignature(cache.signatures, cache.selectedSignature)
})

export { getSignatureHint }
