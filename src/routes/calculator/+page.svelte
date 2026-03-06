<script>
	import Calculator from "$lib/components/Calculator.svelte";
	import { STORED_STATE } from "$lib/globalState.svelte";
	import { displayOrArray, gcd } from "$lib/mathstuff.svelte";
	const base = $derived(STORED_STATE.base);

	const baseTerminatingNumbers = $derived(Array.from({ length: base }, (_, i) => i + 1).filter(x => x === 1 || gcd(x, base) !== 1));
	const decBadNums = $derived(baseTerminatingNumbers.filter(x => x !== 1 && gcd(x, 10) === 1));
</script>

<svelte:head>
	<title>{STORED_STATE.baseName} Calculator</title>
	<meta name="description" content="{STORED_STATE.baseName} Scientific Calculator. Technically this is also a base-converter." />
</svelte:head>

<main>
	<span>
		Do some calculations and see what happens when you switch the base at the top!
		<br>In {STORED_STATE.baseName}, division by <strong>{displayOrArray(baseTerminatingNumbers)}</strong> always produces a terminating number.
		{#if decBadNums.length}In Decimal, {displayOrArray(decBadNums)} would results in infinite cycles...{/if}
	</span>
	<Calculator />
</main>