/* eslint-disable node/no-unsupported-features/es-syntax */

import WebSocket from 'ws'
import { http } from '@awesomeorganization/servers'
import { strictEqual } from 'assert'
import { wsHandler } from '../main.js'

const test = async () => {
  const pushQueue = [
    {
      data: 'message',
    },
    {
      data: 'message',
      stringify: true,
    },
  ]
  const chunksQueue = ['message', '"message"']
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
        push(pushQueue.shift())
      })
      webSocket.on('message', (message) => {
        strictEqual(message, chunksQueue.shift())
        if (chunksQueue.length === 0) {
          end()
          webSocket.close(1e3)
          this.close()
        }
        if (pushQueue.length !== 0) {
          push(pushQueue.shift())
        }
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
