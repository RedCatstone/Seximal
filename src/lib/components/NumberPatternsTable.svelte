<script lang="ts">
	import Checkbox from "$lib/components/reuseable/Checkbox.svelte";
	import { STATE } from "$lib/globalState.svelte";
	import { gcd, isHarshad, isPrime, primeFactors, isHappyNumber, displayOrArray } from "$lib/mathstuff.svelte";

    const { multiplesOf }: { multiplesOf: number } = $props(); 

    let rows = $derived(STATE.base * 0 + 36);
    
    type HighlighterMode = null | 'prime' | 'square' | 'harshard' | 'happy' | 'multiples' /* multiples of */;
    let mode: HighlighterMode = $state('multiples');

    function changeMode(newMode: HighlighterMode) {
        if (mode != newMode) mode = newMode;
        else mode = null;
    }
</script>

<div class="module">
    <h1>Number Patterns</h1>
    <div class="above-pattern-table">
        <div class="highlighter-toggles">
            <div><Checkbox checked={mode === 'prime'} onchange={() => changeMode('prime')} label="Primes"/></div>
            <div><Checkbox checked={mode === 'square'} onchange={() => changeMode('square')} label="Squares"/></div>
            <div><Checkbox checked={mode === 'harshard'} onchange={() => changeMode('harshard')} label="Harshard"/></div>
            <div><Checkbox checked={mode === 'happy'} onchange={() => changeMode('happy')} label="Happy"/></div>
            <div><Checkbox checked={mode === 'multiples'} onchange={() => changeMode('multiples')} label="Multiples Of {multiplesOf.toString(STATE.base)}"/></div>
        </div>
        {#if mode == 'prime' }
            <span><strong>Primes</strong> - Divisible only by 1 and itself.</span>
            <span><br>All integers have a prime factorization, for 10 in {STATE.baseName} its
                <strong>{primeFactors(STATE.base).map(x => x.toString(STATE.base)).join(' * ')}</strong>.
            </span>
            <span><br>{STATE.baseName}, primes larger than 10 must end in {displayOrArray(
                Array.from({ length: STATE.base }, (_, i) => i)
                    .filter(d => gcd(d, STATE.base) === 1)
            )}.</span>
            {#if STATE.base === 6}<span>(All primes other than 2 and 3 can be made using: <strong>6n ± 1</strong>, which fits seximal perfectly.)</span>{/if}

        {:else if mode == 'square' }
            <span><strong>Squares</strong> - The results of integers multiplied by themselves (n²).</span>
            <span><br>{STATE.baseName} squares must end in {displayOrArray(
                [...new Set(
                    Array.from({ length: STATE.base }, (_, i) => i**2 % STATE.base)
                )].sort((a, b) => a - b)
                )}.</span>

        {:else if mode == 'harshard' }
            <span><strong>Harshards</strong> - (Sanskrit for "joy-giver") - Integers divisible by the sum of their digits.</span>
            <br><span class="example">{((STATE.base - 1) * 2).toString(STATE.base)} is Harshad because it's divisible by (1 + {(STATE.base - 2).toString(STATE.base)}) which is {(STATE.base - 1).toString(STATE.base)}.</span>
            
        {:else if mode == 'happy' }
            <span><strong>Happy Numbers</strong> - Integers, where summing the squares of their digits over and over again eventually hits <strong>1</strong>.</span>
            <br><span class="example">10 is Happy because 1² + 0² = 1.</span>
            {#if STATE.base === 4 || STATE.base === 2}<span><br>All numbers are happy, yay!</span>{/if}
            
        {:else if mode === 'multiples'}
            <span>Scroll the scroller above to select a multiple number!</span>
        {/if}
    </div>
    <div class="table-container">
        <table>
            <tbody>
                {#each { length: rows } as _, row}
                    <tr>
                        {#each { length: STATE.base } as _, col}
                            {@const val = row * STATE.base + col + 1}
                            <td class:highlighted={
                                mode === 'prime' && isPrime(val)
                                || mode === 'square' && Number.isInteger(Math.sqrt(val))
                                || mode === 'harshard' && isHarshad(val)
                                || mode == 'happy' && isHappyNumber(val)
                                || mode == 'multiples' && val % multiplesOf === 0
                            }>
                                {val.toString(STATE.base)}
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
        <button onclick={() => rows += 36} style:font-size="1.3rem">Bigger Table</button>
    </div>
</div>

<style>
    .above-pattern-table {
        padding: 8px 0px;
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

        border-bottom: 2px solid var(--color-bg-2);
        margin-bottom: 2px;
    }

    .example {
        color: var(--color-text-kinda-dim);
        margin-left: 30px;
    }
</style>