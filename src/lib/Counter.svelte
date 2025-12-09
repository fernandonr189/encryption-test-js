<script>
    import { onMount } from "svelte";
    import { getPubKey, sendEncrypted } from "../util/client";
    import { encryptString, generateKey } from "../util/aes";

    let count = $state(0);
    let pubkey = $state("");
    const increment = () => {
        console.log("Public key:", pubkey);
    };

    onMount(async () => {
        pubkey = await getPubKey();
        await sendEncrypted("Hello, World!", pubkey);

        const { key, iv, salt } = await generateKey();
        console.log("key hex:", key);
        console.log("iv  hex:", iv);
        console.log("salt hex:", salt);

        const encrypted = await encryptString("Hello, World!", key, iv);
        console.log("encrypted hex:", encrypted);
    });
</script>

<button onclick={increment}>
    count is {count}
</button>
