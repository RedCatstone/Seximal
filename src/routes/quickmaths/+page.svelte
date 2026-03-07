<script>
	import QuickMaths from '$lib/components/QuickMaths.svelte';
	import { STATE } from '$lib/globalState.svelte';
</script>

<svelte:head>
	<title>{STATE.baseName} Quick Maths</title>
</svelte:head>

<main>
	<QuickMaths />
</main>