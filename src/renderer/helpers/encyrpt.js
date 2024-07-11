

export async function deriveKey(passphrase, salt) {
    let crypto = window.crypto
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  }


  export async function encryptPrivateKey(derivedKey, privateKey) {
    let crypto = window.crypto
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const encoder = new TextEncoder();
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      derivedKey,
      encoder.encode(privateKey)
    );
    return {
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(encryptedData)))
    };
  }


  export async function decryptPrivateKey(derivedKey, encrypted) {
    let crypto = window.crypto
    const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));
    const encryptedData = Uint8Array.from(atob(encrypted.data), c => c.charCodeAt(0));
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      derivedKey,
      encryptedData
    );
    return new TextDecoder().decode(decryptedData);
  }