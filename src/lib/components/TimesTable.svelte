<script lang="ts">
	import { STATE } from '$lib/globalState.svelte';
	import { displayNumber, doInfixCalc, infixOpNames, type InfixOperator } from '$lib/mathstuff.svelte';
	import Checkbox from './reuseable/Checkbox.svelte';

	let tableSize = $derived(STATE.base);
	let curr_op: InfixOperator = $state('×');
	const ops: InfixOperator[] = ['×', '+', '-', '÷', '^' /* 'mod', 'log_' */];
	function cycleOp() {
		curr_op = ops[(ops.indexOf(curr_op) + 1) % ops.length];
	}
	let highlightReqMem = $state(false);
</script>

<div class="module">
	<h1>{infixOpNames[curr_op]} Table</h1>
	<div class="table-container">
		<table>
			<tbody>
				<tr>
					<!-- Header Row -->
					<th>
						<button class="dyn" onclick={cycleOp} style:font-size="2rem">{curr_op}</button>
					</th>
					{#each { length: tableSize } as _, headerColumn}
						<th>{(headerColumn + 1).toString(STATE.base)}</th>
					{/each}
				</tr>
				{#each { length: tableSize } as _, row}
					<tr>
						<!-- First element of each row is another header -->
						<th>{(row + 1).toString(STATE.base)}</th>
						{#each { length: tableSize } as _, col}
							<td
								class:highlighted={highlightReqMem &&
									curr_op === '×' &&
									row <= col &&
									row !== 0 &&
									(col + 1) % STATE.base !== 0 &&
									(row + 1) % STATE.base !== 0}
								class:dim={['×', '+'].includes(curr_op) && row > col}
							>
								{displayNumber(doInfixCalc(row + 1, curr_op, col + 1))}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
		<div style:display="flex">
			<button onclick={() => (tableSize += 3)} style:font-size="1rem">Bigger</button>
			<!-- <button onclick={() => (tableSize -= 3)} style:font-size="1rem" class:disabled={tableSize <= base}>Smaller</button> -->
		</div>
		{#if curr_op === '×'}
			<Checkbox bind:checked={highlightReqMem} label={`Requires Memorization (${(((STATE.base - 2) * (STATE.base - 1)) / 2).toString(STATE.base)})`} />
		{/if}
	</div>
</div>