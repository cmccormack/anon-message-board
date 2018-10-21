forms = document.querySelectorAll('form')
outputs = document.querySelectorAll('.output')
forms.forEach(form => {
  form.addEventListener('submit', e => {
    outputs.forEach(output => {
      output.classList.add('hidden')
      output.textContent = ''
    })
  })
})

const displayResponse = (output, response) => {
  output.textContent = JSON.stringify(response, null, 2)
  output.classList.remove('hidden')
}

const fetchJSON = (endpoint, method="GET", body=undefined) => (
  fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  })
    .then(res => res.text())
    .then(text => {
      try {
        return JSON.parse(text)
      } catch (e) {
        return text
      }
    })
)

document.getElementById('new-thread-form').addEventListener('submit', e => {
  e.preventDefault()
  const {target:form} = e
  const { board, text, delete_password, method } = form
  const endpoint = form.getAttribute('action').replace(':board', board.value)
  const output = form.querySelector('.output')
  const body = {
    text: text.value,
    delete_password: delete_password.value,
  }

  fetchJSON(endpoint, method, body).then(({data, success, error}) => {
    if (success) {
      displayResponse(output, error)
    }
    window.location = '/b/' + data.board
  }).catch(err => displayResponse(output, err.message))
})