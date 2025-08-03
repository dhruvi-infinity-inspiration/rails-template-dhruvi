// Entry point for the build script in your package.json
// 🔁 Hot reload script (works even with IIFE format)
;(() =>
  (new EventSource('http://localhost:8082').onmessage = () =>
    location.reload()))()
// ✅ Turbo (must be first!)
import '@hotwired/turbo-rails'

import './controllers'

import consumer from './channels/consumer'
import CableReady from 'cable_ready'
window.CableReady = CableReady

import mrujs from 'mrujs'
window.Mrujs = mrujs

window.Mrujs.start({
  plugins: [new CableCar(CableReady)],
})
import { CableCar } from 'mrujs/plugins'

mrujs.start({
  plugins: [new CableCar(CableReady)],
})

import 'trix'
import '@rails/actiontext'
// ✅ Auto-perform CableReady from JSON Mrujs responses
document.addEventListener('request:success', (event) => {
  const response = event.detail?.fetchResponse
  response
    ?.clone?.()
    .json?.()
    .then((data) => {
      if (window.CableReady?.canPerform(data)) {
        window.CableReady.perform(data)
      }
    })
    .catch((err) => {
      console.warn('❌ Failed to parse JSON from CableReady:', err)
    })
})
import '@hotwired/turbo-rails'
