import { sessionService } from 'src/db/sessionService.js';

export const generateShareLink = async (solveId) =>  {
  const data = await sessionService.getSolveWithReconstructionBySolveId(solveId);
  const jsonString = JSON.stringify(data);
  console.log(jsonString);
  const encoded = btoa(unescape(encodeURIComponent(jsonString)));
  return `${encoded}`;
};

export const parseShareLink = (shareLink) =>{
  const base64 = shareLink.split('/').pop();
  try {
    const jsonString = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Invalid share link');
    return null;
  }
};