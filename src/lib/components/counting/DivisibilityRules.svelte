<script lang="ts">
    import { STORED_STATE } from "$lib/globalState.svelte";
	import { displayOrArray, getTrailingAndCoprime, primePowerComponents } from "$lib/mathstuff.svelte";
	import { divisibilityRules, type DivisibilityRule } from "$lib/otherMisc";
	import Checkbox from "../reuseable/Checkbox.svelte";
    const base = $derived(STORED_STATE.base);

    const { value } = $props();

    let divRulesCombine = $state(true);
    const divRulesCombinable = $derived(primePowerComponents(Math.abs(value)).length !== getTrailingAndCoprime(Math.abs(value)).length);
    const rules = $derived(divisibilityRulesAll(value));

    function divisibilityRulesAll(n: number): [number, DivisibilityRule[]][] {
        n = Math.abs(n);
        const rules: [number, DivisibilityRule[]][] = [];

        let numbers = (n === 0 || n === 1) ? [n]
            : (divRulesCombine ? getTrailingAndCoprime(n) : primePowerComponents(n));

        for (const comp of numbers) {
            rules.push([comp, divisibilityRules(comp, base)]);
        }

        return rules;
    }
</script>

<div class="module">
    <h3>Divisibility Rules</h3>
    <p></p>

    <div class="rules-container">
        {#if rules.length > 1}
            <span>A number is divisible by {value.toString(base)} if its divisible by {displayOrArray(rules.map(([x, _]) => x), "and")}:</span>
        {/if}
        {#each rules as [n, rulesForN]}
            <h3>Rule{rulesForN.length === 1 ? '' : 's'} for {n.toString(base)}:</h3>
            {#each rulesForN as rule}
                <div class="rule-item">
                    {#if rule.type == 'trailing'}
                        <span class="bullet">></span>
                        The last {rule.digits
                            ? `digit${rule.lastDigits === 1 ? '' : 's'} must be ${rule.digits}`
                            : `${rule.lastDigits} digits must be divisible by ${n.toString(base)}`
                        }.
                    {:else if rule.type == 'universal digit sum'}
                    <span class="bullet">Σ</span>
                        {#if rule.multiplyBy === 1}
                            Sum the digits{rule.groupDigits === 1 ? '' : ` in groups of ${rule.groupDigits.toString(base)}`}.
                        {:else if rule.multiplyBy === -1}
                            Subtract the last {rule.groupDigits === 1 ? 'digit' : `${rule.groupDigits.toString(base)} digits`} from the other digits.
                        {:else}
                            Multiply the last {rule.groupDigits === 1 ? 'digit' : `${rule.groupDigits.toString(base)} digits`} by {Math.abs(rule.multiplyBy).toString(base)} and
                            {rule.multiplyBy < 0 ? 'subtract it from' : 'add it to'} the other digits.
                        {/if}
                        {#if rule.example}<br><span class="example">{rule.example}</span>{/if}
                    {/if}
                </div>
            {/each}
        {/each}
        {#if divRulesCombinable}
            <Checkbox bind:checked={divRulesCombine} label={'Combine Rules'}/>
        {/if}
    </div>
</div>

<style>
    .module {
        /* the browser doesn't anchor the scroll on this element anymore
        very good because this will jump around A LOT */
        overflow-anchor: none;
    }

    .rule-item {
        font-size: 0.85rem;
        margin-bottom: 4px;
        line-height: 1.4;
    }
    .bullet {
        color: var(--color-theme-2);
        font-weight: 800;
        margin-right: 5px;
    }
    .example {
        color: var(--color-text-kinda-dim);
        margin-left: 30px;
    }
</style>