<script>
    import { onMount } from "svelte";
    import { getPubKey, getSeed, sendEncrypted } from "../util/client";
    import { decryptString, encryptString, generateKey } from "../util/aes";
    import { generateRsaPair, rsaDecrypt, rsaEncrypt } from "../util/rsa";

    let count = $state(0);
    let pubkey = $state("");
    const increment = () => {
        console.log("Public key:", pubkey);
    };

    onMount(async () => {
        const { privateKey, publicKey } = generateRsaPair();
        const seed = await getSeed(publicKey);
        const decryptedSeed = rsaDecrypt(seed, privateKey);
        const { key, iv, salt } = await generateKey(decryptedSeed);
        console.log("key hex:", key);
        console.log("iv  hex:", iv);

        const plainTextRequest = {
            message: "Hello, World!",
            count: count,
            ouhyeah: "this is so cool",
        };

        const encrypted = await encryptString(
            JSON.stringify(plainTextRequest),
            key,
            iv,
        );
        console.log("encrypted hex:", encrypted);

        const serverKey = await getPubKey();
        const encryptedKey = rsaEncrypt(key, serverKey);

        let res = await fetch("http://localhost:8080/decrypt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key: encryptedKey,
                ciphertext: encrypted,
                iv: iv,
            }),
        });
        const json_response = await res.json();
        console.log(json_response);

        let re_encrypted = json_response.re_encrypted;
        console.log("re_encrypted:", re_encrypted);

        const decrypted = await decryptString(re_encrypted, key, iv);
        console.log("decrypted:", JSON.parse(decrypted));
    });
</script>

<button onclick={increment}>
    count is {count}
</button>
