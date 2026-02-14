<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SwitchBase from '$lib/components/SwitchBase.svelte';
	import NavBar from '$lib/components/NavBar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


<SwitchBase />

<NavBar />

{@render children()}
