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
    from: 'contato@veredasdaterra.com.br',
    subject,
    template,
    context,
  })
}
