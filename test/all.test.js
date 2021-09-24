/* eslint-disable node/no-unsupported-features/es-syntax */

import WebSocket from 'ws'
import { http } from '@awesomeorganization/servers'
import { strictEqual } from 'assert'
import { wsHandler } from '../main.js'

const MESSAGE = 'message'

const test = async () => {
  const { end, handle, push } = await wsHandler()
  http({
    listenOptions: {
      host: '127.0.0.1',
      port: 0,
    },
    onListening() {
      const { address, port } = this.address()
      const url = `ws://${address}:${port}`
      const webSocket = new WebSocket(url)
      webSocket.on('open', () => {
        push({
          message: MESSAGE,
        })
      })
      webSocket.once('message', (message) => {
        strictEqual(message.toString(), MESSAGE)
        end()
        this.close()
      })
    },
    onUpgrade(request, socket, head) {
      handle({
        head,
        request,
        socket,
      })
    },
  })
}

test()
