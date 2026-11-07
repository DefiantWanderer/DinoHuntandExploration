import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import questions from './data/questions.json'

const ANSWER_TAG = / \(answer\)$/
const parse = (o) => ({ text: o.replace(ANSWER_TAG, ''), correct: ANSWER_TAG.test(o) })

export function startExplore(root, { onDone, onExit }) {
  const answered = new Map() // question index -> correct?
  let watchId = null

  root.innerHTML = `
    <div class="explore">
      <div id="map"></div>
      <div class="hud top">
        <button class="chip" data-exit>← Menu</button>
        <span class="chip" id="progress"></span>
      </div>
      <div class="map-btns">
        <button class="chip" id="btn-me">📍 My Location</button>
        <button class="chip" id="btn-qs">🗺️ Question locations</button>
      </div>
      <div class="hint" id="hint">Tap a pin to answer its question</div>
      <div class="geo-status" id="geo" hidden></div>
      <div class="sheet" id="sheet" hidden></div>
    </div>`

  const map = L.map('map', { zoomControl: false })
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map)

  const markers = questions.map((q, i) => {
    const m = L.marker([q.location.lat, q.location.lng], {
      icon: pinIcon(i, false),
    }).addTo(map)
    m.on('click', () => openQuestion(i))
    return m
  })
  map.fitBounds(L.latLngBounds(questions.map((q) => [q.location.lat, q.location.lng])), {
    padding: [50, 50],
  })

  // "You are here" dot + a line to every unanswered question location
  let me = null
  let meLL = null
  const lines = questions.map((q) =>
    L.polyline([], { color: '#1a73e8', weight: 3, dashArray: '6 8', opacity: 0.8 }),
  )
  const fmt = (m) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`)
  function updateLines() {
    if (!meLL) return
    lines.forEach((line, i) => {
      if (answered.has(i)) return line.remove()
      const to = [questions[i].location.lat, questions[i].location.lng]
      line.setLatLngs([meLL, to])
      if (!map.hasLayer(line)) line.addTo(map)
      const text = fmt(map.distance(meLL, to))
      if (line.getTooltip()) line.setTooltipContent(text)
      else line.bindTooltip(text, { permanent: true, className: 'dist-label' })
    })
  }
  const geo = root.querySelector('#geo')
  const qBounds = L.latLngBounds(questions.map((q) => [q.location.lat, q.location.lng]))
  root.querySelector('#btn-qs').addEventListener('click', () => map.fitBounds(qBounds, { padding: [50, 50] }))
  root.querySelector('#btn-me').addEventListener('click', () => {
    if (meLL) map.setView(meLL, Math.max(map.getZoom(), 17))
    else showGeo('Still finding your location…', true)
  })
  function startWatch() {
    geo.hidden = true
    if (!('geolocation' in navigator)) return showGeo('Location is not supported in this browser.', false)
    if (!window.isSecureContext)
      return showGeo('Location needs a secure (https) page. Open the https link.', false)
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    watchId = navigator.geolocation.watchPosition(onPos, onGeoError, {
      enableHighAccuracy: true,
      timeout: 20000,
    })
  }
  function showGeo(msg, retry) {
    geo.hidden = false
    geo.innerHTML = `<span>${msg}</span>${retry ? '<button class="chip" id="geo-retry">Retry</button>' : ''}`
    geo.querySelector('#geo-retry')?.addEventListener('click', startWatch)
  }
  function onGeoError(err) {
    if (err.code === 1)
      showGeo('Location is blocked. Tap the lock/tune icon in the address bar, allow Location for this site, then retry.', true)
    else if (err.code === 2) showGeo('Your position is unavailable. Check GPS/location services.', true)
    else showGeo('Finding your location timed out.', true)
  }
  function onPos(p) {
    geo.hidden = true
    meLL = [p.coords.latitude, p.coords.longitude]
    if (!me) {
      me = L.circleMarker(meLL, { radius: 8, color: '#fff', weight: 3, fillColor: '#1a73e8', fillOpacity: 1 })
        .bindTooltip('You are here', { permanent: true, direction: 'top', offset: [0, -8] })
        .addTo(map)
      map.fitBounds(L.latLngBounds([meLL, ...questions.map((q) => [q.location.lat, q.location.lng])]), {
        padding: [50, 50],
      })
    } else me.setLatLng(meLL)
    updateLines()
  }
  startWatch()

  const sheet = root.querySelector('#sheet')
  const progress = root.querySelector('#progress')
  const updateProgress = () => (progress.textContent = `${answered.size} / ${questions.length} answered`)
  updateProgress()

  function openQuestion(i) {
    if (answered.has(i)) return
    const q = questions[i]
    const opts = q.options.map(parse)
    let picked = -1
    sheet.hidden = false
    sheet.innerHTML = `
      <div class="sheet-card">
        <div class="sheet-place">📍 ${q.location.name} · Question ${i + 1}</div>
        <h2>${q.question}</h2>
        <div class="options">
          ${opts.map((o, k) => `<button class="opt" data-k="${k}">${o.text}</button>`).join('')}
        </div>
        <div class="row">
          <button class="btn ghost" data-close>Close</button>
          <button class="btn" data-confirm disabled>Confirm</button>
        </div>
      </div>`
    const confirm = sheet.querySelector('[data-confirm]')
    sheet.querySelectorAll('.opt').forEach((b) =>
      b.addEventListener('click', () => {
        picked = +b.dataset.k
        sheet.querySelectorAll('.opt').forEach((x) => x.classList.toggle('selected', x === b))
        confirm.disabled = false
      }),
    )
    sheet.querySelector('[data-close]').addEventListener('click', closeSheet)
    confirm.addEventListener('click', () => {
      answered.set(i, opts[picked].correct)
      markers[i].setIcon(pinIcon(i, true))
      lines[i].remove()
      closeSheet()
      updateProgress()
      if (answered.size === questions.length) {
        stop()
        const score = [...answered.values()].filter(Boolean).length
        onDone({ score, max: questions.length })
      }
    })
  }
  function closeSheet() {
    sheet.hidden = true
    sheet.innerHTML = ''
  }

  function stop() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    map.remove()
  }
  root.querySelector('[data-exit]').addEventListener('click', () => {
    stop()
    onExit()
  })
}

function pinIcon(i, done) {
  return L.divIcon({
    className: 'pin-wrap',
    html: `<div class="pin ${done ? 'done' : ''}"><span class="pin-icon">${done ? '✅' : '📍'}</span><span class="pin-dot"></span></div>`,
    iconSize: [40, 56],
    iconAnchor: [20, 50],
  })
}
