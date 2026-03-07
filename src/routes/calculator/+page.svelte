<script>
	import Calculator from '$lib/components/Calculator.svelte';
	import { STATE } from '$lib/globalState.svelte';
</script>

<svelte:head>
	<title>{STATE.baseName} Calculator</title>
	<meta name="description" content={`${STATE.baseName} Scientific Calculator. Equipped with a base-converter and a bunch of base-specific operations:\
Logarithms, Digitsums, Pronounciation, Percentages, Prime Factorization, Reciprocals and some constants.`} />
</svelte:head>

<main>
	<span>Do some calculations and see what happens when you switch the base at the top!</span>
	<Calculator />
</main>