const board = window.location.pathname.split('/')[2]
console.log(board)
const forms = document.querySelectorAll('form')
constoutputs = document.querySelectorAll('.output')
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
  const { text, password, method } = form
  const endpoint = form.getAttribute('action')
  const output = form.querySelector('.output')
  const body = {
    text: text.value,
    delete_password: password.value,
  }

  fetchJSON(endpoint, method, body).then(({ data, success, error }) => {
    location.reload()
  }).catch(err => displayResponse(output, err.message))
})


document.querySelectorAll('.thread-report-btn').forEach(el => {
  el.addEventListener('click', e => {
    const { value: thread_id } = e.target
    fetchJSON(`/api/threads/${board}`, 'PUT', {thread_id}).then(res => {
      if (res === 'success') {
        alert(`id ${thread_id} has been reported.`)
      }
    })
  })
})

document.querySelectorAll('.reply-report-btn').forEach(el => {
  el.addEventListener('click', e => {
    const { value: thread_id } = e.target
    console.log('reported!', e.target.value)
    fetchJSON(`/api/replies/${board}`, 'PUT', { thread_id }).then(res => {
      if (res === 'success') {
        alert(`id ${thread_id} has been reported.`)
      }
    })
  })
})