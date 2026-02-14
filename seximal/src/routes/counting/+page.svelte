<script lang="ts">
	import Checkbox from "$lib/components/reuseable/Checkbox.svelte";
	import { baseState } from "$lib/globalState.svelte";
	import { isPrime } from "$lib/mathstuff.svelte";
    let base = $derived(baseState.base);

    const ROWS = 180;
    const maxValue = $derived(ROWS * base);

    let checkPrime = $state(false);
    let checkSquare = $state(false);

    let multiplesOfValue = $state("");
    let multiplesOf = $derived(parseInt(multiplesOfValue, base));
</script>

<div class="container-container">
    <div class="highlighters">
        <Checkbox bind:checked={checkPrime} label="Primes"/>
        <Checkbox bind:checked={checkSquare} label="Squares"/>
        <div>
            <span>Multiples of</span>
            <input type="number"
                id="multiples-of"
                style:width="30px"
                style:margin-left="5px"
                bind:value={multiplesOfValue}
            />
        </div>
    </div>
    <div class="table-container">
        <table>
            <tbody>
                {#each { length: ROWS } as _, row}
                    <tr>
                        {#each { length: base } as _, i}
                            <td class:prime={checkPrime && isPrime(row * base + i + 1)}
                                class:multiple={multiplesOf && (row * base + i + 1) % multiplesOf == 0}
                                class:square={checkSquare && Number.isInteger(Math.sqrt(row * base + i + 1))}
                            >
                                {(row * base + i + 1).toString(base)}
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .container-container {
        display: flex;
        align-items: center;
        flex-direction: column;
    }

	.table-container {
		overflow: auto; /* so the table itself scrolls */
        scrollbar-color: var(--color-bg-2) var(--color-bg-1);
        scrollbar-width: thin;
        height: 73vh;
	}

	table {
		border-collapse: collapse;
		font-family: 'JetBrains Mono', monospace;
		color: var(--color-text-dim);
		font-size: 0.8rem;
		background: rgba(0, 0, 0, 0.3);
	}

	td {
		padding: 4px 10px;
		text-align: center;
		border: 1px solid #222;

        &.prime, &.multiple, &.square {
		    color: var(--color-theme-3);
            background: rgb(from var(--color-theme-3) R G B / 0.2);
		    font-weight: bold;
        }
	}
</style>