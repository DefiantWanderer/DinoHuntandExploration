// Player statistics, stored in localStorage (this device only).
const KEY = 'playwin-stats-v1'

const blank = () => ({
  players: 0,
  games: {
    hunt: { picked: 0, wins: 0, losses: 0, finalViews: 0 },
    explore: { picked: 0, wins: 0, losses: 0, finalViews: 0 },
  },
})

export function getStats() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s && s.games) return s
  } catch {}
  return blank()
}

function update(fn) {
  const s = getStats()
  fn(s)
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {}
}

// A "player" is counted each time someone picks a game.
export const recordPick = (game) =>
  update((s) => {
    s.players++
    s.games[game].picked++
  })
export const recordResult = (game, won) =>
  update((s) => {
    s.games[game][won ? 'wins' : 'losses']++
  })
export const recordFinalView = (game) =>
  update((s) => {
    s.games[game].finalViews++
  })
export const resetStats = () => {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}
