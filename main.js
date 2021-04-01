/* eslint-disable node/no-unsupported-features/es-syntax */

export const wsHandler = async () => {
  const ws = await import('ws')
  let clientId = 0
  const clients = new Map()
  const server = new ws.default.Server({
    clientTracking: false,
    noServer: true,
  })
  const end = () => {
    for (const [, client] of clients) {
      client.terminate()
    }
  }
  const handle = ({ head, request, socket }) => {
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
    } else {
      chunk = data.trim()
    }
    for (const [, client] of clients) {
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
