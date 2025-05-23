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

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded'
};

export const getShortLink = async (url) => {
  const payload = new URLSearchParams();
  payload.append('url', url);

  return fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: payload,
  })
    .then(response => response.json())
    .then(data => data?.short_url)
    .catch(error => {
      console.warn('Error:', error);
      return url;
    });
};

