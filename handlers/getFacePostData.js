require('dotenv').config();
const axios = require('axios');

// Variável para armazenar o token de longa duração
let longLivedToken = null;

// Função para obter o token de longa duração
const exchangeTokenForLongLived = async (shortLivedToken) => {
    const tokenUrl = `https://graph.facebook.com/v14.0/oauth/access_token`;
    const params = {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        fb_exchange_token: shortLivedToken,
    };

    try {
        const response = await axios.get(tokenUrl, { params });
        return response.data.access_token;
    } catch (error) {
        console.error('Error exchanging token:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Função para obter o token de acesso da página
const getPageAccessToken = async (userAccessToken, pageId) => {
    const pageUrl = `https://graph.facebook.com/v14.0/${pageId}?fields=access_token&access_token=${userAccessToken}`;

    try {
        const response = await axios.get(pageUrl);
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching page access token:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Função principal para obter e atualizar o token
const updateAccessToken = async () => {
    try {
        if (!longLivedToken) {
            const shortLivedToken = process.env.SHORT_LIVED_TOKEN;
            longLivedToken = await exchangeTokenForLongLived(shortLivedToken);
            console.log('Obtained new long-lived token');
        } else {
            console.log('Using stored long-lived token:', longLivedToken);
        }

        return longLivedToken;
    } catch (error) {
        console.error('Error in updating access token:', error.message);
    }
};

// Função para obter informações da página
const getPageInfo = async (pageId, pageAccessToken) => {
    const pageUrl = `https://graph.facebook.com/v14.0/${pageId}?fields=published_posts.since(2023-05-30).until(2024-06-10){id,created_time,insights.metric(post_impressions_paid,post_impressions_paid_unique,post_impressions_organic,post_impressions_organic_unique,post_reactions_by_type_total,post_activity_by_action_type,post_clicks_by_type),message,permalink_url}&access_token=${pageAccessToken}`;

    try {
        const response = await axios.get(pageUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching page info:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Função principal para executar o script
const getFacePostdata = async () => {
    try {
        const userAccessToken = await updateAccessToken();
        const pageAccessToken = await getPageAccessToken(userAccessToken, '108683005456780');
        const fbData = await getPageInfo('108683005456780', pageAccessToken);
        console.log(fbData);
    } catch (error) {
        console.error('Error in main function:', error.message);
    }
};


getFacePostdata();

