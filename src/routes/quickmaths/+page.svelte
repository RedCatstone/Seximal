<script>
	import QuickMaths from "$lib/components/QuickMaths.svelte";
	import { STORED_STATE } from "$lib/globalState.svelte";
</script>

<svelte:head>
	<title>{STORED_STATE.baseName} Quick Maths</title>
</svelte:head>

<QuickMaths />