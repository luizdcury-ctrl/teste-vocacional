const nodemailer = require("nodemailer");

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendResultEmail({ to, nome, resultUrl, perfilNome }) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error("Envio de e-mail não configurado. Defina SMTP_HOST, SMTP_USER e SMTP_PASS no arquivo .env.");
  }

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color:#FF0000;">Colégio Visão · Seu Teste Vocacional está pronto! 🎓</h2>
      <p>Olá, <strong>${nome}</strong>!</p>
      <p>Seu perfil vocacional predominante é <strong>${perfilNome}</strong>. Acesse o link abaixo para ver seu relatório completo, com gráficos, cursos e profissões compatíveis:</p>
      <p style="text-align:center; margin: 24px 0;">
        <a href="${resultUrl}" style="background:#4C6EF5; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Ver meu resultado completo</a>
      </p>
      <p style="font-size: 13px; color: #666;">Se o botão não funcionar, copie e cole este link no navegador:<br>${resultUrl}</p>
      <hr style="border:none; border-top:1px solid #eee; margin: 24px 0;">
      <p style="font-size: 12px; color: #999;">Este e-mail foi enviado automaticamente pelo Teste Vocacional Inteligente do Colégio Visão.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Seu resultado do Teste Vocacional está pronto!",
    html,
  });
}

module.exports = { sendResultEmail, isEmailConfigured };
