<script>
	import BackToDecimal from "$lib/components/counting/BackToDecimal.svelte";
	import Pronounciation from "$lib/components/counting/Pronounciation.svelte";
	import TallyMarks from "$lib/components/counting/TallyMarks.svelte";
	import NumberPatternsTable from "$lib/components/NumberPatternsTable.svelte";
	import NumberScroller from "$lib/components/reuseable/NumberScroller.svelte";
	import TimesTable from "$lib/components/TimesTable.svelte";
	import { STORED_STATE } from "$lib/globalState.svelte";

	let value = $state(2);
</script>

<svelte:head>
	<title>{STORED_STATE.baseName} Counting</title>
	<meta name="description" content="Number counting in base {STORED_STATE.baseName}. Finger-counting, tally-marks, converting bases and divisibility rules for any number in any base." >
</svelte:head>

<main>
    <div class="sticky-boundary">
		<div class="scroller">
			<NumberScroller bind:value={value} />
		</div>
		<BackToDecimal {value} />
		<Pronounciation {value} />
		<TallyMarks {value} />
	</div>

	<TimesTable />
	<NumberPatternsTable />
</main>

<style>
	.sticky-boundary {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-bottom: 100px;

		& .scroller {
			position: sticky;
			top: 80px;
			width: 100%;
			z-index: 1;
		}
	}
</style>