import { rsaEncrypt } from "./rsa";

export async function getPubKey() {
  let response = await fetch("http://localhost:8080/pubkey");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  let data = await response.json();

  return data.pubkey;
}

export async function sendEncrypted(data, pubkey) {
  const encryptedData = rsaEncrypt(data, pubkey);

  const body = JSON.stringify({ data: encryptedData });

  let response = await fetch("http://localhost:8080/test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  let responseData = await response.json();

  return responseData;
}
