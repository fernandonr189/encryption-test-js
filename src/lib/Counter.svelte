<script>
    import { onMount } from "svelte";
    import { getPubKey, getSeed, sendEncrypted } from "../util/client";
    import { encryptString, generateKey } from "../util/aes";
    import { generateRsaPair, rsaDecrypt } from "../util/rsa";

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

        const encrypted = await encryptString("Hello, World!", key, iv);
        console.log("encrypted hex:", encrypted);
    });
</script>

<button onclick={increment}>
    count is {count}
</button>
