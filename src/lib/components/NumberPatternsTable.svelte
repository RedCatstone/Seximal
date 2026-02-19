<script lang="ts">
	import Checkbox from "$lib/components/reuseable/Checkbox.svelte";
	import { STORED_STATE } from "$lib/globalState.svelte";
	import { isHarshad, isPrime } from "$lib/mathstuff.svelte";
    const base = $derived(STORED_STATE.base);

    let rows = $state(360);

    let checkPrime = $state(false);
    let checkSquare = $state(false);
    let checkHashard = $state(false);

    let multiplesOfValue = $state("");
    let multiplesOf = $derived(parseInt(multiplesOfValue, base));
</script>

<div class="container-container">
    <h1>Number Patterns</h1>
    <div class="highlighter-toggles">
        <Checkbox bind:checked={checkPrime} label="Primes"/>
        <Checkbox bind:checked={checkSquare} label="Squares"/>
        <Checkbox bind:checked={checkHashard} label="Hashard"/>
        <div style:display="flex" style:align-items="center">
            <span>Multiples of</span>
            <input type="number"
                id="multiples-of"
                style:width="30px"
                style:height="25px"
                style:margin-left="5px"
                bind:value={multiplesOfValue}
            />
        </div>
    </div>
    <div class="table-container">
        <table>
            <tbody>
                {#each { length: rows } as _, row}
                    <tr>
                        {#each { length: base } as _, col}
                            {@const val = row * base + col + 1}
                            <td class:prime={checkPrime && isPrime(val)}
                                class:multiple={multiplesOf && val % multiplesOf == 0}
                                class:square={checkSquare && Number.isInteger(Math.sqrt(val))}
                                class:hashard={checkHashard && isHarshad(val)}
                            >
                                {val.toString(base)}
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
        <button onclick={() => rows += 360} style:font-size="1.3rem">Add more Rows!</button>
    </div>
</div>

<style>
    .highlighter-toggles {
		font-size: 0.8rem;
		color: var(--color-text-dim);
		letter-spacing: 0.5px;
        
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        & > :global(*):not(:first-child) {
            border-left: 2px solid var(--color-bg-1);
            padding-left: 10px;
        }
    }

    .container-container {
        display: flex;
        align-items: center;
        flex-direction: column;
    }
</style>