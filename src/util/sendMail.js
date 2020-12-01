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
    from: 'kevinmira12@gmail.com',
    subject,
    template,
    context,
  })
}
