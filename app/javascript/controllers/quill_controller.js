import { Controller } from '@hotwired/stimulus'
import Quill from 'quill'

export default class extends Controller {
  static targets = ['input']

  connect() {
    // Find associated hidden input (ends with [description])
    this.input = this.element
      .closest('form')
      ?.querySelector("input[type='hidden'][name$='[description]']")

    // Initialize Quill editor
    this.quill = new Quill(this.element, {
      theme: 'snow',
      placeholder: 'Start typing...',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean'],
        ],
      },
    })

    // ✅ If editing, preload content into Quill
    if (this.input && this.input.value) {
      this.quill.root.innerHTML = this.input.value
    }

    // ✅ Sync Quill content into hidden input on change
    this.quill.on('text-change', () => {
      if (this.input) {
        this.input.value = this.quill.root.innerHTML
      }
    })
  }
}
