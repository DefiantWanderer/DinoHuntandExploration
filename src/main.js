import './style.css'
import questions from './data/questions.json'
import { startHunt } from './hunt.js'
import { startExplore } from './explore.js'
import { getStats, recordPick, recordResult, recordFinalView, resetStats } from './stats.js'

const app = document.querySelector('#app')
const WIN_RATIO = 0.8
const NAMES = { hunt: 'Dino Hunt', explore: 'Dino Explorer' }

function menu() {
  app.innerHTML = `
    <main class="screen center">
      <h1 class="title">🦖 Dino Adventure</h1>
      <p class="sub">FunFest @ Downtown West · Pick a game</p>
      <button class="card" data-game="hunt">
        <span class="card-emoji">📷</span>
        <span><b>Hunt</b><br>Find and capture dinosaurs around you with your camera</span>
      </button>
      <button class="card" data-game="explore">
        <span class="card-emoji">🗺️</span>
        <span><b>Exploration</b><br>Visit 5 locations on the map and answer the questions</span>
      </button>
      <p class="small">Score 80% or more to win a prize!</p>
    </main>`
  app.querySelectorAll('[data-game]').forEach((b) =>
    b.addEventListener('click', () => play(b.dataset.game)),
  )
}

function play(game) {
  recordPick(game)
  const handlers = {
    onExit: menu,
    onDone: ({ score, max }) => {
      const won = score >= Math.ceil(max * WIN_RATIO)
      recordResult(game, won)
      if (game === 'explore') missionComplete({ game, score, max, won })
      else result({ game, score, max, won })
    },
  }
  if (game === 'hunt') startHunt(app, handlers)
  else startExplore(app, handlers)
}

function missionComplete(r) {
  app.innerHTML = `
    <main class="screen">
      <h1 class="title">🎉 Mission complete!</h1>
      <p class="sub">Here is what you discovered</p>
      <div class="facts">
        ${questions.map((q, i) => `<div class="fact"><b>${i + 1}</b><span>${q.fact}</span></div>`).join('')}
      </div>
      <button class="btn" id="next">Continue</button>
    </main>`
  app.querySelector('#next').addEventListener('click', () => result(r))
}

function result({ game, score, max, won }) {
  if (won) {
    recordFinalView(game)
    app.innerHTML = `
      <main class="screen center winner">
        <div class="banner">🏆 WINNER 🏆</div>
        <p class="big">${score} / ${max}</p>
        <p class="sub">${NAMES[game]}</p>
        <p class="staff">Show this screen to our staff to collect your prize!</p>
        <p class="small">${new Date().toLocaleString()}</p>
        <button class="btn ghost" id="menu">Back to menu</button>
      </main>`
  } else {
    app.innerHTML = `
      <main class="screen center">
        <h1 class="title">So close!</h1>
        <p class="big">${score} / ${max}</p>
        <p class="sub">You need ${Math.ceil(max * WIN_RATIO)} to win. Try again!</p>
        <button class="btn" id="again">Play again</button>
        <button class="btn ghost" id="menu">Back to menu</button>
      </main>`
    app.querySelector('#again').addEventListener('click', () => play(game))
  }
  app.querySelector('#menu').addEventListener('click', menu)
}

// Staff-only stats page: open the site with #stats on the end.
function statsPage() {
  const s = getStats()
  const row = (g) =>
    `<tr><td>${NAMES[g]}</td><td>${s.games[g].picked}</td><td>${s.games[g].wins}</td><td>${s.games[g].losses}</td><td>${s.games[g].finalViews}</td></tr>`
  app.innerHTML = `
    <main class="screen">
      <h1 class="title">📊 Stats</h1>
      <p class="sub">Total players: <b>${s.players}</b></p>
      <table>
        <tr><th>Game</th><th>Picked</th><th>Wins</th><th>Losses</th><th>Final views</th></tr>
        ${row('hunt')}${row('explore')}
      </table>
      <p class="small">Stored on this device only (localStorage).</p>
      <button class="btn" id="back">Back</button>
      <button class="btn ghost" id="reset">Reset stats</button>
    </main>`
  app.querySelector('#back').addEventListener('click', () => {
    location.hash = ''
  })
  app.querySelector('#reset').addEventListener('click', () => {
    if (confirm('Reset all stats?')) {
      resetStats()
      statsPage()
    }
  })
}

function route() {
  if (location.hash === '#stats') statsPage()
  else menu()
}
window.addEventListener('hashchange', route)
route()
