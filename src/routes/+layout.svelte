<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SwitchBase from '$lib/components/SwitchBase.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import { STORED_STATE } from '$lib/globalState.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Default site title (if i forgot to put a custom one) -->
	<title>Base {STORED_STATE.baseName}</title>

	<!-- SEO yay -->
	<meta name="description" content={"Explore the beauty of different number-bases: (Seximal, Dozenal, Binary, Ternary, Quaternary, ...). \
Includes a Scientific Calculator, Quick Maths, Number-pattern Grid and Counting! Seximal (Base 6) is objectively the best/most natural number system."} />
    <meta property="og:title" content="Seximal - Numberbase Stuff" />
    <meta property="og:description" content="Seximal (Base 6) is objectively the best/most natural number system." />
	<meta name="theme-color" content="#f1ad46" />
</svelte:head>


<SwitchBase />

<NavBar />

{@render children()}
