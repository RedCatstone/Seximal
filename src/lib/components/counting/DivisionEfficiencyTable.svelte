<script lang="ts">
    import { STATE } from "$lib/globalState.svelte";
	import { toFixedBase } from "$lib/mathstuff.svelte";
	import { getBaseName } from "$lib/otherMisc";
	import Checkbox from "../reuseable/Checkbox.svelte";

    type Reciprocal = { leading0s: number, terminating: string, repeating: string };

    function analyzeReciprocal(n: number, base: number): Reciprocal {
        const remainders = new Map<number, number>();
        let digitsStr = "";
        let remainder = 1 % n;
        
        // long division!!!
        // stop if remainder is 0 (terminating) or we see a remainder again (repeating)
        while (remainder !== 0 && !remainders.has(remainder)) {
            // track where this remainder first appeared
            remainders.set(remainder, digitsStr.length);

            const val = remainder * base;
            // Convert digit to base string (e.g. 11 -> 'b' in hex)
            digitsStr += Math.floor(val / n).toString(base);

            remainder = val % n;
        }

        if (remainder === 0) {
            // Terminating fraction
            return { ...stripLeading0s(digitsStr), repeating: "" };
        } else {
            // Repeating fraction
            const repeatStart = remainders.get(remainder)!;
            return { 
                ...stripLeading0s(digitsStr.substring(0, repeatStart)), 
                repeating: digitsStr.substring(repeatStart) 
            };
        }
    }

    function stripLeading0s(terminating: string) {
        let leading0s = 0;
        for (const c of terminating) {
            if (c === '0') leading0s++;
            else break;
        }
        return { leading0s, terminating: terminating.slice(leading0s) }
    }

    function calculateBaseScore(base: number) {
        let totalScore = 0;
        for (const n of tableFractions) {
            const { terminating, repeating } = analyzeReciprocal(n, base);

            // Penalty logic: 
            // 1 digit terminating = 0 penalty (perfect)
            // 2 digits = 1 penalty
            // Repeating = heavy penalty
            const penalty = Math.max(0, terminating.length - 1) + (5 * Math.log(repeating.length + 1));
            totalScore += (1 / n**2) * penalty;
        }
        return totalScore;
    }
    
    let includeOddBases = $state(false);
    let tableFractionAmount = $state(27);
    $effect(() => { STATE.base; tableFractionAmount = 27 })

    const tableBases = $derived(Array.from({ length: 35 }, (_, i) => i + 2).filter(x => includeOddBases || x % 2 == 0));
    const tableFractions = $derived(Array.from({ length: tableFractionAmount - 1 }, (_, i) => i + 2));

</script>

<div class="module">
    <h3>Division Efficiency</h3>
    <p>Division is very important when looking how easy math in a certain base is.
        If 1/3 is a simple decimal in some base, then 3 is an easy number to calculate with in that base.
        <br>The score is calculated by going through each 1/n and calculating: <strong>(1/n²) * (blueDigitAmount + 5 log(redDigitAmount + 1))</strong>, then summing all of those.
        <br>That formula is completely abrituary, BUT it gives a pretty good first look at how good a base is. (lower score is better)
    </p>
    <div class="table-container">
    	<table>
    		<tbody>
    			<tr>
                    <td></td>
                    <th>Score</th>
                    {#each tableFractions as tFraction}
                        <!-- / ⁄ -->
                        <th>1/{tFraction.toString(STATE.base)}</th>
                    {/each}
                </tr>
                {#each tableBases as tBase}
                    <tr class:active={tBase === STATE.base}>
                        <th class="base-header">{getBaseName(tBase)}</th>
                        <td class="score highlighted">{toFixedBase(calculateBaseScore(tBase), STATE.base, 2)}</td>
                        {#each tableFractions as tFraction}
                            {@const r = analyzeReciprocal(tFraction, tBase)}
                            <td>
                                0.{'0'.repeat(r.leading0s)}{r.terminating[0]}<span class="terminating">{r.terminating.slice(1)}</span><span class="repeating">{r.repeating}</span>
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
        
	    <div style:display="flex">
            <Checkbox bind:checked={includeOddBases} label={`Include odd (BAD) Bases`} />
            <div class="size-buttons">
	        	<button onclick={() => (tableFractionAmount += 27)} style:font-size="1rem">Bigger</button>
            </div>
	    </div>
    </div>
</div>


<style>
    .base-header {
        max-width: 70px;
        font-size: 0.6rem;
        overflow: hidden;
        text-wrap-mode: nowrap;
    }

    .repeating {
        border-top: 1px solid var(--color-theme-red);
        color: var(--color-theme-red);
    }
    .terminating {
        color: var(--color-theme-blue);
    }

    .size-buttons {
        position: absolute;
        right: 0;
    }
</style>