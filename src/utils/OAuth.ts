export const urlBase64Encode = (text: string) => {
  return btoa(text)
    .replace(/\+/g, '-') // `+` durch `-` ersetzen
    .replace(/\//g, '_') // `/` durch `_` ersetzen
    .replace(/=+$/, ''); // `=` am Ende entfernen (Padding entfernen)
}

const generateCodeVerifier = (): string => {
  const array = new Uint8Array(128); // RFC 7636 empfiehlt eine zufällige Zeichenfolge zwischen 43 und 128 Zeichen
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => String.fromCharCode(33 + (byte % 94))).join('');
}

const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return urlBase64Encode(base64Digest);
}

export const generatePkcePair = async (): Promise<{ codeVerifier: string, codeChallenge: string }> => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  return { codeVerifier, codeChallenge };
}

export const generateState = () => {
  const array = new Uint32Array(10); // Creates an array of random numbers
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => dec.toString(16)).join(''); // Convert to hex string
};
