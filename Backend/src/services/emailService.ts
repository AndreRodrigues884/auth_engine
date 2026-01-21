import nodemailer from 'nodemailer';

// Configuração do transportador (usando variáveis de ambiente)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `https://meuapp.com/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"Professional App" <noreply@meuapp.com>',
    to: email,
    subject: 'Verifique a sua conta',
    html: `
      <h1>Bem-vindo!</h1>
      <p>Clique no link abaixo para verificar o seu e-mail:</p>
      <a href="${verificationUrl}">Verificar E-mail</a>
      
      <br/><br/>
      <p><strong>Dica para o Teste (Postman):</strong></p>
      <p>O teu token é: <code>${token}</code></p>
      <p>Copia o código acima e usa no corpo do teu POST para /verify-email.</p>
    `,
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `https://meuapp.com/reset-password?token=${token}`;

  await transporter.sendMail({
    from: '"Professional App" <noreply@meuapp.com>',
    to: email,
    subject: 'Recuperação de Password',
    html: `<p>Utilize o link para resetar a sua senha: <a href="${resetUrl}">Resetar Password</a></p>
    <p>O teu token é: <code>${token}</code></p>`,
  });
};