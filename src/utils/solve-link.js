import { sessionService } from 'src/db/sessionService.js';

const projectBaseUrl = import.meta.env.BASE_URL;


export const generateShareLink = async (solveId) =>  {
  const data = await sessionService.getSolveWithReconstructionBySolveId(solveId);
  const jsonString = JSON.stringify(data);
  const encoded = btoa(unescape(encodeURIComponent(jsonString)));
  return `${projectBaseUrl}share/${encoded}`;
};

export const parseShareLink = (shareLink) =>{
  const base64 = shareLink.split('/').pop();
  try {
    const jsonString = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonString);
  } catch (_) {
    console.error('Invalid share link');
    return null;
  }
};


const apiUrl = 'https://spoo.me';

const payload = {};

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export const getShortLink = async (url) => fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ ...payload, url }),
  })
    .then(async response => {
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${error}`);
      }
      console.log(response.json());
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => {
      console.warn('Error:', error);
      return url;
    });

