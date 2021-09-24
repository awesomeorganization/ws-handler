/* eslint-disable node/no-unsupported-features/es-syntax */

const STATUS_NO_CONTENT = 204

export const wsHandler = async () => {
  const { WebSocket, WebSocketServer } = await import('ws')
  let clientId = 0
  const clients = new Map()
  const server = new WebSocketServer({
    clientTracking: false,
    noServer: true,
  })
  const end = () => {
    for (const client of clients.values()) {
      if (client.readyState !== WebSocket.OPEN) {
        continue
      }
      client.terminate()
    }
    server.close()
  }
  const handle = ({ head, request, socket }) => {
    if (request.aborted === true) {
      return undefined
    }
    return new Promise((resolve) => {
      server.handleUpgrade(request, socket, head, (webSocket) => {
        if (clientId === Number.MAX_SAFE_INTEGER) {
          clientId = 1
        } else {
          clientId++
        }
        clients.set(clientId, webSocket)
        request.once('close', () => {
          clients.delete(clientId)
        })
        resolve({
          clientId,
          webSocket,
        })
      })
    })
  }
  const push = ({ message, options }) => {
    for (const client of clients.values()) {
      if (client.readyState !== WebSocket.OPEN) {
        continue
      }
      client.send(message, options)
    }
    return undefined
  }
  return {
    clients,
    end,
    handle,
    push,
  }
}
