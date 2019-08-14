<script>
    import Item from './Item.svelte';
    import Stack from './Stack.svelte';

    export let list = [];
</script>

<Stack>
    {#each list as item}
        <Item {item}></Item>
    {:else}
        <p>Try searching something!</p>
    {/each}
</Stack>