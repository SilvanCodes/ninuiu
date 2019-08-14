<script>
	import ItemList from './ItemList.svelte';
	import Bracket from './Bracket.svelte';
	import Cover from './Cover.svelte';
	import SearchBar from './SearchBar.svelte';

	export let name;

	let gShopItems;
	let ebayItems;

	async function doSearch({ detail: query }) {
		gShopItems = await fetch(`/api/need/gshop?q=${query}`).then(r => r.json());

		ebayItems = await fetch(`/api/need/ebay?q=${query}`).then(r => r.json());
	}
</script>

<style>
	h1 {
		/* color: white; */
	}

	#logo {
		height: var(--s4);
	}

	#searchbar {
		background: linear-gradient(0.25turn, var(--color-primary), var(--color-secondary));
	}

	#gShop {
		border: var(--s-1) solid var(--color-primary);
		background-color: rgba(var(--color-primary-rgb), 0.4);
		padding: var(--s-1);
	}

	#ebay {
		border: var(--s-1) solid var(--color-secondary);
		background-color: rgba(var(--color-secondary-rgb), 0.4);
		padding: var(--s-1);
	}
</style>

<Cover>

	<div slot='above'>
		<Bracket>

			<div slot="center">
				<h1>Welcome to: New is Nice, Used is Useful.</h1>
			</div>

		</Bracket>
		
		<div id="searchbar">
			<Bracket>

				<div slot="left">
					<img id="logo" src="images/logo.png" alt="niuiu logo">	
				</div>

				<div slot="center">
					
					<SearchBar on:search={doSearch}></SearchBar>
				</div>

			</Bracket>
		</div>
	</div>

	<div slot='center'>
		<Bracket>

			<div slot='center'>
				<Bracket>

					<div id="gShop" slot='left'>
						<Bracket>

							<div slot="center">
								<h1>New</h1>
							</div>

						</Bracket>

						<ItemList list={gShopItems}>
						</ItemList>
					</div>

					<div id="ebay" slot='right'>
						<Bracket>

							<div slot="center">
								<h1>Used</h1>
							</div>

						</Bracket>

						<ItemList id="ebayList" list={ebayItems}>
						</ItemList>
					</div>

				</Bracket>	
			</div>

		</Bracket>
	</div>

</Cover>
