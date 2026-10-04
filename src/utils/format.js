export const usd = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
export const pct = (n, d = 1) => (n * 100).toFixed(d) + '%'
export const dt = (s) => new Date(s).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
export const label = (s) => String(s).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
