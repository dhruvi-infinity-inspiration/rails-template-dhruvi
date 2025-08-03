// app/javascript/controllers/application.js
import { Application } from '@hotwired/stimulus'
import StimulusReflex from 'stimulus_reflex'

// Start Stimulus
const application = Application.start()

application.warnings = true
application.debug = false
window.Stimulus = application

// Auto-register all controllers using import.meta.glob
const controllers = import.meta.glob('./**/*_controller.js', { eager: true })

for (const path in controllers) {
  const controller = controllers[path].default
  const identifier = path
    .replace('./', '')
    .replace('_controller.js', '')
    .replace(/\//g, '--') // optional if nested folders
  application.register(identifier, controller)
}

// Init StimulusReflex
StimulusReflex.initialize(application, { isolate: true })

export { application }

