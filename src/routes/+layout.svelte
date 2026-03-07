<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SwitchBase from '$lib/components/SwitchBase.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import { STATE } from '$lib/globalState.svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { tick } from 'svelte';

	let { children } = $props();

	$effect(() => {
		// update the ?base= param when the base or the url changes
		STATE.base;
		page.url;
		tick().then(() => {
			const url = new URL(page.url);
			url.searchParams.set('base', String(STATE.base));
			replaceState(url, {});
		});

		
		// update the color theme depending on the base
		const hue = (STATE.base * 30 + 200) % 360;
		document.documentElement.style.setProperty('--color-theme-dyn', `hsl(${hue}, 80%, 55%)`);
	});

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Default site title (if i forgot to put a custom one) -->
	<title>Base {STATE.baseName}</title>

	<!-- SEO yay -->
	<meta name="description" content={"Explore the beauty of different number-bases: (Seximal, Dozenal, Hex, Binary, Ternary, Quaternary, ...). \
Includes a Scientific Calculator, Quick Maths, Counting and other cool patterns! Seximal (Base 6) is objectively the best/most natural number system."} />
    <meta property="og:title" content="Seximal - Numberbase Stuff" />
    <meta property="og:description" content="Seximal (Base 6) is objectively the best/most natural number system." />
	<meta name="theme-color" content="#f1ad46" />
</svelte:head>


<SwitchBase />
<NavBar />

<div style="margin-bottom: 100px;">
	{@render children()}
</div>