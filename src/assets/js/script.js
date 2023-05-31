const buttonElem = document.getElementById('submitBtn')
const categoryElem = document.getElementById('category')
const quoteElem = document.getElementById('quote')
const quoteContentElem = document.getElementById('quoteContent')
const quoteAuthorElem = document.getElementById('quoteAuthor')
const quoteTitleElem = document.getElementById('quoteTitle')

function populateCategories() {
  buttonSetBusy('Fetching categories...')
  categoryElem.disabled = true

  fetch(`https://api.quotable.io/tags`)
    .then((response) => {
      if (response.ok) {
        buttonReset()

        return response.json()
      }

      buttonError('There was an error fetching the categories.')
      console.log(response)
    })
    .then((data) => {
      if (!data.length) return buttonError()

      data
        .filter((category) => category.quoteCount >= 2)
        .forEach((category) => {
          const existingOption = categoryElem.querySelector(`option[value="${category.slug}"]`)

          if (existingOption) return

          const optionElem = document.createElement('option')

          optionElem.value = category.slug
          optionElem.text = category.name

          categoryElem.appendChild(optionElem)
          categoryElem.disabled = false
        })
    })
    .catch((e) => {
      buttonError('There was an error fetching the categories.')
      console.log(e)
    })
}

function getQuote() {
  buttonSetBusy('Getting quote...')

  const category = categoryElem.value
  let requestURL = 'https://api.quotable.io/quotes/random'

  if (category) requestURL += `?tags=${category}`

  fetch(requestURL)
    .then((response) => {
      if (response.ok) {
        buttonReset()

        return response.json()
      }

      buttonError()
      console.log(response)
    })
    .then((data) => {
      if (!data.length) return buttonError()

      const quote = data[0]

      quoteTitleElem.innerText = buildCategoryTitle(quote.tags)
      quoteContentElem.innerText = ' ' + quote.content + ' '
      quoteAuthorElem.innerText = quote.author

      quoteElem.style.display = ''
      cooldownButton()
    })
    .catch((e) => {
      buttonError()
      console.log(e)
    })
}

function buildCategoryTitle(tags) {
  if (!tags.length) return 'Quote'

  tags = tags.map((tag) => {
    if (tag.includes('Quotes')) {
      return tag.replace('Quotes', '').trim()
    }
    return tag
  })

  if (tags.length === 1) return tags[0] + ' Quote '

  let result = tags.join(', ')
  const lastIndex = result.lastIndexOf(',')
  result = result.substring(0, lastIndex) + ' &' + result.substring(lastIndex + 1)

  return result + ' Quote'
}

function buttonSetBusy(message) {
  message ??= 'Please wait...'

  buttonElem.setAttribute('aria-busy', true)
  buttonElem.classList.add('secondary')
  buttonElem.textContent = message
}

function buttonReset() {
  buttonElem.setAttribute('aria-busy', false)
  buttonElem.classList.remove('secondary')
  buttonElem.classList.remove('error')
  buttonElem.disabled = false
  buttonElem.innerHTML = 'Get a quote'
}

function buttonError(message) {
  message ??= 'There was an error getting you a quote'

  buttonElem.setAttribute('aria-busy', false)
  buttonElem.classList.remove('secondary')
  buttonElem.classList.remove('error')
  buttonElem.classList.add('error')
  buttonElem.textContent = message

  setTimeout(() => {
    buttonReset()
  }, 5 * 1000)
}

function cooldownButton() {
  buttonElem.classList.add('secondary')
  buttonElem.disabled = true

  setTimeout(() => {
    buttonReset()
  }, 3 * 1000)
}

document.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    buttonElem.click()
  }
})

populateCategories()
