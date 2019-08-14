<script>
    import Stack from './Stack.svelte';
    import Sidebar from './Sidebar.svelte';

    export let item;
</script>

<style>
    h5 {
        font-size: var(--s0);
    }
    img {
        width: var(--s5);
    }
</style>

<Sidebar>
    <div slot='sidebar'>
        <a href={item.href} target="blank"><img src={item.img} alt={`image of ${item.title}`}></a>
    </div>
    <div slot='not-sidebar'>
        <Stack>
            <a href={item.href} target="blank"><h5>{item.title}</h5></a>
            <p>{item.price + ' €'}</p>
        </Stack>
    </div>
</Sidebar>
