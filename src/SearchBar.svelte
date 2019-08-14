<script>
    import { createEventDispatcher } from 'svelte';
    import { onMount } from 'svelte';

    import Bracket from './Bracket.svelte';

    const dispatch = createEventDispatcher();

    let query = '';
    let searchButton;
    let searchInput;

    onMount(() => {
        searchInput.onkeyup = (evt) => {
            if (evt.keyCode === 13) {
                searchButton.click();
            }
        }
    });

</script>

<Bracket>
    <div slot='center'>
        <input bind:this={searchInput} bind:value={query} type="text" placeholder="Search here.">
        <button bind:this={searchButton} on:click={() => dispatch('search', query)}>Search</button>
    </div>
</Bracket>