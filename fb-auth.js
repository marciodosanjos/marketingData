require("dotenv").config();
const { tagmanager } = require("googleapis/build/src/apis/tagmanager");
const puppeteer = require("puppeteer");

//console.log(process.env.FB_TEST_USER_EMAIL);

(async () => {
  // Lança o navegador com a UI visível para que possamos acompanhar o processo
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Define a URL para o fluxo de login do Facebook
  const facebookLoginURL = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=${process.env.FB_REDIRECT_URI}&scope=email,public_profile&response_type=code`;

  // Vai para a página de login do Facebook
  await page.goto(facebookLoginURL);

  // Espera o span com o texto específico "Permitir todos os cookies"
  await page.waitForFunction(() => {
    const elements = Array.from(document.querySelectorAll("span"));

    // Verifica se algum elemento contém o texto "Permitir todos os cookies"
    const targetElement = elements.find(
      (element) => element.textContent.trim() === "Permitir todos os cookies"
    );

    // Se o elemento for encontrado, retorna true para sair do loop
    if (targetElement) {
      return true;
    }

    // Continua o loop se não encontrar o elemento
    return false;
  });

  // Encontra e clica diretamente com page.click()
  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("span"));

    // Verifica se algum elemento contém o texto "Permitir todos os cookies"
    const targetElement = elements.find(
      (element) => element.textContent.trim() === "Permitir todos os cookies"
    );

    if (targetElement) {
      targetElement.setAttribute("id", "cookie-button"); // Atribui um ID temporário para garantir o seletor
    }
  });

  await page.click("#cookie-button"); // Usa o seletor id para clicar diretamente

  // Espera que o campo de email esteja disponível e preenche com o seu usuário de teste
  await page.waitForSelector("#email");
  await page.type("#email", process.env.FB_TEST_USER_EMAIL);

  // Preenche a senha com a senha do usuário de teste
  await page.type("#pass", process.env.FB_TEST_USER_PASSWORD);

  // Clica no botão de login
  await page.click('button[name="login"]');

  // Espera o redirecionamento para a URL de callback
  await page.waitForNavigation();

  // Obtém a URL atual (que deve conter o código de autenticação)
  const redirectedUrl = page.url();
  console.log("Redirected URL:", redirectedUrl);

  // Extraia o código da URL de redirecionamento
  const urlParams = new URLSearchParams(redirectedUrl.split("?")[1]);
  const authCode = urlParams.get("code");

  console.log(`Auth Code: ${authCode}`);

  //await browser.close();
})();
