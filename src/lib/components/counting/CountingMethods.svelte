<script lang="ts">
	import { STATE } from '$lib/globalState.svelte';

	const { value }: { value: number } = $props();
	const absV = $derived(Math.abs(value));

	const tallyGroupSize = $derived([6, 5, 4, 3, 2].find(x => STATE.base % x === 0) ?? 1);
	const TALLY_WIDTH = 9;
	const TALLY_HEIGHT = 40;
	const MAX_TALLY_MARKS_DRAWN = 100;

	const handsPer10 = $derived(Math.ceil((STATE.base - 1) / 5));

	const fingers = $derived.by(() => {
		let L = [false, false, false, false, false]; // Pinky, Ring, Middle, Index, Thumb
		let R = [false, false, false, false, false]; // Thumb, Index, Middle, Ring, Pinky
		let max;
		let description;

		if (STATE.base === 2) {
			for (let i = 0; i < 5; i++) R[    i] = ((absV >> i) & 1) === 1;
			for (let i = 0; i < 5; i++) L[4 - i] = ((absV >> (i + 5)) & 1) === 1;
			max = 2**11 - 1;
			description = "A finger up is a 1, a finger down is a 0. (other people need to know where left/right is.)";
		}
		else if (handsPer10 == 1) {
			const ones = absV % STATE.base;
			const tens = Math.floor(absV / STATE.base);
			R = moveXFingersUp(ones);
			L = moveXFingersUp(tens);
			max = STATE.base * 6 - 1;
			description = "A finger on the right hand is worth 1, a finger on the left hand is worth 10. This is literally showing a 2-digit number!\
				(other people need to know where left/right is.)";
		}
		else {
			R = moveXFingersUp(absV);
			L = moveXFingersUp(absV - 5);
			max = 10;
			description = "Every finger is worth exactly 1.";
		}

		return { L, R, description, max }
	});

	function moveXFingersUp(x: number): boolean[] {
		if (x <= 0) return [false, false, false, false, false];
		if (x == 1) return [false, false, false, true, false];
		if (x == 2) return [false, false, true, true, false];
		if (x == 3) return [false, true, true, true, false];
		if (x == 4) return [true, true, true, true, false];
		return [true, true, true, true, true];
	}

	function generateAsciiHand(f: boolean[]): string {
//   | | |
// | | | |  
// |_|_|_|  /
// ( ' ' |,/
// \______/
		return `\
   1 2 3   
 0 1 2 3   
 0_1_2_3  4
 ( ' ' |_4 
 \\______/  `
.replaceAll('0', f[0] ? '|' : ' ')
.replaceAll('1', f[1] ? '|' : ' ')
.replaceAll('2', f[2] ? '|' : ' ')
.replaceAll('3', f[3] ? '|' : ' ')
.replaceAll('4', f[4] ? '/' : ' ')
	}

	function mirrorAscii(ascii: string): string {
		return ascii
			.split('\n')
			.map(line => line
				.split('').reverse().join('')
				.replaceAll('(', ')')
				.replaceAll('\\', '*') // temp swap char
				.replaceAll('/', '\\')
				.replaceAll('*', '/')
			).join('\n');
	}

	function zipAsciiHands(leftFingers: boolean[], rightFingers: boolean[]): string {
        const leftAscii = generateAsciiHand(leftFingers).split('\n');
        const rightAscii = mirrorAscii(generateAsciiHand(rightFingers)).split('\n');
        // zip them together with some spacing in the middle
        return leftAscii.map((leftLine, i) => `${leftLine}    ${rightAscii[i]}`).join('\n');
    }
</script>

<div class="module">
	<h3>Counting Methods</h3>
	<p>A {STATE.baseName} tally mark group would be made of <strong>{tallyGroupSize.toString(STATE.base)}</strong> strokes.</p>

	<div class="tally-display in-module">
		{#if value < 0}<span style:font-size="2.5rem">-</span>{/if}
		<!-- this loops for each tally group we need -->
		{#each { length: Math.min(Math.ceil(absV / tallyGroupSize), MAX_TALLY_MARKS_DRAWN) } as _, g}
			{@const strokesThisGroup = Math.min(tallyGroupSize, absV - g * tallyGroupSize)}
			<div class="tally-group">
				<svg viewBox="0 0 {strokesThisGroup * TALLY_WIDTH} {TALLY_HEIGHT}">
					{#each { length: strokesThisGroup } as _, i}
						{#if i !== tallyGroupSize - 1}
							<!-- vertical sticks -->
							<line
								class="stick"
								x1={(i + 0.5) * TALLY_WIDTH}
								x2={(i + 0.75) * TALLY_WIDTH}
								y1={TALLY_HEIGHT}
								y2="0"
							/>
						{:else}
							<!-- diagonal strike -->
							<line
								class="strike"
								x1="0"
								x2={(tallyGroupSize - 0.75) * TALLY_WIDTH}
								y1={TALLY_HEIGHT * 0.75}
								y2={TALLY_HEIGHT * 0.25}
							/>
						{/if}
					{/each}
				</svg>
			</div>
		{/each}
		{#if Math.ceil(Math.abs(value) / tallyGroupSize) > MAX_TALLY_MARKS_DRAWN}
			<span style:font-size="2.5rem">...</span>
		{/if}
	</div>

	<p>Finger counting in {STATE.baseName}:<br>{fingers.description}
	<br>This can count up to: <strong>{fingers.max.toString(STATE.base)}</strong></p>
	<pre class="in-module" class:overflown={absV > fingers.max}>{zipAsciiHands(fingers.L, fingers.R)}</pre>
	{#if absV > fingers.max}
		<span>TOO LARGE...</span>
	{/if}
</div>

<style>
	.tally-display {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		min-height: 50px;
		max-height: 200px;
		overflow-y: auto;
		margin-bottom: 30px;

		& .tally-group {
			height: 50px;
			display: flex;
			align-items: center;

			& svg {
				height: 90%;
				overflow: visible;

				& .stick, & .strike {
					stroke: var(--color-text);
					stroke-width: 3;
					stroke-linecap: round;
				}
			}
		}
	}

	pre {
		border: 1px solid var(--color-bg-1);
		border-radius: 10px;
		color: var(--color-theme-dyn);
		font-size: 1rem;
        text-align: center;

		&.overflown {
	        filter: blur(2px);
	    }
	}
</style>
