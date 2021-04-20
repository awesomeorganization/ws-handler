# ws-handler

:boom: [ESM] The WebSocket (ws) handler for Node.js according to rfc6455, draft-ietf-hybi-thewebsocketprotocol-08 and draft-ietf-hybi-thewebsocketprotocol-13

---

![npm](https://img.shields.io/david/awesomeorganization/ws-handler)
![npm](https://img.shields.io/npm/v/@awesomeorganization/ws-handler)
![npm](https://img.shields.io/npm/dt/@awesomeorganization/ws-handler)
![npm](https://img.shields.io/npm/l/@awesomeorganization/ws-handler)
![npm](https://img.shields.io/bundlephobia/minzip/@awesomeorganization/ws-handler)
![npm](https://img.shields.io/bundlephobia/min/@awesomeorganization/ws-handler)

---

## Example

Full example in `/example` folder.

```
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
          rewriteMiddleware.handle({
            request,
            response,
          })
          staticMiddleware.handle({
            request,
            response,
          })
          return
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
```
