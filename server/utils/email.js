const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;

// API key setup
client.authentications["api-key"].apiKey =
  (process.env.BREVO_API_KEY || "").trim();

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
// Function to send email
exports.sendMail = async (to, subject, html) => {
  try {
    console.log("------ EMAIL DEBUG LOG ------");
    console.log("API KEY LOADED:", process.env.BREVO_API_KEY ? "YES" : "NO");
    console.log("Sending To:", to);

    await tranEmailApi.sendTransacEmail({
      sender: {
        email: process.env.MAIL_FROM,
        name: "SP Coaching",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    console.log("Email Sent Successfully");
  } catch (err) {
    console.error("BREVO EMAIL FAILED");
    console.error(err.response?.text || err.message);
    throw err;
  }
};
