// @ts-nocheck
import JSEncrypt from "jsencrypt";

export function rsaEncrypt(data, pubkey) {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(pubkey);
  const encrypted = encrypt.encrypt(data);
  return encrypted;
}

export function rsaDecrypt(data, privkey) {
  const decrypt = new JSEncrypt();
  decrypt.setPrivateKey(privkey);
  const decrypted = decrypt.decrypt(data);
  return decrypted;
}

export function generateRsaPair() {
  let crypt = new JSEncrypt({ default_key_size: 2048 });
  const privateKey = crypt.getPrivateKey();
  const publicKey = crypt.getPublicKey();

  return { privateKey, publicKey };
}
