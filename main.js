/* eslint-disable node/no-unsupported-features/es-syntax */

const STATUS_NO_CONTENT = 204

export const wsHandler = async () => {
  const ws = await import('ws')
  let clientId = 0
  const clients = new Map()
  const server = new ws.default.Server({
    clientTracking: false,
    noServer: true,
  })
  const end = () => {
    for (const client of clients.values()) {
      if (client.readyState !== ws.default.OPEN) {
        continue
      }
      client.close(1e3)
    }
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
  const push = ({ data, stringify = false }) => {
    let chunk
    if (stringify === true) {
      try {
        chunk = JSON.stringify(data)
      } catch (error) {
        chunk = error
      }
      if (chunk instanceof Error) {
        return chunk // I THINK IT'S A GOOD IDEA TO HANDLE THE ERROR ON THE OTHER SIDE
      }
    } else if (typeof data === 'string') {
      chunk = data.trim()
    } else {
      chunk = data
    }
    for (const client of clients.values()) {
      if (client.readyState !== ws.default.OPEN) {
        continue
      }
      client.send(chunk)
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
