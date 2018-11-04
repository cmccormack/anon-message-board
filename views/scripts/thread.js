const board = window.location.pathname.split('/')[2]
const forms = document.querySelectorAll('form')
const outputs = document.querySelectorAll('.output')

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

document.querySelectorAll('.quick-reply-form').forEach(el => {
  el.addEventListener('submit', e => {
    e.preventDefault()
    const { target: form } = e
    const { text, delete_password, submit, method } = form
    const endpoint = form.getAttribute('action')
    const body = {
      text: text.value,
      delete_password: delete_password.value,
      thread_id: submit.value
    }

    fetchJSON(endpoint, method, body).then(({ data, success, error }) => {
      location.reload()
    }).catch(err => displayResponse(output, err.message))
  })
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
    const { thread, reply } = JSON.parse(e.target.value)
    fetchJSON(
      `/api/replies/${board}`,
      'PUT',
      {thread_id: thread._id, reply_id: reply._id}
      )
      .then(res => {
        if (res === 'success') {
          alert(`id ${reply._id} has been reported.`)
        }
    })
  })
})

document.querySelectorAll('.delete-reply').forEach(el => {
  el.addEventListener('submit', e => {
    e.preventDefault()
    const { delete_password: {value: delete_password}, submit } = e.target
    const { thread_id, reply_id } = JSON.parse(submit.value)
    const method = e.target.getAttribute('method')
    const action = e.target.getAttribute('action')
    console.log(location)
    fetchJSON(action, method, { thread_id, reply_id, delete_password })
    .then(res => {
      if (res === 'success') {
        alert(`id ${reply_id} has been deleted.`)
        return location.reload(true)
      }
      const error = res.error ? res.error : res
      alert(`Error deleting reply ${reply_id} - ${error}`)
    })
      .catch(err => console.error(err))
  })
})

document.querySelectorAll('.delete-thread').forEach(el => {
  el.addEventListener('submit', e => {
    e.preventDefault()
    const { delete_password: { value: delete_password }, submit } = e.target
    const thread_id = submit.value
    const method = e.target.getAttribute('method')
    const action = e.target.getAttribute('action')
    fetchJSON(action, method, { thread_id, delete_password })
      .then(res => {
        if (res === 'success') {
          alert(`id ${thread_id} has been deleted.`)
          return location.replace(`/b/${board}`)
        }
        const error = res.error ? res.error : res
        alert(`Error deleting thread ${thread_id} - ${error}`)
      })
      .catch(err => console.error(err))
  })
})