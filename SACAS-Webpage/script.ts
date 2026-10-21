/*
  TypeScript source for the public SACAS website interactions.
  It handles navigation, application steps, and email preparation only.
  It contains no portal, login, or backend code.
*/

type ApplicationProgramme = 'college' | 'ijmb'

// Find a page element and make sure it exists before using it.
function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`The page is missing the required element: ${selector}`)
  }
  return element
}

const homePage = getElement<HTMLElement>('#home-page')
const applicationPage = getElement<HTMLElement>('#application-page')
const pages: HTMLElement[] = [homePage, applicationPage]

// Let visitors browse the home page photos or pause their automatic rotation.
const heroSlider = getElement<HTMLElement>('#hero-slider')
const heroSlides = Array.from(heroSlider.querySelectorAll<HTMLElement>('.hero-slide'))
const sliderDots = Array.from(heroSlider.querySelectorAll<HTMLButtonElement>('.slider-dot'))
const sliderAnnouncement = getElement<HTMLElement>('#slider-announcement')
const pauseSliderButton = getElement<HTMLButtonElement>('.slider-pause')
const previousSlideButton = getElement<HTMLButtonElement>('.slider-previous')
const nextSlideButton = getElement<HTMLButtonElement>('.slider-next')
let currentSlide = 0
let sliderTimer: number | undefined
let sliderIsPlaying = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

function showSlide(slideIndex: number, announceChange = false): void {
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
    const caption = heroSlides[currentSlide].querySelector('figcaption')?.textContent ?? ''
    sliderAnnouncement.textContent = `Photo ${currentSlide + 1} of ${heroSlides.length}: ${caption}`
  }
}

function stopSliderTimer(): void {
  if (sliderTimer !== undefined) window.clearInterval(sliderTimer)
  sliderTimer = undefined
}

function startSliderTimer(): void {
  stopSliderTimer()
  if (sliderIsPlaying) {
    sliderTimer = window.setInterval(() => showSlide(currentSlide + 1), 6000)
  }
}

previousSlideButton.addEventListener('click', () => {
  showSlide(currentSlide - 1, true)
  startSliderTimer()
})

nextSlideButton.addEventListener('click', () => {
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

// Pause while the visitor points at the slider or moves through its controls.
heroSlider.addEventListener('mouseenter', stopSliderTimer)
heroSlider.addEventListener('mouseleave', startSliderTimer)
heroSlider.addEventListener('focusin', stopSliderTimer)
heroSlider.addEventListener('focusout', (event: FocusEvent) => {
  const nextFocusedElement = event.relatedTarget
  if (!(nextFocusedElement instanceof Node) || !heroSlider.contains(nextFocusedElement)) {
    startSliderTimer()
  }
})

heroSlider.addEventListener('keydown', (event: KeyboardEvent) => {
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

// Show a selected section and hide the other page sections.
function showPage(pageToShow: HTMLElement): void {
  pages.forEach((page) => page.classList.add('hidden'))
  pageToShow.classList.remove('hidden')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

document.querySelectorAll<HTMLButtonElement>('[data-open="home-page"]').forEach((button) => {
  button.addEventListener('click', () => showPage(homePage))
})

// Expand or collapse the navigation on a small screen.
const menuButton = getElement<HTMLButtonElement>('#menu-toggle')
const mainNavigation = getElement<HTMLElement>('#main-navigation')

menuButton.addEventListener('click', () => {
  const isOpen = mainNavigation.classList.toggle('open')
  menuButton.setAttribute('aria-expanded', String(isOpen))
})

mainNavigation.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNavigation.classList.remove('open')
    menuButton.setAttribute('aria-expanded', 'false')
  })
})

// Open the right application form when a programme button is selected.
const applicationTitle = getElement<HTMLElement>('#application-title')
const pathwaySelect = getElement<HTMLSelectElement>('[name="pathway"]')
let currentStep = 1

document.querySelectorAll<HTMLButtonElement>('[data-apply]').forEach((button) => {
  button.addEventListener('click', () => {
    const programme = button.dataset.apply as ApplicationProgramme | undefined
    if (programme !== 'college' && programme !== 'ijmb') return

    applicationTitle.textContent = programme === 'college'
      ? 'College of Education application'
      : 'IJMB / JUPEB application'
    pathwaySelect.value = programme === 'college'
      ? 'College of Education (NCE)'
      : 'IJMB'
    currentStep = 1
    updateApplicationStep()
    showPage(applicationPage)
  })
})

const applicationForm = getElement<HTMLFormElement>('#application-form')
const formSteps = Array.from(applicationForm.querySelectorAll<HTMLElement>('.form-step'))
const stepLabels = Array.from(document.querySelectorAll<HTMLElement>('[data-step-label]'))
const previousButton = getElement<HTMLButtonElement>('#previous-step')
const nextButton = getElement<HTMLButtonElement>('#next-step')
const submitButton = getElement<HTMLButtonElement>('#submit-application')

// Keep the step panels and step labels in sync.
function updateApplicationStep(): void {
  formSteps.forEach((step) => {
    step.classList.toggle('active', Number(step.dataset.step) === currentStep)
  })
  stepLabels.forEach((label) => {
    label.classList.toggle('active', Number(label.dataset.stepLabel) === currentStep)
  })
  previousButton.disabled = currentStep === 1
  nextButton.classList.toggle('hidden', currentStep === formSteps.length)
  submitButton.classList.toggle('hidden', currentStep !== formSteps.length)
}

nextButton.addEventListener('click', () => {
  const visibleStep = formSteps[currentStep - 1]
  if (!visibleStep) return

  const requiredFields = Array.from(
    visibleStep.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]'),
  )
  const firstInvalidField = requiredFields.find((field) => !field.reportValidity())
  if (firstInvalidField) return

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

// Prepare the application as an email. The visitor sends it manually.
applicationForm.addEventListener('submit', (event: SubmitEvent) => {
  event.preventDefault()
  const formData = new FormData(applicationForm)
  const chosenFileNames = ['resultFile', 'passportFile']
    .map((fieldName) => formData.get(fieldName))
    .filter((entry): entry is File => entry instanceof File && entry.name.length > 0)
    .map((file) => file.name)

  const subject = encodeURIComponent(`${applicationTitle.textContent ?? 'SACAS'} enquiry`)
  const body = encodeURIComponent([
    `Applicant: ${formData.get('firstName') ?? ''} ${formData.get('lastName') ?? ''}`,
    `Email: ${formData.get('email') ?? ''}`,
    `Phone: ${formData.get('phone') ?? ''}`,
    `Date of birth: ${formData.get('dob') ?? ''}`,
    `Address: ${formData.get('address') ?? ''}`,
    `School: ${formData.get('school') ?? ''}`,
    `Examination: ${formData.get('examBody') ?? ''} ${formData.get('examYear') ?? ''}`,
    `Subjects and grades: ${formData.get('subjects') ?? ''}`,
    `Study pathway: ${formData.get('pathway') ?? ''}`,
    `Selected files: ${chosenFileNames.join(', ')}`,
    'Please attach the selected files before sending this email.',
  ].join('\n'))

  getElement<HTMLElement>('#application-result').textContent =
    'Your email app will open with the application details. Attach the selected files yourself, then send the email.'
  window.location.href = `mailto:admission@samalecollege.edu.ng?subject=${subject}&body=${body}`
})

// Prepare a contact email with the visitor's message.
getElement<HTMLFormElement>('#contact-form').addEventListener('submit', (event: SubmitEvent) => {
  event.preventDefault()
  const form = event.currentTarget
  if (!(form instanceof HTMLFormElement)) return

  const formData = new FormData(form)
  const subject = encodeURIComponent(`College enquiry from ${formData.get('name') ?? ''}`)
  const body = encodeURIComponent(`Reply to: ${formData.get('email') ?? ''}\n\n${formData.get('message') ?? ''}`)
  getElement<HTMLElement>('#contact-message').textContent =
    'Your email app is opening. Send the prepared email to complete your enquiry.'
  window.location.href = `mailto:admission@samalecollege.edu.ng?subject=${subject}&body=${body}`
})

// Start on the first step of the application form.
updateApplicationStep()
