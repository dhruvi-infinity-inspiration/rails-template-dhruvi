// app/javascript/controllers/application.js
import { Application } from '@hotwired/stimulus'
import StimulusReflex from 'stimulus_reflex'
import { definitionsFromContext } from '@hotwired/stimulus-webpack-helpers'

const application = Application.start()

// Dev experience
application.warnings = true
application.debug = false
window.Stimulus = application

// Register all controllers automatically
const context = require.context('.', true, /\.js$/)
application.load(definitionsFromContext(context))

// Init StimulusReflex with isolation
StimulusReflex.initialize(application, { isolate: true })

export { application }
