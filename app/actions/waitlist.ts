'use server'

const BREVO_FORM_URL =
  process.env.BREVO_FORM_URL ||
  'https://5ddd9a6f.sibforms.com/serve/MUIFAFaX14JAv31fbUUCPJqjowOcfhnObySSii2OnP4DKmFjQ6obUlJlwmByxOQksYsFYH2lUpQxTK8ZMH-oKFzRkDDsoE8mhfWgSDbcMmza-zpqX1Bp8P7ngPoeEfqW2ipeCzZ_Y1yV-O1nfKh-0hhTmbLey97Pz2zmvbXmh4zt7z0rA6uyjnnkvg44_7R9Ix-dTPe2dsbbaI-1kA=='

export async function joinWaitlist(email: string) {
  try {
    if (!email) {
      return { success: false, error: 'Email is required' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' }
    }

    // Submit to Brevo
    const formData = new URLSearchParams()
    formData.append('EMAIL', email.toLowerCase().trim())
    formData.append('email_address_check', '')
    formData.append('locale', 'en')

    const response = await fetch(BREVO_FORM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/plain, */*',
      },
      body: formData.toString(),
      redirect: 'manual',
    })

    // Brevo typically returns 200 or a 3xx redirect on success
    if (response.status >= 200 && response.status < 400) {
      return { success: true, message: 'Successfully joined waitlist' }
    }

    const text = await response.text().catch(() => '')
    console.error('Brevo submission failed:', response.status, text)
    return {
      success: false,
      error: 'Could not add you to the waitlist. Please try again.',
    }
  } catch (error) {
    console.error('Waitlist action error:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}
