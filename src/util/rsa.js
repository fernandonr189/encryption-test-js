import JSEncrypt from "jsencrypt";

export function rsaEncrypt(data, pubkey) {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(pubkey);
  const encrypted = encrypt.encrypt(data);
  return encrypted;
}
