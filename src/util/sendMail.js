import Mail from '../lib/Mail'

export default async function sendMailNoAttachment(
  name,
  email,
  subject,
  template,
  context,
) {
  await Mail.sendMail({
    to: `${name} <${email}>`,
    from: process.env.MAIL_FROM,
    subject,
    template,
    context,
  })
}
