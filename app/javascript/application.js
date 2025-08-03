// app/javascript/application.js

// Hotwire (Turbo Drive, Turbo Frames)
import '@hotwired/turbo-rails'

// Stimulus Controllers (Reflex bootstrapped here)
import './controllers'

// CableReady + ActionCable setup
import consumer from './channels/consumer'
import CableReady from 'cable_ready'

// mrujs setup (form + link handling)
import mrujs from 'mrujs'
import { CableCar } from 'mrujs/plugins'

mrujs.start({
  plugins: [new CableCar(CableReady)],
})
