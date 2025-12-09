// @ts-nocheck
import JSEncrypt from "jsencrypt";
import hkdf from "js-crypto-hkdf";
import aesjs from "aes-js";

async function getSeed(pubkey) {
  let response = await fetch("http://localhost:8080/seed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pubkey: pubkey }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();

  return json.seed;
}

// base64 -> Uint8Array
function base64ToBytes(b64) {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

// hex helper (optional, for logging)
function toHex(u8) {
  return Array.from(u8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toBytes(str) {
  return new TextEncoder().encode(str);
}

export async function encryptString(str, key, iv) {
  const encrypted = await encryptAESCBC(str, key, iv);
  return encrypted;
}

export async function generateKey() {
  let crypt = new JSEncrypt({ default_key_size: 2048 });
  const privateKey = crypt.getPrivateKey();
  const publicKey = crypt.getPublicKey();
  const seed = await getSeed(publicKey);
  crypt.setPrivateKey(privateKey);
  const decrypted = crypt.decrypt(seed);
  console.log("Decrypted Seed:", decrypted);

  const { key, iv, salt } = await deriveKeyAndIvFromSeed(decrypted);

  return { key: toHex(key), iv: toHex(iv), salt: toHex(salt) };
}

/**
 * Derive AES-256 key (32 bytes) + 16-byte IV from a seed using js-crypto-hkdf.
 * @param {string|Uint8Array} seed - base64 string OR Uint8Array (IKM)
 * @param {string|null} saltStrOrNull - optional salt as UTF-8 string; pass null to let hkdf.generate a salt
 * @param {string} infoStr - info/context label (must be string). Default 'aes-cbc'
 * @returns {Promise<{key: Uint8Array, iv: Uint8Array, salt: Uint8Array}>}
 */
export async function deriveKeyAndIvFromSeed(
  seed,
  saltStrOrNull = "default-salt",
  infoStr = "aes-cbc",
) {
  // ensure master is Uint8Array
  let master;
  if (typeof seed === "string") {
    // assume base64 seed (your decrypted seed should be base64)
    master = base64ToBytes(seed);
  } else if (seed instanceof Uint8Array) {
    master = seed;
  } else {
    throw new TypeError("seed must be a base64 string or Uint8Array");
  }

  // salt: convert string -> Uint8Array, or pass null to ask hkdf to generate a salt
  let saltBytes = null;
  if (saltStrOrNull !== null) {
    // TextEncoder may exist; fallback to simple ascii
    if (typeof TextEncoder !== "undefined") {
      saltBytes = new TextEncoder().encode(saltStrOrNull);
    } else {
      const out = new Uint8Array(saltStrOrNull.length);
      for (let i = 0; i < saltStrOrNull.length; i++)
        out[i] = saltStrOrNull.charCodeAt(i) & 0xff;
      saltBytes = out;
    }
  }

  // call hkdf.compute:
  // note: signature is (master, hash?, length?, info?, salt?)
  // we want 48 bytes (32 key + 16 iv)
  const desiredLen = 48;
  const hkdfResponse = await hkdf.compute(
    master,
    "SHA-256",
    desiredLen,
    infoStr,
    saltBytes,
  );
  // hkdfResponse.key is Uint8Array of length desiredLen
  // hkdfResponse.salt is Uint8Array (the salt used; may be generated if you passed null)

  const okm = hkdfResponse.key;
  const key = okm.slice(0, 32); // AES-256 key
  const iv = okm.slice(32, 48); // 16-byte IV

  return { key, iv, salt: hkdfResponse.salt };
}

function encryptAESCBC(plaintext, keyHex, ivHex) {
  const keyBytes = aesjs.utils.hex.toBytes(keyHex); // 32 bytes
  const ivBytes = aesjs.utils.hex.toBytes(ivHex); // 16 bytes

  const textBytes = aesjs.utils.utf8.toBytes(plaintext);

  // PKCS7 padding
  const padded = aesjs.padding.pkcs7.pad(textBytes);

  const aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, ivBytes);
  const encryptedBytes = aesCbc.encrypt(padded);

  // Return hex ciphertext
  return aesjs.utils.hex.fromBytes(encryptedBytes);
}
