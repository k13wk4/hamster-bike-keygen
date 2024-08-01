// ==UserScript==
// @name        Hamster bike keygen debug
// @version     1.2
// @match       *://georg95.github.io/*
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// ==/UserScript==

const APP_TOKEN = 'd28721be-fd2d-4b45-869e-9f253b554e50';
const PROMO_ID = '43e35910-c168-4634-ad4f-52fd764a843f';

const PARAMS = new URLSearchParams(window.location.search);
const USER_ID = PARAMS.get('id') || '';
const USER = PARAMS.get('user') || '';
const HASH = PARAMS.get('hash') || '';

start();

async function start() {
  const { startBtn, keyText, buttons } = createLayout();

  async function keygen() {
    keyText.innerText = 'Generating...';
    try {
      const token = await login(generateClientId());
      console.log('Login token:', token);
      const key = await generateKey(token);
      keyText.innerText = key || 'Failed to generate key';
    } catch (error) {
      keyText.innerText = 'Error: ' + error.message;
      console.error('Error generating key:', error);
    }
    buttons.innerHTML = '';
    buttons.appendChild(startBtn);
  }

  startBtn.onclick = () => {
    buttons.innerHTML = '';
    keygen();
  };
}

function createLayout() {
  document.body.innerHTML = '';

  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.height = '100vh';
  container.style.fontFamily = 'monospace';
  container.style.backgroundColor = '#282c34';
  container.style.color = 'white';

  const keyText = document.createElement('div');
  keyText.style.margin = '20px';
  keyText.style.fontSize = '20px';

  const buttons = document.createElement('div');
  const startBtn = document.createElement('button');
  startBtn.innerText = 'Generate Key';
  startBtn.style.fontSize = '20px';
  buttons.appendChild(startBtn);

  container.appendChild(keyText);
  container.appendChild(buttons);
  document.body.appendChild(container);

  return { keyText, startBtn, buttons };
}

async function login(clientId) {
  if (!clientId) throw new Error('No client ID');
  const response = await vmFetch('https://api.gamepromo.io/promo/login-client', {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'Host': 'api.gamepromo.io'
    },
    method: 'POST',
    body: {
      appToken: APP_TOKEN,
      clientId: clientId,
      clientOrigin: 'deviceid'
    }
  });
  console.log('Login response:', response);
  return response.clientToken;
}

async function generateKey(clientToken) {
  if (!clientToken) throw new Error('No access token');
  const response = await vmFetch('https://api.gamepromo.io/promo/create-code', {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'Host': 'api.gamepromo.io',
      'Authorization': `Bearer ${clientToken}`
    },
    method: 'POST',
    body: {
      promoId: PROMO_ID
    }
  });
  console.log('Key generation response:', response);
  return response.promoCode;
}

async function vmFetch(url, options) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: options.method,
      url: url,
      headers: options.headers,
      data: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
      responseType: 'json',
      onload: response => {
        console.log('Fetch response:', response.responseText);
        resolve(response.response);
      },
      onerror: response => {
        console.error('Fetch error:', response.responseText);
        reject(response.responseText || 'No internet?');
      },
    });
  });
}

function generateClientId() {
  const timestamp = Date.now();
  const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
  return `${timestamp}-${randomNumbers}`;
}
