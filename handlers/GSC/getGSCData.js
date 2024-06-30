const { google } = require("googleapis");
const fs = require("fs");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const stringTodate = require("../../utils/stringToDate");

// env variables
require("dotenv").config();

//GoogleSpreadsheet Instance with ID of document
const doc = new GoogleSpreadsheet(
  "1JlicWF4OP7qgyRXDR7UFp3zpjigT3Lx9DrqjF-8IlsU"
);

const getGSCData = async () => {
  try {
    // env variables
    const creds = {
      type: process.env.GSC_API_TYPE,
      project_id: process.env.GSC_API_PROJECT_ID,
      private_key_id: process.env.GSC_API_PRIVATE_KEY_ID,
      private_key: process.env.GSC_API_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.GSC_API_CLIENT_EMAIL,
      client_id: process.env.GSC_API_CLIENT_ID,
      auth_uri: process.env.GSC_API_AUTH_URI,
      token_uri: process.env.GSC_API_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.GSC_API_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GSC_API_CLIENT_CERT_URL,
    };

    // Scope to access API Google Search Console
    const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

    // instancea of autentication OAuth2 with credentials
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: SCOPES,
    });

    //client OAuth2
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    console.log("Token de acesso:", accessToken);

    //Google Webmasters API instance with authClient
    const webmasters = google.webmasters({ version: "v3", auth: authClient });

    //Websites
    const res = await webmasters.sites.list({});
    console.log("Resposta da API:", res.data);

    // are there websites?
    if (res.data.siteEntry && res.data.siteEntry.length > 0) {
      console.log("Websites found:");
      res.data.siteEntry.forEach((site) => {
        console.log(`${site.siteUrl} (${site.permissionLevel})`);

        // await getData(site.siteUrl);
      });
    } else {
      console.log("No website found.");
    }

    // Get data of a website
    async function getData(siteUrl) {
      try {
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();

        const seoPageSheet = doc.sheetsByIndex[7];
        const items = await seoPageSheet.getRows();

        const rawDates = items.map((item) => item.date);
        const { finalStartDate, finalEndDate } = stringTodate(rawDates);
        console.log(
          "Executando a query nas datas " + finalStartDate,
          finalEndDate
        );

        const query = {
          siteUrl: siteUrl,
          startDate: finalStartDate,
          endDate: finalEndDate,
          dimensions: ["query", "date", "country", "page"],
          type: "web",
          aggregationType: "auto",
          rowLimit: 25000,
          startRow: 0,
        };

        const response = await webmasters.searchanalytics.query(query);
        let formattedResponse = response?.data?.rows?.map((item) => ({
          id:
            item.clicks +
            item.impressions +
            item.position +
            item.ctr +
            item.keys[1] +
            item.keys[2] +
            item.keys[3].slice(30),
          query: item.keys[0],
          date: item.keys[1],
          country: item.keys[2],
          page: item.keys[3],
          clicks: item.clicks,
          impressions: item.impressions,
          ctr: item.ctr,
          position: item.position,
        }));

        if (!Array.isArray(formattedResponse)) {
          console.log("formattedResponse não é um array");
          return;
        }

        if (formattedResponse.length === 0) {
          console.log("Não há itens novos para subir");
        } else {
          console.log("Há itens na planilha");
          if (items.length === 0) {
            await seoPageSheet.addRows(formattedResponse);
          } else {
            const filteredItems = formattedResponse.filter(
              (newItem) =>
                !items.some((actualItem) => actualItem.id === newItem.id)
            );
            console.log(filteredItems);

            if (filteredItems.length === 0) {
              console.log("Não há itens novos para subir");
            } else {
              console.log(
                `Há ${filteredItems.length} novo(s) item(s) para subir`
              );
              await seoPageSheet.addRows(filteredItems);
              console.log(
                `O(s) novo(s) registro(s), no valor total de ${filteredItems.length}, foram carregados na tabela com sucesso`
              );
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    // await getData(site.siteUrl);
  } catch (error) {
    console.error("Erro ao autenticar com a conta de serviço:", error);
  }
};

module.exports = getGSCData;
