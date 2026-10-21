# Beginner Guide to the SACAS Website

## 1. What this project is

This project is a public college website for Sam Ale College of Advanced Studies. Visitors can learn about the college, browse programmes, prepare an application enquiry, and find contact details. It has no student portal, sign-in, backend, API, or database.

## 2. Open it

Double-click `index.html` to open the website in Chrome or your default browser. Keep the `images/` folder beside it. You do not need a code editor or server just to view the page.

## 3. The website files

| File | In simple words | What it contains |
| --- | --- | --- |
| `index.html` | Content and structure | Header, Home, About, founder profile, Programmes, Admissions, Contact, and application forms. |
| `styles.css` | Appearance | SACAS colours, layout, buttons, mobile styles, and automatic device light/dark appearance. |
| `script.js` | Browser interactions | Homepage photo slider, mobile menu, application form steps, required-field checks, and preparing contact emails. |
| `script.ts` | Typed source example | The same website interactions with TypeScript types, including the photo slider. Compile it to JavaScript before a browser can run it. |
| `images/` | Photos | College photos and the three student study photos shown in the homepage slider. |

## 4. HTML: the page structure

HTML is the content and structure of a webpage. In `index.html`:

- `<!doctype html>` tells the browser to use modern HTML rules.
- `<head>` stores the page title, mobile display settings, and links to CSS.
- `<body>` contains the visible page.
- `<header>` contains the brand and navigation links.
- The header and footer use the cropped college crest saved as `images/sacas-logo.jpg`.
- `<main>` contains the main website and application form.
- `<section>` groups related content such as About or Programmes.
- `<form>`, `<label>`, and `<input>` build information forms.
- `class="..."` connects an element to design rules in `styles.css`.
- `id="..."` gives an element a unique name for page links or JavaScript.

For example, `<a href="#programmes">Programmes</a>` jumps to the section with `id="programmes"`.

## 5. CSS and Tailwind CSS: the appearance

The actual website uses regular CSS. At the top of `styles.css`, values such as `--gold`, `--navy`, and `--page` are reusable colours. A rule such as `.button { ... }` styles elements that have `class="button"`. The `@media (max-width: 700px)` rules adapt the layout to small screens. The `prefers-color-scheme` rule follows the visitor’s device light or dark setting.

Tailwind CSS is a different way to write styling. It uses small utility names directly in an HTML class attribute. For example:

```html
<button class="rounded bg-blue-600 px-4 py-2 text-white">Apply</button>
```

`rounded` adds rounded corners, `bg-blue-600` sets the background colour, and `px-4 py-2` adds inside spacing. This website does not load Tailwind; the real appearance is controlled by `styles.css`. The example explains Tailwind as a front-end concept.

## 6. JavaScript and TypeScript: the interactions

JavaScript runs in the browser. The `script.js` file connects buttons and forms to actions. Examples:

- The homepage slider changes photos automatically, and its arrow buttons, dots, pause button, and left/right keyboard keys let a visitor control it.
- The slider pauses while a visitor points at it or uses its controls. It also respects the device's reduced-motion preference.

- `document.querySelector('#menu-toggle')` finds the menu button.
- `addEventListener('click', ...)` runs code after a click.
- `function updateApplicationStep()` groups the instructions that display the right application form section.
- `FormData` reads values from a form.
- `mailto:` opens the visitor’s email app with a prepared message. The visitor must review and send it.

TypeScript is JavaScript with extra type descriptions. For example:

```ts
type ApplicationProgramme = 'college' | 'ijmb'
let chosenProgramme: ApplicationProgramme = 'college'
```

This tells TypeScript that `chosenProgramme` can only be `'college'` or `'ijmb'`. It helps catch mistakes while writing code. The full typed version of the page interactions is in `script.ts`. Browsers do not run `.ts` files directly; they must first be converted into JavaScript. The double-clickable page currently loads `script.js`.

To compile `script.ts`, install Node.js and run this command from Terminal in the project folder:

```sh
npx --yes --package typescript tsc script.ts --target ES2020 --lib DOM,ES2020 --strict --outFile script-compiled.js
```

This creates `script-compiled.js`. To try it, update the script link near the bottom of `index.html` to point to `script-compiled.js`. Keep `script.js` if you want to switch back to the direct browser version.

## 7. About section and portrait placeholder

The About section describes the college and Professor Sam O. Ale. The founder portrait area is a temporary CSS placeholder. When the intended photo is available, replace the element with class `founder-placeholder` in `index.html` with an `<img>` element and set its `src` to the image path.

## 8. Application forms and contact

The College of Education and IJMB/JUPEB forms have three steps: basic information, education, and documents. JavaScript checks required fields before showing the next step. A file picker only selects a file on the visitor’s device; the site does not upload it. On submit, the page prepares an email and lists selected file names so the visitor can attach them and send the email themselves.

The Contact section includes clickable email and phone links. The contact form also prepares an email; it does not send the form to an online service.

## 9. Make a small change

1. Open `index.html` in a text editor.
2. Find a heading such as `Learn with purpose.` and edit its words.
3. Save the file and refresh the browser.

To change the gold colour, edit `--gold` near the top of `styles.css`. To change how a button behaves, find its click handler in `script.js`.

## 10. How to describe the project

You can say: “This is the public SACAS website. HTML contains its content, CSS controls the design, and JavaScript handles the mobile menu and application form steps. It runs directly in a browser and has no portal or backend. Application enquiries are prepared as emails for the visitor to review and send.”
