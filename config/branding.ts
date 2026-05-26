export interface BrandingConfig {
  appName: string
  appDescription: string
  primaryColor: string     // Hex format e.g. '#4a7c59'
  secondaryColor: string   // Hex format e.g. '#6b6358'
  logoPath: string         // e.g. '/logo.svg'
  supportUrl: string       // e.g. support URL/git repo
  faviconPath: string      // e.g. '/favicon.ico'
}

export const branding: BrandingConfig = {
  appName: 'Followthrough',
  appDescription: 'Contact follow-up, done right. Stay connected with the people who matter most.',
  primaryColor: '#38761d',    // Forest Green (brand mark colour)
  secondaryColor: '#6b6358',  // Warm neutral (Terra secondary)
  logoPath: '/logo.svg',
  supportUrl: 'https://github.com/teamenjoyvd/followthrough',
  faviconPath: '/favicon.ico',
}

/**
 * Converts a hex color string (e.g. "#4a7c59" or "4a7c59") to an HSL string
 * formatted as "H S% L%" (without the hsl() wrapper), suitable for CSS custom properties.
 */
export function hexToHslString(hex: string): string {
  const cleanedHex = hex.startsWith('#') ? hex.slice(1) : hex
  const normalizedHex = cleanedHex.length === 3
    ? cleanedHex.split('').map(c => c + c).join('')
    : cleanedHex

  if (normalizedHex.length !== 6) {
    return '142 25% 39%'
  }

  // Parse r, g, b components
  const rParsed = parseInt(normalizedHex.substring(0, 2), 16)
  const gParsed = parseInt(normalizedHex.substring(2, 4), 16)
  const bParsed = parseInt(normalizedHex.substring(4, 6), 16)

  if (isNaN(rParsed) || isNaN(gParsed) || isNaN(bParsed)) {
    return '142 25% 39%'
  }

  const r = rParsed / 255
  const g = gParsed / 255
  const b = bParsed / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  const hDeg = Math.round(h * 360)
  const sPct = Math.round(s * 100)
  const lPct = Math.round(l * 100)

  return `${hDeg} ${sPct}% ${lPct}%`
}
