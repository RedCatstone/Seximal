<script>
	import NumberPatternsTable from "$lib/components/NumberPatternsTable.svelte";
	import TimesTable from "$lib/components/TimesTable.svelte";
	import { STORED_STATE } from "$lib/globalState.svelte";
</script>

<svelte:head>
	<title>{STORED_STATE.baseName} Patterns</title>
	<meta name="description" content="Mathy number pataterns in base {STORED_STATE.baseName}. Also lets you see and generate divisibility rules for any number in any base." >
</svelte:head>

<main class="container"style:display="flex" style:flex-direction="column" style:gap="40px" style:margin-bottom="60px">
	<NumberPatternsTable />
	<TimesTable />
</main>