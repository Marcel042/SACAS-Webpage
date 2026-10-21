/*
  SACAS page interactions.
  This file runs only in the visitor's browser. It does not call a server,
  database, Supabase, or an online file service.
*/

// Find the page sections so the buttons can switch between them.
const homePage = document.querySelector('#home-page')
const applicationPage = document.querySelector('#application-page')
const allPages = [homePage, applicationPage]

// Show one page and hide the other pages.
function showPage(pageToShow) {
  allPages.forEach((page) => page.classList.add('hidden'))
  pageToShow.classList.remove('hidden')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Connect buttons that open the home page or sign-in page.
document.querySelectorAll('[data-open="home-page"]').forEach((button) => {
  button.addEventListener('click', () => showPage(homePage))
})
// Open and close the small-screen navigation menu.
const menuButton = document.querySelector('#menu-toggle')
const mainNavigation = document.querySelector('#main-navigation')
menuButton.addEventListener('click', () => {
  const menuIsOpen = mainNavigation.classList.toggle('open')
  menuButton.setAttribute('aria-expanded', String(menuIsOpen))
})
mainNavigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNavigation.classList.remove('open')
    menuButton.setAttribute('aria-expanded', 'false')
  })
})

// Let visitors move through the home page photos or pause the automatic slider.
const heroSlider = document.querySelector('#hero-slider')
const heroSlides = [...heroSlider.querySelectorAll('.hero-slide')]
const sliderDots = [...heroSlider.querySelectorAll('.slider-dot')]
const sliderAnnouncement = document.querySelector('#slider-announcement')
const pauseSliderButton = heroSlider.querySelector('.slider-pause')
let currentSlide = 0
let sliderTimer
let sliderIsPlaying = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

function showSlide(slideIndex, announceChange = false) {
  currentSlide = (slideIndex + heroSlides.length) % heroSlides.length

  heroSlides.forEach((slide, index) => {
    const isCurrentSlide = index === currentSlide
    slide.hidden = !isCurrentSlide
    slide.classList.toggle('active', isCurrentSlide)
    sliderDots[index].classList.toggle('active', isCurrentSlide)

    if (isCurrentSlide) {
      sliderDots[index].setAttribute('aria-current', 'true')
    } else {
      sliderDots[index].removeAttribute('aria-current')
    }
  })

  if (announceChange) {
    const caption = heroSlides[currentSlide].querySelector('figcaption').textContent
    sliderAnnouncement.textContent = `Photo ${currentSlide + 1} of ${heroSlides.length}: ${caption}`
  }
}

function stopSliderTimer() {
  window.clearInterval(sliderTimer)
  sliderTimer = undefined
}

function startSliderTimer() {
  stopSliderTimer()
  if (sliderIsPlaying) {
    sliderTimer = window.setInterval(() => showSlide(currentSlide + 1), 6000)
  }
}

heroSlider.querySelector('.slider-previous').addEventListener('click', () => {
  showSlide(currentSlide - 1, true)
  startSliderTimer()
})

heroSlider.querySelector('.slider-next').addEventListener('click', () => {
  showSlide(currentSlide + 1, true)
  startSliderTimer()
})

sliderDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index, true)
    startSliderTimer()
  })
})

pauseSliderButton.addEventListener('click', () => {
  sliderIsPlaying = !sliderIsPlaying
  pauseSliderButton.textContent = sliderIsPlaying ? 'Pause' : 'Play'
  pauseSliderButton.setAttribute(
    'aria-label',
    sliderIsPlaying ? 'Pause automatic photo changes' : 'Play automatic photo changes',
  )
  startSliderTimer()
})

// Stop the timer while someone is pointing at or using the slider controls.
heroSlider.addEventListener('mouseenter', stopSliderTimer)
heroSlider.addEventListener('mouseleave', startSliderTimer)
heroSlider.addEventListener('focusin', stopSliderTimer)
heroSlider.addEventListener('focusout', (event) => {
  if (!heroSlider.contains(event.relatedTarget)) startSliderTimer()
})

heroSlider.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    showSlide(currentSlide - 1, true)
    startSliderTimer()
  }
  if (event.key === 'ArrowRight') {
    showSlide(currentSlide + 1, true)
    startSliderTimer()
  }
})

showSlide(0)
startSliderTimer()

// Start the application form and set its chosen programme name.
const applicationTitle = document.querySelector('#application-title')
document.querySelectorAll('[data-apply]').forEach((button) => {
  button.addEventListener('click', () => {
    const programme = button.dataset.apply
    applicationTitle.textContent = programme === 'college'
      ? 'College of Education application'
      : 'IJMB / JUPEB application'
    document.querySelector('[name="pathway"]').value = programme === 'college'
      ? 'College of Education (NCE)'
      : 'IJMB'
    currentStep = 1
    updateApplicationStep()
    showPage(applicationPage)
  })
})

// Keep track of which of the three application steps is visible.
const applicationForm = document.querySelector('#application-form')
const formSteps = [...applicationForm.querySelectorAll('.form-step')]
const stepLabels = [...document.querySelectorAll('[data-step-label]')]
const previousButton = document.querySelector('#previous-step')
const nextButton = document.querySelector('#next-step')
const submitApplicationButton = document.querySelector('#submit-application')
let currentStep = 1

function updateApplicationStep() {
  formSteps.forEach((step) => {
    step.classList.toggle('active', Number(step.dataset.step) === currentStep)
  })
  stepLabels.forEach((label) => {
    label.classList.toggle('active', Number(label.dataset.stepLabel) === currentStep)
  })
  previousButton.disabled = currentStep === 1
  nextButton.classList.toggle('hidden', currentStep === formSteps.length)
  submitApplicationButton.classList.toggle('hidden', currentStep !== formSteps.length)
}

// Only move forward after the visible step's required fields are complete.
nextButton.addEventListener('click', () => {
  const visibleStep = formSteps[currentStep - 1]
  const requiredFields = [...visibleStep.querySelectorAll('[required]')]
  const firstMissingField = requiredFields.find((field) => !field.reportValidity())
  if (firstMissingField) return
  currentStep += 1
  updateApplicationStep()
  applicationPage.scrollIntoView({ behavior: 'smooth' })
})

previousButton.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep -= 1
    updateApplicationStep()
  }
})

// Prepare an email containing the form answers and selected file names.
// Browsers cannot attach files to a prepared email automatically.
applicationForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const formData = new FormData(applicationForm)
  const selectedFiles = ['resultFile', 'passportFile']
    .map((fieldName) => formData.get(fieldName))
    .filter((file) => file instanceof File && file.name)
    .map((file) => file.name)
  const emailSubject = encodeURIComponent(`${applicationTitle.textContent} enquiry`)
  const emailBody = encodeURIComponent([
    `Applicant: ${formData.get('firstName')} ${formData.get('lastName')}`,
    `Email: ${formData.get('email')}`,
    `Phone: ${formData.get('phone')}`,
    `Date of birth: ${formData.get('dob')}`,
    `Address: ${formData.get('address')}`,
    `School: ${formData.get('school')}`,
    `Examination body and year: ${formData.get('examBody')} ${formData.get('examYear')}`,
    `Subjects and grades: ${formData.get('subjects')}`,
    `Study pathway: ${formData.get('pathway')}`,
    `Selected files: ${selectedFiles.join(', ')}`,
    'Please attach the selected files before sending this email.',
  ].join('\n'))

  document.querySelector('#application-result').textContent =
    'Your email app will open with the application details. Attach the selected files yourself, then send the email to submit your enquiry.'
  window.location.href = `mailto:admission@samalecollege.edu.ng?subject=${emailSubject}&body=${emailBody}`
})

// Prepare a contact email without sending form information to a server.
document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  const subject = encodeURIComponent(`College enquiry from ${formData.get('name')}`)
  const body = encodeURIComponent(`Reply to: ${formData.get('email')}\n\n${formData.get('message')}`)
  document.querySelector('#contact-message').textContent = 'Your email app is opening. Send the prepared email to complete your enquiry.'
  window.location.href = `mailto:admission@samalecollege.edu.ng?subject=${subject}&body=${body}`
})

// Start with the first application step ready when the page opens.
updateApplicationStep()
