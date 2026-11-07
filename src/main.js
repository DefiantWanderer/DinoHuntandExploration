import './style.css'
import questions from './data/questions.json'

// This placeholder only proves your setup works.
// Replace it with your own app.
document.querySelector('#app').innerHTML = `
  <main class="placeholder">
    <h1>Setup works!</h1>
    <p>${questions.length} quiz questions loaded.</p>
    <p>Replace this screen with your app.</p>
  </main>
`
