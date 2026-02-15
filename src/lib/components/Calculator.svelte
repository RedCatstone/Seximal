<script lang="ts">
	import { baseState } from "$lib/globalState.svelte";
	import { displayCalc, displayInfix, doInfixCalc, doPrefixCalc, type InfixOperator, type InfixOrPrefixCalc, type PrefixOperator } from "$lib/mathstuff.svelte";
    let base = $derived(baseState.base);

    const NUM_COLUMNS = 3; // visual 3 columns

    const digits = $derived((() => {
        let numbers = Array.from({ length: base-1 }, (_, i) => i+1);  // 1 2 3 ...
        let ordered_digits = [];  // with NUM_COLUMNS = 3: 7 8 9 4 5 6 1 2 3 0

        while (numbers.length) {
            ordered_digits.push(...numbers.splice(-NUM_COLUMNS));
        }
        ordered_digits.push(0);
        return ordered_digits
    })());
    const equals_span = $derived(NUM_COLUMNS - (base % NUM_COLUMNS) || NUM_COLUMNS);


    // ------------------------------
    //      Calculator State
    // ------------------------------
    let inputLeft = $state<number | number[] | null>(null);
    let currInfixOp = $state<InfixOperator | null>(null);
    let inputRight = $state<number | null>(0);     // the number you are currently inputting
    let decimalDigit = $state<number | null>(null);    // which decimal digit you are currently typing in

    let pastCalc = $state<InfixOrPrefixCalc | null>(null);


    const displayedCalc = $derived(displayInfix(inputLeft, currInfixOp, inputRight, decimalDigit));
    const displayedPastCalc = $derived(
        pastCalc
        ? displayCalc(pastCalc)
        : ''
    );

    function clearInput() {
        inputLeft = null;
        currInfixOp = null;
        inputRight = 69420; // needed to update sveltes state on -0, 0
        inputRight = 0;
        decimalDigit = null;
        pastCalc = null;
    }

    function pressBackspace() {
        if (inputRight == null || inputRight == 0) clearInput();
        else inputRight = Math.floor(inputRight / base)
    }

    function pressNum(n: number) {
        pastCalc = null;
        if (inputRight == null) {
            if (currInfixOp == null) {
                inputLeft = null;
            }
            inputRight = n;
        } else {
            if (decimalDigit == null) {
                if (inputRight < 0 || Object.is(inputRight, -0)) {
                    inputRight = inputRight * base - n;
                }
                else inputRight = inputRight * base + n;
            } else {
                if (inputRight < 0 || Object.is(inputRight, -0)) {
                    inputRight -= n / (base**decimalDigit);
                }
                else inputRight += n / (base**decimalDigit);
                decimalDigit += 1;
            }
        }
    }

    function pressInfixOp(op: InfixOperator) {
        if (Array.isArray(inputLeft)) return;
        pastCalc = null;
        if (op === "-" && inputRight === 0) {
            const isNegative = Object.is(inputRight, -0);
            inputRight = 69420; // needed to update sveltes state on -0, 0
            inputRight = isNegative ? 0 : -0;
            return
        }
        if (op === "-" && currInfixOp != null && inputRight == null) {
            inputRight = -0;
            return
        }
        if (inputRight != null) {
            if (inputLeft == null) {
                inputLeft = inputRight;
            } else {
                pressEquals();
            }
            inputRight = null;
        }
        currInfixOp = op;
        decimalDigit = null;
    }

    function pressPrefixOp(op: PrefixOperator) {
        if (Array.isArray(inputLeft)) return;
        if (inputLeft != null && inputRight == null && currInfixOp == null) {
            inputRight = inputLeft;
            inputLeft = null;
        }
        if (inputRight == null) return;
        decimalDigit = null;

        const result = doPrefixCalc(op, inputRight);

        pastCalc = [op, inputRight];

        if (inputLeft != null && currInfixOp != null && !Array.isArray(result)) inputRight = result;
        else {
            inputLeft = result;
            currInfixOp = null;
            inputRight = null;
        }
    }

    function pressEquals() {
        if (inputLeft != null && inputRight == null && pastCalc != null) {
            if (pastCalc.length == 3) {
                currInfixOp = pastCalc[1];
                inputRight = pastCalc[2];
            } else {
                pressPrefixOp(pastCalc[0]);
            }
        }
        if (inputLeft == null || Array.isArray(inputLeft) || inputRight == null || currInfixOp == null) return;

        const result = doInfixCalc(inputLeft, currInfixOp, inputRight);

        pastCalc = [inputLeft, currInfixOp, inputRight];
        inputLeft = result;
        inputRight = null;
        currInfixOp = null;
        decimalDigit = null;
    }

    function pressDecimalMode() {
        if (decimalDigit == null && inputRight != null) {
            decimalDigit = 1
        }
    }

    function loadConstant(n: number) {
        pastCalc = null;
        if (currInfixOp == null) {
            inputLeft = null;
        }
        inputRight = n;
        decimalDigit = Infinity;
    }

    function handleKeyDown(e: KeyboardEvent) {
        const k = e.key;

        // Numbers
        const parsed = parseInt(k, 36);
        if (!isNaN(parsed) && parsed < base) {
            pressNum(parsed);
        }
        else if (k == '+' || k == '-' || k == '*' || k == '^') pressInfixOp(k);
        else if (k == '/') pressInfixOp('÷');
        else if (k == 'Enter' || k == '=') pressEquals();
        else if (k == '.' || k == ',') pressDecimalMode();
        else if (k == 'Delete' || k == 'Escape') clearInput();
        else if (k == 'Backspace') pressBackspace();
        else if (k == '!') pressPrefixOp('!');
        else return
        e.preventDefault()
    }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="container-container" onkeydown={handleKeyDown} role="application" aria-label="Seximal Calculator">
    <div class="container">
        <header>
            <span class="brand">{baseState.baseName.toUpperCase()} <span class="model">IT-{base}{base**2-1}D</span></span>
        </header>
        <div class="output-area">
            <div class="past-calc">{displayedPastCalc}</div>
            <div class="curr-calc">{displayedCalc}</div>
        </div>
        <div class="calc-buttons">
            <div class="area" style:--columns="5">
                <button class="util" onclick={() => pressPrefixOp("√")}>√</button>
                <button class="util" onclick={() => pressInfixOp("^")}>xⁿ</button>
                <button class="util" onclick={() => pressPrefixOp("!")}>x!</button>
                <button class="util" onclick={() => pressInfixOp("mod")}>mod</button>
                <button class="util" onclick={() => pressInfixOp("log_")}>logₐ</button>
                <button class="util" onclick={() => pressPrefixOp("1/")}>¹⁄ₓ</button>
                <button class="util" onclick={() => pressPrefixOp("%")}>%</button>
                <button class="util" onclick={() => pressPrefixOp("Sum ")}>Sum</button>
                <button class="util" onclick={() => pressPrefixOp("Prim ")}>Prim</button>
                <button class="util" onclick={() => pressPrefixOp("log")}>log</button>
                <button class="const" onclick={() => loadConstant(Math.E)}>e</button>
                <button class="const" onclick={() => loadConstant(Math.PI)}>π</button>
                <button class="const" onclick={() => loadConstant((1 + Math.sqrt(5)) / 2)}>ϕ</button>
            </div>
            <div style:display="flex" style:justify-content="center" style:gap="25px">
                <div class="area" style:--columns={NUM_COLUMNS}>
                    {#each digits as number }
                        <button class="digit" onclick={() => pressNum(number)}>{number.toString(36)}</button>
                    {/each}
                    <button class="digit"
                        onclick={pressDecimalMode}
                        style:grid-column="span {equals_span}"
                    >.</button>
                </div>
                <div class="area" style:--columns="2" style:margin-bottom="25px">
                    <button class="util" onclick={() => pressInfixOp("*")}>*</button>
                    <button class="util" onclick={() => pressInfixOp("÷")}>÷</button>
                    <button class="util" onclick={() => pressInfixOp("+")}>+</button>
                    <button class="util" onclick={() => pressInfixOp("-")}>-</button>
                    <button class="ac" onclick={clearInput}>AC</button>
                    <button class="equals" onclick={pressEquals}>=</button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .container-container {
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: MATH;
    }

    .container {
        flex-direction: column;
        padding: 24px;
        border: 2px solid var(--color-bg-1);
        border-radius: 32px;
        width: 400px;
    }

    .brand {
        font-weight: 800;
        letter-spacing: 2px;
        font-size: 0.8rem;
        color: var(--color-text-dim);
    }

    .output-area {
        padding: 10px;
        margin-top: 20px;
        margin-bottom: 20px;
        background-color: black;
        border: 2px solid var(--color-bg-1);
        border-radius: 8px;

        text-align: right;
        overflow: hidden;
        white-space: nowrap;

        min-height: 50px;
        display: flex;
        flex-direction: column;
        justify-content: end;
        
        & .curr-calc {
            display: flex;
            justify-content: flex-end;
            font-size: 1.6rem;
        }
        & .past-calc {
            display: flex;
            justify-content: flex-end;
            font-size: 1rem;
            color: var(--color-theme-4);
            opacity: 0.7;
        }
    }

    .calc-buttons {
        display: flex;
        justify-content: center;
        flex-direction: column;
        gap: 25px;
        --button-size: 60px;
        
        & .area {
            display: grid;
            justify-content: center;
            gap: 10px;
            align-content: baseline;
            grid-template-columns: repeat(var(--columns), var(--button-size));
        }
    }
</style>