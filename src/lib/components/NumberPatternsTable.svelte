<script lang="ts">
	import Checkbox from "$lib/components/reuseable/Checkbox.svelte";
	import { STORED_STATE } from "$lib/globalState.svelte";
	import { gcd, isHarshad, isPrime, primeFactors, isHappyNumber, displayOrArray } from "$lib/mathstuff.svelte";
    const base = $derived(STORED_STATE.base);

    const { multiplesOf }: { multiplesOf: number } = $props(); 

    let rows = $derived(base * 0 + 216);
    
    type HighlighterMode = null | 'prime' | 'square' | 'harshard' | 'happy' | 'multiples' /* multiples of */;
    let mode: HighlighterMode = $state('multiples');

    function changeMode(newMode: HighlighterMode) {
        if (mode != newMode) mode = newMode;
        else mode = null;
    }
</script>

<h1>Number Patterns</h1>
<div class="above-pattern-table">
    <div class="highlighter-toggles">
        <div><Checkbox checked={mode === 'prime'} onchange={() => changeMode('prime')} label="Primes"/></div>
        <div><Checkbox checked={mode === 'square'} onchange={() => changeMode('square')} label="Squares"/></div>
        <div><Checkbox checked={mode === 'harshard'} onchange={() => changeMode('harshard')} label="Harshard"/></div>
        <div><Checkbox checked={mode === 'happy'} onchange={() => changeMode('happy')} label="Happy"/></div>
        <div><Checkbox checked={mode === 'multiples'} onchange={() => changeMode('multiples')} label="Multiples Of"/></div>
    </div>
    {#if mode == 'prime' }
        <span><strong>Primes</strong> - Divisible only by 1 and itself.</span>
        <span><br>All integers have a prime factorization, for 10 in {STORED_STATE.baseName} its <strong>{primeFactors(base).map(x => x.toString(base)).join(' * ')}</strong>.</span>
        <span><br>{STORED_STATE.baseName}, primes larger than 10 must end in {displayOrArray(
            Array.from({ length: base }, (_, i) => i)
                .filter(d => gcd(d, base) === 1)
        )}.</span>
        {#if base === 6}<span>(All primes other than 2 and 3 can be made using: <strong>6n ± 1</strong>, which fits seximal perfectly.)</span>{/if}

    {:else if mode == 'square' }
        <span><strong>Squares</strong> - The results of integers multiplied by themselves (n²).</span>
        <span><br>{STORED_STATE.baseName} squares must end in {displayOrArray(
            [...new Set(
                Array.from({ length: base }, (_, i) => i**2 % base)
            )].sort((a, b) => a - b)
            )}.</span>

    {:else if mode == 'harshard' }
        <span><strong>Harshards</strong> - (Sanskrit for "joy-giver") - Integers divisible by the sum of their digits.</span>
        <br><span class="example">{((base - 1) * 2).toString(base)} is Harshad because it's divisible by (1 + {(base - 2).toString(base)}) which is {(base - 1).toString(base)}.</span>
    
    {:else if mode == 'happy' }
        <span><strong>Happy Numbers</strong> - Integers, where summing the squares of their digits over and over again eventually hits <strong>1</strong>.</span>
        <br><span class="example">10 is Happy because 1² + 0² = 1.</span>
        {#if base === 4 || base === 2}<span><br>All numbers are happy, yay!</span>{/if}
    
    {:else if mode === 'multiples'}
        <span>Scroll the scroller above to select a multiple number!</span>
    {/if}
</div>
<div class="table-container">
    <table>
        <tbody>
            {#each { length: rows } as _, row}
                <tr>
                    {#each { length: base } as _, col}
                        {@const val = row * base + col + 1}
                        <td class:highlighted={
                            mode === 'prime' && isPrime(val)
                            || mode === 'square' && Number.isInteger(Math.sqrt(val))
                            || mode === 'harshard' && isHarshad(val)
                            || mode == 'happy' && isHappyNumber(val)
                            || mode == 'multiples' && val % multiplesOf === 0
                        }>
                            {val.toString(base)}
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
    <button onclick={() => rows += 216} style:font-size="1.3rem">Bigger Table</button>
</div>

<style>
    .above-pattern-table {
        padding: 8px 16px;
        background: var(--color-bg-1);
        border-radius: 10px;
        max-width: 500px;
        margin-bottom: 10px;
    }

    .highlighter-toggles {
		font-size: 0.8rem;
		color: var(--color-text-kinda-dim);
		letter-spacing: 0.5px;
        
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 2px;

        & > :global(*):not(:first-child) {
            border-left: 2px solid var(--color-bg-2);
            padding-left: 5px;
        }
        &:not(:last-child) {
            border-bottom: 2px solid var(--color-bg-2);
            margin-bottom: 2px;
        }
    }

    .example {
        color: var(--color-text-kinda-dim);
        margin-left: 30px;
    }
</style>