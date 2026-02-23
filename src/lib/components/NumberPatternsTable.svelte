<script lang="ts">
	import Checkbox from "$lib/components/reuseable/Checkbox.svelte";
	import { STORED_STATE } from "$lib/globalState.svelte";
	import { gcd, primePowerComponents, getTrailingAndCoprime, isHarshad, isPrime, modInverse, primeFactors, isHappyNumber } from "$lib/mathstuff.svelte";
    const base = $derived(STORED_STATE.base);

    let rows = $state(360);
    
    type HighlighterMode = null | 'prime' | 'square' | 'harshard' | 'happy' | number /* multiples of */;
    let mode: HighlighterMode = $state(null);

    function changeMode(newMode: HighlighterMode) {
        if (mode != newMode) mode = newMode;
        else mode = null
        multiplesOfValue = "";
    }

    let multiplesOfValue = $state("");
    $effect(() => {
        const parsed = parseInt(multiplesOfValue, base);
        if (!isNaN(parsed) && parsed) mode = parsed;
        else if (typeof mode === 'number') mode = null;
    });

    function displayOrArray(arr: number[], or="or"): string {
        return displayStrOrArray(arr.map(x => x.toString(base)), or)
    }
    function displayStrOrArray(arr: string[], or="or"): string {
        if (arr.length === 1) return arr[0];
        return `${arr.slice(0, -1).join(', ')} ${or} ${arr.at(-1)}`;
    }

    type DivisibilityRule = { type: 'trailing', lastDigits: number, digits?: string }
        | { type: 'universal digit sum', multiplyBy: number, groupDigits: number, example?: string };
    const DIV_RULES_DISPLAY_ALL = false;
    const DIV_RULES_K_LIMIT = 1_000_000;
    let DIV_RULES_COMBINE = $state(true);

    function divisibilityRules(n: number): DivisibilityRule[] {
        n = Math.abs(n);
        const rules: DivisibilityRule[] = [];

        // Trailing Rule
        // if base**x = n**y for any x and y then we have a rule
        let remainder = 1;
        const seenSet = new Set([remainder]);
        for (let k = 1; k < DIV_RULES_K_LIMIT/10; k++) {
            remainder = (remainder * base) % n;
            if (remainder == 0) {
                const digits = (base**k / n <= base * 2) 
                    ? displayStrOrArray(Array.from({ length: base**k / n }, (_, i) => (i * n).toString(base).padStart(k, "0")))
                    : undefined;
                rules.push({ type: 'trailing', lastDigits: k, digits });
                break;
            }
            if (seenSet.has(remainder)) break;
            seenSet.add(remainder);
        }

        // Cracked Universal Digit Sum Rule
        // for example finding a rule for divisibilty by 7 (base 10):
        // find k so that: `(10 * k) mod 7 = 1` -> k = 5 or k = -2
        // 483 is divisible by 7 if `48 - 2 * 3 = 42` is. yep
        // 42 is divisible by 7 if `4 - 2 * 2 = 0` is. yep
        const mult1 = modInverse(base, n);
        if (mult1 != null && n !== 1) {
            // find the blocking rules and stop if we find a multiplier of 1.
            // you could just get these by doing modInverse(base**exp, n),
            // but that is kinda slow and reaches the number limit quickly...
            //
            // a 1-digit rule exists <=> any m-digit rule exists <=> gcd(base, n) === 1
            // 
            // EXAMPLES for decimal 7:
            // - multiply the last digit by 2 and subtract it from the other digits.
            // - multiply the last 2 digits by 3 and subtract it from the other digits.
            // - multiply the last 3 digits by 1 and subtract it from the other digits.
            // - multiply the last 4 digits by 2 and add it to the other digits.
            // - multiply the last 5 digits by 3 and add it to the other digits.
            // - multiply the last 6 digits by 1 and add it to the other digits.
            // for 7 digits it will just repeat previous, so multiply by 2 and subtract.
            //
            // to calculate the other multipliers:
            // m_k = (m_1)**k mod 7
            // or m_k = (m_(k-1) * m_1) mod 7

            let multK = mult1;

            for (let k = 1; k < DIV_RULES_K_LIMIT; k++) {
                // multK and (multK - n) work! lets see which one is smaller/easier
                const easierInverse = (n - multK < multK) ? multK - n : multK;
                if (k === 1 || Math.abs(easierInverse) === 1 || (DIV_RULES_DISPLAY_ALL && rules.length < 100)) {

                    const example = k === 1 ? generateDigitSumExample(n, easierInverse) : undefined;
                    rules.push({
                        type: 'universal digit sum',
                        multiplyBy: easierInverse,
                        groupDigits: k,
                        example
                    });
                }

                if (multK === 1) {
                    // we have looped back to the first multiplier!
                    break;
                }
                multK = (multK * mult1) % n;
            }
        }
        return rules;
    }

    function generateDigitSumExample(n: number, multiplyBy: number): string {
        const num = 17 * n;
        if (multiplyBy === 1) {
            return `${num.toString(base)} ➔ ${num.toString(base).split('').join(' + ')} \
                = ${num.toString(base).split('').map(x => parseInt(x, base)).reduce((tot, x) => tot + x, 0).toString(base)} which is divisble by ${n.toString(base)}`
        } else {
            const [leftDigits, rightDigit] = [Math.floor(num / base), num % base];
            return `${num.toString(base)} ➔ ${leftDigits.toString(base)} ${multiplyBy < 0 ? '-' : '+'} ${rightDigit.toString(base)}${multiplyBy === -1 ? '' : ` * ${Math.abs(multiplyBy)}`} \
                = ${(leftDigits + multiplyBy * rightDigit).toString(base)} which is divisble by ${n.toString(base)}`
        }
    }

    function divisibilityRulesAll(n: number): [number, DivisibilityRule[]][] {
        const rules: [number, DivisibilityRule[]][] = [];

        let numbers = DIV_RULES_COMBINE ? getTrailingAndCoprime(n) : primePowerComponents(n);

        for (const comp of numbers) {
            rules.push([comp, divisibilityRules(comp)]);
        }

        return rules;
    }
</script>

<div class="container-container">
    <h1>Number Patterns</h1>
    <div class="above-pattern-table">
        <div class="highlighter-toggles">
            <div><Checkbox checked={mode === 'prime'} onchange={() => changeMode('prime')} label="Primes"/></div>
            <div><Checkbox checked={mode === 'square'} onchange={() => changeMode('square')} label="Squares"/></div>
            <div><Checkbox checked={mode === 'harshard'} onchange={() => changeMode('harshard')} label="Harshard"/></div>
            <div><Checkbox checked={mode === 'happy'} onchange={() => changeMode('happy')} label="Happy"/></div>
            <div class:active={typeof mode === 'number'}>
                <label for="multiples-of">Multiples of</label>
                <input type="number"
                    id="multiples-of"
                    style:width="30px"
                    style:height="25px"
                    style:margin-left="5px"
                    bind:value={multiplesOfValue}
                />
            </div>
        </div>
        {#if mode == 'prime' }
            <span><strong>Prime Numbers</strong> are integers divisible only by 1 and itself. (greater than 1)</span>
            <span>Every integer (greater than 1) can be uniquely split into its prime factors. Example: {primeFactors(base).map(x => x.toString(base)).join(' * ')} = 10.</span>
            <span>{STORED_STATE.baseName} primes larger than 10 can only end on {displayOrArray(
                Array.from({ length: base }, (_, i) => i)
                    .filter(d => gcd(d, base) === 1)
            )}. {base === 6 ? 'Beautiful!' : ''}</span>
        {:else if mode == 'square' }
            <span><strong>Square Numbers</strong> are the result of multiplying an integer by itself.</span>
            <span>{STORED_STATE.baseName} square numbers can only end on {displayOrArray(
                [...new Set(
                    Array.from({ length: base }, (_, i) => i**2 % base)
                )].sort((a, b) => a - b)
                )}.</span>
        {:else if mode == 'harshard' }
            <span><strong>Harshard Numbers</strong> are integers divisible by the sum of their digits.</span>
            <br><span class="example">{((base - 1) * 2).toString(base)} is Harshad because it's divisible by {(base - 1).toString(base)} = (1 + {(base - 2).toString(base)}).</span>
        {:else if mode == 'happy' }
            <span><strong>Happy Numbers</strong>  are integers that eventually reach 1 when replaced by the sum of the square of their digits repeatedly.</span>
            <br><span class="example">10 is Happy because 1² + 0² = 1.</span>
        {:else if typeof mode === 'number'}
            {@const rules = divisibilityRulesAll(mode)}
            <div class="rules-container">
                {#if primePowerComponents(mode).length !== getTrailingAndCoprime(mode).length}
                    <Checkbox bind:checked={DIV_RULES_COMBINE} label={'Combine Rules'}/>
                {/if}
                {#if rules.length > 1}
                    <span class="rule-target">A number is divisible by {mode.toString(base)} if it is divisible by {displayOrArray(rules.map(([x, _]) => x), "and")}:</span>
                {/if}
                {#each rules as [n, rulesForN]}
                    <span class="rule-target">Rule{rulesForN.length === 1 ? '' : 's'} for {n.toString(base)}:</span>
                    {#each rulesForN as rule}
                        <div class="rule-item">
                            {#if rule.type == 'trailing'}
                                <span class="bullet">></span>
                                check if the last {rule.digits
                                    ? `digit${rule.lastDigits === 1 ? ' is' : 's are'} ${rule.digits}`
                                    : `${rule.lastDigits} digits are divisible by ${n.toString(base)}`
                                }.
                            {:else if rule.type == 'universal digit sum'}
                            <span class="bullet">Σ</span>
                                {#if rule.multiplyBy === 1} sum the digits{rule.groupDigits === 1 ? '' : ` in groups of ${rule.groupDigits.toString(base)}`}.
                                {:else if rule.multiplyBy === -1}
                                    subtract the last {rule.groupDigits === 1 ? 'digit' : `${rule.groupDigits.toString(base)} digits`} from the other digits.
                                {:else}
                                    multiply the last {rule.groupDigits === 1 ? 'digit' : `${rule.groupDigits.toString(base)} digits`} by {Math.abs(rule.multiplyBy).toString(base)} and
                                        {rule.multiplyBy < 0 ? 'subtract it from' : 'add it to'} the other digits.
                                {/if}
                                {#if rule.example}<br><span class="example">{rule.example}</span>{/if}
                            {/if}
                        </div>
                    {/each}
                {/each}
            </div>
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
                                || typeof mode == 'number' && val % mode === 0
                                || mode == 'happy' && isHappyNumber(val)
                            }>
                                {val.toString(base)}
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
        <button onclick={() => rows += 360} style:font-size="1.3rem">Bigger Table</button>
    </div>
</div>

<style>
    .container-container {
        display: flex;
        align-items: center;
        flex-direction: column;
    }

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

        & .active {
            color: var(--color-theme-2);
        }
    }

    .rule-target {
        color: var(--color-theme-2);
        font-weight: bold;
        display: block;
        margin-bottom: 5px;
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