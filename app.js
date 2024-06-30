const express = require("express");
const app = express();
const port = 80; // Porta HTTP padrão

// Import function to get data
const getGSCData = require("./handlers/GSC/getGSCData");

// Call the function directly to run it as a cron job
getGSCData();

app.listen(port, () => {
  console.log(`Servidor HTTP rodando em http://localhost:${port}`);
});
