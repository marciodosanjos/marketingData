// server.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rota de login para redirecionar o usuário para o Facebook
app.get("/auth/facebook", (req, res) => {
  const facebookLoginURL = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=${process.env.FB_REDIRECT_URI}&scope=email,public_profile&response_type=code`;
  res.redirect(facebookLoginURL);
});

// Rota de callback que recebe o código de autorização
app.get("/auth/facebook/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // Troca o código de autorização por um User Access Token
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v16.0/oauth/access_token`,
      {
        params: {
          client_id: process.env.FB_APP_ID,
          client_secret: process.env.FB_APP_SECRET,
          redirect_uri: process.env.FB_REDIRECT_URI,
          code: code,
        },
      }
    );

    const userAccessToken = tokenResponse.data.access_token;
    console.log(userAccessToken);

    // Aqui você pode usar o token para fazer chamadas à API do Facebook
    res.json({ status: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao obter User Access Token" });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
