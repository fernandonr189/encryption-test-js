<script>
    import { onMount } from "svelte";
    import { getPubKey, sendEncrypted } from "../util/client";

    let count = $state(0);
    let pubkey = $state("");
    const increment = () => {
        console.log("Public key:", pubkey);
    };

    onMount(async () => {
        pubkey = await getPubKey();
        await sendEncrypted("Hello, World!", pubkey);
    });
</script>

<button onclick={increment}>
    count is {count}
</button>
