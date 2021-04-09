;(function () {
  'use strict'

  const [textarea] = document.querySelectorAll('textarea')

  const ws = new WebSocket(`ws://${location.host}/ws`)

  ws.addEventListener('message', ({ data }) => {
    textarea.append(data + '\n')
  })
})()
