<script>
	import NumberPatternsTable from "$lib/components/NumberPatternsTable.svelte";
	import TimesTable from "$lib/components/TimesTable.svelte";
	import { STORED_STATE } from "$lib/globalState.svelte";
</script>

<svelte:head>
	<title>{STORED_STATE.baseName} Counting</title>
	<meta name="description" content="Number counting in base {STORED_STATE.baseName}. Finger-counting, tally-marks, converting bases and divisibility rules for any number in any base." >
</svelte:head>

<main class="container"style:display="flex" style:flex-direction="column" style:gap="40px" style:margin-bottom="60px">
	<NumberPatternsTable />
	<TimesTable />
</main>