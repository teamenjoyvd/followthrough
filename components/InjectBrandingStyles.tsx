import { branding, hexToHslString } from '@/config/branding'

export function InjectBrandingStyles() {
  const primaryHsl = hexToHslString(branding.primaryColor)
  const secondaryHsl = hexToHslString(branding.secondaryColor)

  return (
    <style
      id="branding-dynamic-styles"
      dangerouslySetInnerHTML={{
        __html: `
          :root {
            --color-primary: ${branding.primaryColor};
            --color-secondary: ${branding.secondaryColor};
            --primary: ${primaryHsl};
            --secondary: ${secondaryHsl};
            --ring: ${primaryHsl};
          }
        `,
      }}
    />
  )
}
