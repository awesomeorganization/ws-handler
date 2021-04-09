/* eslint-disable node/no-unsupported-features/es-syntax */

import { http } from '@awesomeorganization/servers'
import { rewriteHandler } from '@awesomeorganization/rewrite-handler'
import { staticHandler } from '@awesomeorganization/static-handler'
import { wsHandler } from '@awesomeorganization/ws-handler'

const example = async () => {
  const rewriteMiddleware = rewriteHandler({
    rules: [
      {
        pattern: '(.*)/$',
        replacement: '$1/index.html',
      },
    ],
  })
  const staticMiddleware = await staticHandler({
    directoryPath: './static',
  })
  const wsMidleware = await wsHandler()
  http({
    listenOptions: {
      host: '127.0.0.1',
      port: 3000,
    },
    onListening() {
      setInterval(() => {
        const timestamp = new Date().toISOString()
        wsMidleware.push({
          data: `${timestamp}: Hi!`,
        })
      }, 3e3)
    },
    onRequest(request, response) {
      switch (request.method) {
        case 'GET': {
          switch (request.url) {
            case '/ws': {
              break
            }
            default: {
              rewriteMiddleware.handle({
                request,
                response,
              })
              if (response.writableEnded === true) {
                return
              }
              staticMiddleware.handle({
                request,
                response,
              })
              return
            }
          }
        }
      }
      response.end()
    },
    onUpgrade(request, socket, head) {
      wsMidleware.handle({
        head,
        request,
        socket,
      })
    },
  })
  // TRY
  // http://127.0.0.1:3000/
}

example()
