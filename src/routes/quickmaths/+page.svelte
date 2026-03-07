<script>
	import QuickMaths from '$lib/components/QuickMaths.svelte';
	import { STATE } from '$lib/globalState.svelte';
</script>

<svelte:head>
	<title>{STATE.baseName} Quick Maths</title>
	<meta
		name="description"
		content={`Quick maths in base ${STATE.baseName} or any other. It has a timer and really challenges you to learn math in a different number base.`}
	/>
</svelte:head>

<main>
	<QuickMaths />
</main>