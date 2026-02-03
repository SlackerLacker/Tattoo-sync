type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!resendKey || !from) {
    console.warn("Email not sent: missing RESEND_API_KEY or EMAIL_FROM")
    return { ok: false, error: "email_not_configured" }
  }

  const toList = Array.isArray(to) ? to : [to]

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: toList,
      subject,
      html,
      text,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error("Resend error:", error)
    return { ok: false, error }
  }

  return { ok: true }
}
