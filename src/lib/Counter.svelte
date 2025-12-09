<script>
    import { onMount } from "svelte";
    import { getPubKey, sendEncrypted } from "../util/client";
    import { generateKey } from "../util/aes";

    let count = $state(0);
    let pubkey = $state("");
    const increment = () => {
        console.log("Public key:", pubkey);
    };

    onMount(async () => {
        pubkey = await getPubKey();
        await sendEncrypted("Hello, World!", pubkey);

        generateKey();
    });
</script>

<button onclick={increment}>
    count is {count}
</button>
