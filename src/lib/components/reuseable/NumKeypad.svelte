<script lang="ts">
	import { STORED_STATE } from "$lib/globalState.svelte";
	import { ceilWithPrecision, floorWithPrecision } from "$lib/mathstuff.svelte";
    const base = $derived(STORED_STATE.base);

    let { columns, inputNum=$bindable(), decimalDigit=$bindable(), clearInput, onDeNull, disabled=false }:
        { columns: number, inputNum: number | null, decimalDigit: number | null, clearInput: () => void, onDeNull?: () => void, disabled?: boolean } = $props();


    const digits = $derived((() => {
        let numbers = Array.from({ length: base-1 }, (_, i) => i+1);  // 1 2 3 ...
        let ordered_digits = [];  // with NUM_COLUMNS = 3: 7 8 9 4 5 6 1 2 3 0

        while (numbers.length) {
            ordered_digits.push(...numbers.splice(-columns));
        }
        ordered_digits.push(0);
        return ordered_digits
    })());
    const equals_span = $derived(columns - (base % columns) || columns);
    

    function pressNum(n: number) {
        if (disabled) return;
        if (inputNum == null) {
            if (onDeNull) onDeNull();
            inputNum = 0;
        }
        if (decimalDigit == null) {
            if (inputNum < 0 || Object.is(inputNum, -0)) {
                inputNum = inputNum * base - n;
            }
            else inputNum = inputNum * base + n;
        } else {
            if (inputNum < 0 || Object.is(inputNum, -0)) {
                inputNum -= n / (base**decimalDigit);
            }
            else inputNum += n / (base**decimalDigit);
            decimalDigit += 1;
        }
    }

    function pressDecimalMode() {
        if (disabled) return;
        if (decimalDigit == null && inputNum != null) {
            decimalDigit = 1
        }
    }

    function pressBackspace() {
        if (disabled) return;
        if (inputNum == null) return clearInput();

        if (decimalDigit != null) {
            if (decimalDigit <= 1) decimalDigit = null;
            else {
                decimalDigit -= 1;
                if (inputNum < 0) inputNum = ceilWithPrecision(inputNum, decimalDigit - 1);
                else inputNum = floorWithPrecision(inputNum, decimalDigit - 1);
            }
        }
        else if (inputNum == 0) clearInput();
        else if (inputNum < 0) inputNum = Math.ceil(inputNum / base);
        else inputNum = Math.floor(inputNum / base);
    }

    function handleKeyDown(e: KeyboardEvent) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') return;
        const k = e.key;
        const parsed = parseInt(k, 36);
        if (!isNaN(parsed) && parsed < base) pressNum(parsed);
        else if (k == '.' || k == ',') pressDecimalMode();
        else if (k == 'Delete' || k == 'Escape') clearInput();
        else if (k == 'Backspace') pressBackspace();
    }
</script>

<svelte:window onkeydown={handleKeyDown} />
<div class="calc-buttons">
    <div class="calc-buttons" style:--columns={columns}>
        {#each digits as number }
            <button class="digit" onclick={() => pressNum(number)}>{number.toString(36)}</button>
        {/each}
        <button class="digit"
            onclick={pressDecimalMode}
            style:grid-column="span {equals_span}"
        >.</button>
    </div>
</div>