<script>
	import Calculator from "$lib/components/Calculator.svelte";
	import { STORED_STATE } from "$lib/globalState.svelte";
</script>

<svelte:head>
	<title>{STORED_STATE.baseName} Calculator</title>
	<meta name="description" content="{STORED_STATE.baseName} Scientific Calculator. Technically this is also a base-converter." />
</svelte:head>

<Calculator />