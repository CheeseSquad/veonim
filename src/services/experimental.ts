import { go } from '../state/trade-federation'
import { action, cmd } from '../core/neovim'
import { delay } from '../support/utils'

action('buffer-search', go.showBufferSearch)

action('derp', async () => {
  cmd('cd $pr/veonim')
  cmd('e src/bootstrap/main.ts')
  cmd('topleft vnew')
  await delay(250)
  cmd('vert resize 30')
  cmd('b Explorer')
})
