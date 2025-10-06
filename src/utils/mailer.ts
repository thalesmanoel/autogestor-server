import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

export async function sendMail (to: string[], subject: string, text: string) {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: to.join(','),
      subject,
      text
    })
    console.log(`Email enviado para: ${to.join(', ')}`)
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
  }
}
