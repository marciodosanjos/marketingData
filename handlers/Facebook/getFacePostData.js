const axios = require("axios");
const { log } = require("console");
const fs = require("fs");
require("dotenv").config();

//nodejs fb sdk
const FacebookAdsApi = require("facebook-nodejs-ads-sdk").FacebookAdsApi;
const AdAccount = require("facebook-nodejs-ads-sdk").AdAccount;

//console.log("Variáveis de ambiente:", process.env.FB_APP_ID);

// Obter short lived tokent

const getAppAccessToken = async () => {
  const appId = process.env.FB_APP_ID;
  const clientSecret = process.env.FB_APP_SECRET;
  const accountId = process.env.FB_ACCOUNT_ID;
  const url = `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  try {
    const response = await axios.get(url);
    const appAccessToken = response.data.access_token;
    console.log(appAccessToken);

    const api = FacebookAdsApi.init(appAccessToken);
    const account = new AdAccount(accountId);

    console.log(account.age); // undefined
  } catch (error) {
    console.error(error);
  }
};

getAppAccessToken();

// Atualiza a variável de ambiente com o novo token
// const updateEnvToken = (newToken) => {
//   const envPath = ".env";
//   let envContent = fs.readFileSync(envPath, "utf8");

//   // Atualiza o valor do token no arquivo .env
//   envContent = envContent.replace(
//     /LONG_LIVED_TOKEN=.*/,
//     `LONG_LIVED_TOKEN=${newToken}`
//   );
//   fs.writeFileSync(envPath, envContent);
//   console.log("Token atualizado no arquivo .env");
// };

// // Função para obter o token de longa duração
// const exchangeTokenForLongLived = async (shortLivedToken) => {
//   const tokenUrl = `https://graph.facebook.com/v14.0/oauth/access_token`;
//   const params = {
//     grant_type: "fb_exchange_token",
//     client_id: process.env.FB_APP_ID,
//     client_secret: process.env.FB_APP_SECRET,
//     fb_exchange_token: shortLivedToken,
//   };

//   try {
//     const response = await axios.get(tokenUrl, { params });
//     console.log(response.data);

//     return response.data.access_token;
//   } catch (error) {
//     console.error(
//       "Error exchanging token:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };

// // Função para obter o token de acesso da página
// const getPageAccessToken = async (userAccessToken, pageId) => {
//   const pageUrl = `https://graph.facebook.com/v14.0/${pageId}?fields=access_token&access_token=${userAccessToken}`;

//   try {
//     const response = await axios.get(pageUrl);
//     return response.data.access_token;
//   } catch (error) {
//     console.error(
//       "Error fetching page access token:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };

// // Função principal para obter e atualizar o token
// const updateAccessToken = async () => {
//   try {
//     let longLivedToken = process.env.LONG_LIVED_TOKEN;

//     if (longLivedToken === "LONG_LIVED_TOKEN") {
//       const shortLivedToken = process.env.SHORT_LIVED_TOKEN;
//       longLivedToken = await exchangeTokenForLongLived(shortLivedToken);
//       updateEnvToken(longLivedToken); // Salva o novo token no .env
//       console.log("Obtained new long-lived token");
//     } else {
//       console.log("Using stored long-lived token:", longLivedToken);
//     }

//     return longLivedToken;
//   } catch (error) {
//     console.error("Error in updating access token:", error.message);
//   }
// };

// // Função para obter informações da página
// const getPageInfo = async (pageId, pageAccessToken) => {
//   const pageUrl = `https://graph.facebook.com/v14.0/${pageId}?fields=published_posts.since(2023-05-30).until(2024-06-10){id,created_time,insights.metric(post_impressions_paid,post_impressions_paid_unique,post_impressions_organic,post_impressions_organic_unique,post_reactions_by_type_total,post_activity_by_action_type,post_clicks_by_type),message,permalink_url}&access_token=${pageAccessToken}`;

//   try {
//     const response = await axios.get(pageUrl);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error fetching page info:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };

// // Função principal para executar o script
// const getFacePostData = async () => {
//   try {
//     const userAccessToken = await updateAccessToken();
//     const pageAccessToken = await getPageAccessToken(
//       userAccessToken,
//       "108683005456780"
//     );
//     const fbData = await getPageInfo("108683005456780", pageAccessToken);
//     console.log(fbData);
//   } catch (error) {
//     console.error("Error in main function:", error.message);
//   }
// };

// getFacePostData();
