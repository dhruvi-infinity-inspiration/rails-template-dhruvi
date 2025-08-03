import ApplicationController from './application_controller'

export default class extends ApplicationController {
  static values = { count: Number }

  connect() {
    super.connect()
    this.countValue = parseInt(this.element.dataset.count)
  }

  increment() {
    this.countValue++
    this.element.dataset.count = this.countValue
  }
}
