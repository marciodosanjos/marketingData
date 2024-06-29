const fs = require("fs");
const { google } = require("googleapis");
const readline = require("readline");

//cred
require("dotenv").config();

// Initialize Google Sheets Auth
const { GoogleSpreadsheet } = require("google-spreadsheet");
const stringTodate = require("../../utils/stringToDate");
const doc = new GoogleSpreadsheet(
  "1JlicWF4OP7qgyRXDR7UFp3zpjigT3Lx9DrqjF-8IlsU"
);

const getGSCData = () => {
  const credentials = {
    client_id: process.env.GOOGLE_API_CLIENT_ID,
    project_id: process.env.GOOGLE_API_PROJECT_ID,
    auth_uri: process.env.GOOGLE_API_AUTH_URI,
    token_uri: process.env.GOOGLE_API_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.GOOGLE_API_AUTH_PROVIDER_X509_CERT_URL,
    client_secret: process.env.GOOGLE_API_CLIENT_SECRET,
  };

  const creds = {
    type: process.env.GOOGLE_SHEETS_TYPE,
    project_id: process.env.GOOGLE_SHEETS_TYPE,
    private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
    auth_uri: process.env.GOOGLE_SHEETS_AUTH_URI,
    token_uri: process.env.GOOGLE_SHEETS_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.GOOGLE_SHEETS_PRIVATE_AUT_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_SHEETS_CLIENT_CERT_URL,
  };

  const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];
  const { client_secret, client_id } = credentials;
  const redirect_uris = ["http://localhost"];
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error("Error retrieving access token", err);
        oAuth2Client.setCredentials(token);
        fs.writeFileSync("token.json", JSON.stringify(token));
        callback(oAuth2Client);
      });
    });
  }

  function authorize(callback) {
    try {
      const token = fs.readFileSync("token.json", "utf8");
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    } catch (err) {
      getAccessToken(oAuth2Client, callback);
    }
  }

  async function listSearchConsoleSites(auth) {
    const webmasters = google.webmasters({ version: "v3", auth });
    try {
      const res = await webmasters.sites.list({});
      const sites = res.data.siteEntry;
      if (sites.length) {
        console.log("Sites:");
        for (const site of sites) {
          console.log(`${site.siteUrl} (${site.permissionLevel})`);
          if (site.siteUrl === "https://www.goethe.de/prj/hum/") {
            await getData(auth, site.siteUrl, webmasters);
          }
        }
      } else {
        console.log("No sites found.");
      }
    } catch (err) {
      console.error("The API returned an error: " + err);
    }
  }

  async function getData(auth, siteUrl, webmasters) {
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
        auth: auth,
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
        console.log("Não há items novos para subir");
      } else {
        console.log("Há items novos para subir");
        if (items.length === 0) {
          console.log("A planilha está vazia");
          //await seoPageSheet.addRows(formattedResponse);
        } else {
          const filteredItems = formattedResponse.filter(
            (newItem) =>
              !items.some((actualItem) => actualItem.id === newItem.id)
          );

          console.log(filteredItems);

          if (filteredItems.length === 0) {
            console.log("Não há items novos para subir");
          } else {
            console.log("Hello");
            console.log(
              `Há ${filteredItems.length} novo(s) item(s) para subir`
            );
            //await seoPageSheet.addRows(filteredItems);
            console.log(
              `O(s) novo(s) registros, no valor total de ${filteredItems.length}, foram carregados na tabela com sucesso`
            );
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  authorize(listSearchConsoleSites);
};

module.exports = getGSCData;
