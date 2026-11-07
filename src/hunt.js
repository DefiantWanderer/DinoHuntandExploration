// Dino Hunt: camera feed + compass-aligned dinosaurs + spatial roars.
import roarUrl from './assets/birduwuCUT.wav?url'

const DINOS = ['🦖', '🦕', '🦖', '🦕', '🦖']
const TOTAL = DINOS.length
const HOLD_SECONDS = 3
const GAME_SECONDS = 90
const FOV = 60 // degrees across the screen width
const AIM_YAW = 9 // degrees from centre that counts as "pointing at it"
const AIM_PITCH = 12 // degrees up/down from the dinosaur that still counts
const ROAR_COOLDOWN = 12000 // ms between roars
const DINO_PITCH = [-35, 5, -50, 20, -25] // degrees above (+) / below (-) the horizon

const wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180

export function startHunt(root, { onDone, onExit }) {
  root.innerHTML = `
    <div class="hunt">
      <div class="intro">
        <h1>🦖 Dino Hunt</h1>
        <p>${TOTAL} dinosaurs are hiding all around you, and you hunt them <b>one at a time</b>. Turn around, listen for the roar, and keep your phone pointed at one for <b>${HOLD_SECONDS} seconds</b> to capture it.</p>
        <p>Capture <b>4 of ${TOTAL}</b> in ${GAME_SECONDS} seconds to win!</p>
        <p class="small">We need your camera and motion sensors. Turn your sound on 🔊</p>
        <button class="btn" id="go">Start hunting</button>
        <button class="btn ghost" id="back">← Menu</button>
      </div>
    </div>`
  root.querySelector('#back').addEventListener('click', onExit)
  root.querySelector('#go').addEventListener('click', begin)

  async function begin() {
    // iOS needs the motion permission request inside the tap handler.
    let sensorsOk = true
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        sensorsOk = (await DeviceOrientationEvent.requestPermission()) === 'granted'
      }
    } catch {
      sensorsOk = false
    }
    let stream = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
    } catch {
      // No camera: carry on with a plain background so the game is still playable.
    }
    const AC = window.AudioContext || window.webkitAudioContext
    const audio = AC ? new AC() : null
    audio?.resume()
    run({ stream, audio, sensorsOk })
  }

  function run({ stream, audio, sensorsOk }) {
    root.innerHTML = `
      <div class="hunt live">
        <video id="cam" playsinline muted autoplay></video>
        <div class="sky"></div>
        <div id="dinos"></div>
        <div class="hud top">
          <button class="chip" id="quit">✕</button>
          <span class="chip big" id="score"></span>
          <span class="chip" id="time"></span>
        </div>
        <div class="reticle" id="reticle"><div class="ring" id="ring"></div></div>
        <div class="arrow" id="arrow"></div>
        <div class="hint" id="hint"></div>
      </div>`
    const $ = (id) => root.querySelector('#' + id)
    const cam = $('cam')
    if (stream) cam.srcObject = stream
    else root.querySelector('.sky').classList.add('visible')

    const dinoEls = DINOS.map((emoji) => {
      const el = document.createElement('div')
      el.className = 'dino'
      el.textContent = emoji
      $('dinos').appendChild(el)
      return el
    })
    let lastRoarAt = -Infinity
    let current = 0 // index of the single dinosaur being hunted
    const state = DINOS.map((_, i) => ({
      angle: i * (360 / TOTAL), // relative to where the player started facing
      pitch: DINO_PITCH[i % DINO_PITCH.length],
      captured: false,
      hold: 0,
      nextRoar: performance.now() + 800 + i * 900,
    }))

    // --- orientation ---
    let heading = 0
    let pitch = 0
    let base = null
    let gotSensor = false
    const onOrient = (e) => {
      if (e.alpha === null || e.beta === null || e.gamma === null) return
      gotSensor = true
      // Work out where the back camera points from the full rotation (works
      // upright, tilted or flat; Android's raw alpha is unreliable upright).
      const d = Math.PI / 180
      const a = e.alpha * d, b = e.beta * d, g = e.gamma * d
      const zx = Math.cos(a) * Math.sin(g) + Math.sin(a) * Math.sin(b) * Math.cos(g)
      const zy = Math.sin(a) * Math.sin(g) - Math.cos(a) * Math.sin(b) * Math.cos(g)
      const zz = Math.cos(b) * Math.cos(g)
      // camera looks along -z of the device: x = east, y = north, z = up
      const h = (Math.atan2(-zx, -zy) / d + 360) % 360
      if (base === null) base = h
      heading = wrap(h - base)
      pitch = Math.asin(Math.max(-1, Math.min(1, -zz))) / d
    }
    window.addEventListener('deviceorientation', onOrient)

    // Fallback (desktop / no sensors): drag to look around.
    let drag = null
    const down = (e) => (drag = { x: e.clientX, y: e.clientY })
    const move = (e) => {
      if (!drag || gotSensor) return
      heading = wrap(heading - (e.clientX - drag.x) * 0.3)
      pitch = Math.max(-60, Math.min(60, pitch + (e.clientY - drag.y) * 0.3))
      drag = { x: e.clientX, y: e.clientY }
    }
    const up = () => (drag = null)
    root.addEventListener('pointerdown', down)
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerup', up)

    setTimeout(() => {
      if (gotSensor || finished) return
      const hint = $('hint')
      hint.style.pointerEvents = 'auto'
      hint.innerHTML = `<button class="chip" id="retry">${
        sensorsOk ? 'No motion data' : 'Motion access denied'
      }: tap to enable</button><div class="small-hint">Or drag the screen to look around</div>`
      $('retry').addEventListener('click', async () => {
        try {
          if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
            await DeviceOrientationEvent.requestPermission()
          }
        } catch {}
        setTimeout(() => {
          if (gotSensor) hint.innerHTML = ''
          else
            hint.querySelector('.small-hint').textContent =
              'Still blocked. Allow "Motion sensors" in your browser site settings, and open the page over a trusted https link (see README)'
        }, 1000)
      })
    }, 1500)

    // --- audio ---
    let roarBuf = null
    if (audio) {
      fetch(roarUrl)
        .then((r) => r.arrayBuffer())
        .then((ab) => audio.decodeAudioData(ab))
        .then((buf) => (roarBuf = buf))
        .catch(() => {})
    }
    function roar(i, angleDiff) {
      if (!audio || !roarBuf) return
      const rad = (angleDiff * Math.PI) / 180
      const src = audio.createBufferSource()
      const gain = audio.createGain()
      const pan = audio.createStereoPanner ? audio.createStereoPanner() : null
      src.buffer = roarBuf
      src.playbackRate.value = 1 - i * 0.05 // slightly different voice per dino
      gain.gain.value = 0.2 + 0.8 * ((Math.cos(rad) + 1) / 2) // quieter when behind you
      src.connect(gain)
      if (pan) {
        pan.pan.value = Math.sin(rad) // + = to your right, - = to your left
        gain.connect(pan).connect(audio.destination)
      } else gain.connect(audio.destination)
      src.start()
    }
    function chime() {
      if (!audio) return
      const t = audio.currentTime
      ;[660, 880].forEach((f, k) => {
        const o = audio.createOscillator()
        const g = audio.createGain()
        o.frequency.value = f
        g.gain.setValueAtTime(0.2, t + k * 0.12)
        g.gain.exponentialRampToValueAtTime(0.0001, t + k * 0.12 + 0.3)
        o.connect(g).connect(audio.destination)
        o.start(t + k * 0.12)
        o.stop(t + k * 0.12 + 0.35)
      })
    }

    // --- game loop ---
    let score = 0
    let remaining = GAME_SECONDS
    let last = performance.now()
    let raf = 0
    let finished = false

    function cleanup() {
      finished = true
      cancelAnimationFrame(raf)
      window.removeEventListener('deviceorientation', onOrient)
      root.removeEventListener('pointerdown', down)
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerup', up)
      stream?.getTracks().forEach((t) => t.stop())
      audio?.close()
    }
    $('quit').addEventListener('click', () => {
      cleanup()
      onExit()
    })

    function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      remaining -= dt
      const W = window.innerWidth
      const H = window.innerHeight
      const ppd = W / FOV
      let aimProgress = 0
      let nearest = null

      state.forEach((s, i) => {
        const el = dinoEls[i]
        const diff = wrap(s.angle - heading)
        if (s.captured || i !== current) {
          el.style.display = 'none'
          if (s.captured) el.classList.add('captured')
        } else {
          if (nearest === null || Math.abs(diff) < Math.abs(nearest)) nearest = diff
          if (now >= s.nextRoar && now - lastRoarAt >= ROAR_COOLDOWN) {
            roar(i, diff)
            lastRoarAt = now
            s.nextRoar = now + ROAR_COOLDOWN
          }
          const aimed = Math.abs(diff) < AIM_YAW && Math.abs(pitch - s.pitch) < AIM_PITCH
          s.hold = aimed ? s.hold + dt : Math.max(0, s.hold - dt * 2)
          aimProgress = Math.max(aimProgress, s.hold / HOLD_SECONDS)
          if (s.hold >= HOLD_SECONDS) {
            s.captured = true
            score++
            chime()
            navigator.vibrate?.(200)
            current++
            if (current < TOTAL) state[current].nextRoar = now + 800
          }
        }
        const dp = pitch - s.pitch // + = dinosaur is below where you look
        const visible =
          !s.captured && i === current && Math.abs(diff) < FOV / 2 + 15 && Math.abs(dp) < H / ppd / 2 + 15
        if (i === current || s.captured) el.style.display = visible ? 'block' : 'none'
        if (visible) {
          const x = W / 2 + diff * ppd
                    const y = H / 2 + dp * ppd
          const scale = 1 + (s.hold / HOLD_SECONDS) * 0.15
          el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`
        }
      })

      $('ring').style.setProperty('--p', `${Math.min(1, aimProgress) * 360}deg`)
      $('reticle').classList.toggle('locking', aimProgress > 0)
      $('score').textContent = `🦖 ${score} / ${TOTAL}`
      $('time').textContent = `⏱ ${Math.max(0, Math.ceil(remaining))}s`
      const arrow = $('arrow')
      if (nearest !== null && Math.abs(nearest) > FOV / 2 - 5) {
        arrow.textContent = nearest > 0 ? '➡️' : '⬅️'
        arrow.className = 'arrow show ' + (nearest > 0 ? 'right' : 'left')
      } else arrow.className = 'arrow'

      if (score === TOTAL || remaining <= 0) {
        cleanup()
        onDone({ score, max: TOTAL })
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
  }
}
