const { google } = require("googleapis");
const fs = require("fs");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const stringTodate = require("../../utils/stringToDate");

// env variables
require("dotenv").config();

//GoogleSpreadsheet Instance with ID of document
const doc = new GoogleSpreadsheet(
  "1V3Zq6eWgLO6HR6j4QD9W23RYWefdgLto5IhzSYvKHKA"
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

    const googleSheetCredentials = {
      type: process.env.GOOGLE_SHEETS_TYPE,
      project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
      private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
      auth_uri: process.env.GOOGLE_SHEETS_AUTH_URI,
      token_uri: process.env.GOOGLE_SHEETS_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.GOOGLE_SHEETS_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_SHEETS_CLIENT_CERT_URL,
    };

    // Scope to access API Google Search Console
    const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

    // instance of autentication OAuth2 with credentials
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: SCOPES,
    });

    //client OAuth2
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    if (!accessToken) {
      console.log("No access token available");
      return;
    }
    //Google Webmasters API instance with authClient
    const webmasters = google.webmasters({ version: "v3", auth: authClient });

    //Websites
    const res = await webmasters.sites.list({});

    // are there websites?
    if (res.data.siteEntry && res.data.siteEntry.length > 0) {
      console.log("Websites found:");
      res.data.siteEntry.forEach((site) => {
        console.log(`${site.siteUrl} (${site.permissionLevel})`);
        let siteUrl = site.siteUrl;

        async function getData() {
          try {
            //load google sheet
            await doc.useServiceAccountAuth(googleSheetCredentials);

            const loadInfo = await doc.loadInfo();

            // Acessar uma aba específica (pelo índice 0, a primeira aba)
            const seoPageSheet = doc.sheetsByIndex[0];

            const items = await seoPageSheet.getRows();
            const rawDates = items.map((item) => item.date);
            const { finalStartDate, finalEndDate } = stringTodate(rawDates);
            // console.log(
            //   "Executing query on the data " + finalStartDate,
            //   finalEndDate
            // );

            const query = {
              siteUrl: siteUrl,
              startDate:
                finalStartDate === undefined ? "2023-04-04" : finalStartDate,
              endDate: finalEndDate === undefined ? "2023-04-04" : finalEndDate,
              dimensions: ["query", "date", "country", "page"],
              type: "web",
              aggregationType: "auto",
              rowLimit: 25000,
              startRow: 0,
            };

            console.log(query);

            const response = await webmasters.searchanalytics.query(query);

            let formatedResponse = response?.data?.rows?.map((item) => ({
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

            if (!Array.isArray(formatedResponse)) {
              console.log("formatedResponse is not an array");
              console.log(response.data);
              console.log(formatedResponse);
              return;
            }

            if (formatedResponse.length === 0) {
              console.log("No new items to upload");
            }

            if (formatedResponse.length !== 0 && items.length === 0) {
              console.log("New items to upload and the sheet is empty");
              await seoPageSheet.addRows(formatedResponse);
            }

            if (formatedResponse.length !== 0 && items.length !== 0) {
              console.log(
                "New items to upload and the sheet has already items"
              );

              const filteredItems = formatedResponse.filter(
                (newItem) =>
                  !items.some((actualItem) => actualItem.id === newItem.id)
              );

              console.log("Example one new item");
              console.log(filteredItems[0]);

              if (filteredItems.length === 0) {
                console.log("No new items to upload");
              } else {
                console.log(
                  `There are ${filteredItems.length} new items to upload para subir`
                );
                await seoPageSheet.addRows(filteredItems);
                console.log(
                  `The new ${filteredItems.length} items were uploaded`
                );
              }
            }
          } catch (error) {
            console.error(error.message);
          }
        }

        getData();
      });
    } else {
      console.log("No website found.");
    }

    await getData(site.siteUrl);
  } catch (error) {
    console.error("Error by authenticating service account:", error);
  }

  const googleSheetCredentials = {
    type: process.env.GOOGLE_SHEETS_TYPE,
    project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
    private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
    auth_uri: process.env.GOOGLE_SHEETS_AUTH_URI,
    token_uri: process.env.GOOGLE_SHEETS_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.GOOGLE_SHEETS_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_SHEETS_CLIENT_CERT_URL,
  };
};

module.exports = getGSCData;
