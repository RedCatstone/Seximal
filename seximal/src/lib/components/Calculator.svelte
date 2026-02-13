<script lang="ts">
    
    const BASE_NAMES = {
        1: "Unary", 2: "Binary", 3: "Ternary", 4: "Quaternary", 5: "Quinary", 6: "Seximal", 7: "Septimal", 8: "Octal", 9: "Nonary", 10: "Decimal",
        11: "Elevenary", 12: "Dozenal", 13: "Baker's Dozenal", 14: "Biseptimal", 15: "Triquinary", 16: "Hex"

    }
    const BASE = $state(6);
    const BASE_NAME = $derived(BASE_NAMES[BASE]);

    const NUM_COLUMNS = 3; // visual 3 columns

    const digits = $derived((() => {
        let numbers = Array.from({ length: BASE-1 }, (_, i) => i+1);  // 1 2 3 ...
        let ordered_digits = [];  // with NUM_COLUMNS = 3: 7 8 9 4 5 6 1 2 3 0

        while (numbers.length) {
            ordered_digits.push(...numbers.splice(-NUM_COLUMNS));
        }
        ordered_digits.push(0);
        return ordered_digits
    })());
    const equals_span = $derived(NUM_COLUMNS - (BASE % NUM_COLUMNS) || NUM_COLUMNS);


    // ------------------------------
    //      Calculator State
    // ------------------------------
    let inputLeft = $state<number | number[] | null>(null);
    let currInfixOp = $state<string | null>(null);
    let inputRight = $state<number | null>(0);     // the number you are currently inputting
    let decimalDigit = $state<number | null>(null);    // which decimal digit you are currently typing in

    let pastCalc = $state<[number, string, number] /*infix*/ | [string, number] /* prefix */ | null>(null);
    let showList = $state<number[] | null>(null);


    const displayedCalc = $derived(displayInfix(inputLeft, currInfixOp, inputRight));
    const displayedPastCalc = $derived(
        pastCalc
        ? pastCalc.length == 3
            ? displayInfix(...pastCalc) + ' ='
            : displayPrefix(...pastCalc) + ' ='
        : ''
    );

    function displayInfix(left: number|number[]|null, op: string|null, right: number|null): string {
        const strLeft = Array.isArray(left) ? `[${left.map(x => displayNumber(x))}]` : displayNumber(left);
        const strRight = displayNumber(right) + (decimalDigit === 1 ? '.' : '');
        if (op === "log_") return `${op ?? ''}${strLeft}(${strRight})`
        else return `${strLeft} ${op ?? ''} ${strRight}`
    }
    function displayPrefix(op: string|null, left: number|null): string {
        if (op === "!" || op == "%") return `${displayNumber(left)}${op}`
        else return `${op}${displayNumber(left)}`
    }

    function displayNumber(n: number | null): string {
        if (n == null) return "";
        else if (Object.is(n, -0)) return "-";
        else if (n === 0) return "0";
        else if (n === Infinity) return "Infinity";
        else if (n === -Infinity) return "-Infinity";
        else if (Number.isNaN(n)) return "ERROR";
        const absN = Math.abs(n);

        // thresholds for switching to exponential
        const upperLimit = BASE ** 9;
        const lowerLimit = BASE ** -5;
        
        if (absN >= lowerLimit && absN <= upperLimit) {
            return n.toString(BASE);
        }
        const exponent = Math.floor(Math.log(absN) / Math.log(BASE));
        const significand = n / BASE**exponent;
        return `${significand.toString(BASE).substring(0, 6)}e${exponent.toString(BASE)}`;
    }

    function clearInput() {
        inputLeft = null;
        currInfixOp = null;
        inputRight = 69420; // needed to update sveltes state
        inputRight = 0;
        decimalDigit = null;
        pastCalc = null;
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
                    inputRight = inputRight * BASE - n;
                }
                else inputRight = inputRight * BASE + n;
            } else {
                if (inputRight < 0 || Object.is(inputRight, -0)) {
                    inputRight -= n / (BASE**decimalDigit);
                }
                else inputRight += n / (BASE**decimalDigit);
                decimalDigit += 1;
            }
        }
    }

    function pressInfixOp(op: string) {
        if (Array.isArray(inputLeft)) return;
        pastCalc = null;
        if (op === "-" && inputRight === 0) {
            const isNegative = Object.is(inputRight, -0);
            inputRight = 69420; // needed to update sveltes state
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

    function pressPrefixOp(op: string) {
        if (Array.isArray(inputLeft)) return;
        if (inputLeft != null && inputRight == null && currInfixOp == null) {
            inputRight = inputLeft;
            inputLeft = null;
        }
        if (inputRight == null) return;

        let result;        
        if (op == "%") result = inputRight / BASE**2;
        else if (op == "√") result = Math.sqrt(inputRight);
        else if (op == "!") result = gamma(inputRight + 1);
        else if (op == "log") result = Math.log(inputRight) / Math.log(BASE);
        else if (op == "1/") result = 1 / inputRight;
        else if (op == "Sum ") result = inputRight.toString(BASE).split('').reduce((tot, x) => tot += Number(x), 0);
        else if (op == "Prim ") result = primeFactors(inputRight);
        else throw new Error("woopsie, invalid prefix op");

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
        if (inputLeft == null || Array.isArray(inputLeft) || inputRight == null) return;
        let result;
        if (currInfixOp == "+") result = inputLeft + inputRight;
        else if (currInfixOp == "-") result = inputLeft - inputRight;
        else if (currInfixOp == "*") result = inputLeft * inputRight;
        else if (currInfixOp == "÷") result = inputLeft / inputRight;
        else if (currInfixOp == "^") result = inputLeft ** inputRight;
        else if (currInfixOp == "mod") result = inputLeft % inputRight;
        else if (currInfixOp == "log_") result = Math.log(inputRight) / Math.log(inputLeft || NaN /* NaN on base zero */);
        else throw new Error("woopsie, invalid op");

        pastCalc = [inputLeft, currInfixOp, inputRight];
        inputLeft = result;
        inputRight = null;
        currInfixOp = null;
        decimalDigit = null;
    }

    function loadConstant(n: number) {
        pastCalc = null;
        if (currInfixOp == null) {
            inputLeft = null;
        }
        inputRight = n;
        decimalDigit = Infinity;
    }

    function gamma(n: number): number {
        // Gamma is undefined at zero and negative integers
        if (n <= 0 && Number.isInteger(n)) return NaN;
        // n > 172 is just too large for f64
        if (n > 172) return Infinity;

        // a simple for loop for integers
        if (n > 0 && Number.isInteger(n)) {
            let result = 1;
            for (let i = 1; i < n; i++) {
                result *= i
            }
            return result;
        }
        
        // Source - https://stackoverflow.com/a/15454866 - accurate to about 15 decimal places
        const g = 7; // g represents the precision desired, p is the values of p[i] to plug into Lanczos' formula
        const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
        if (n < 0.5) return Math.PI / Math.sin(n * Math.PI) / gamma(1 - n);
        else {
            n--;
            let x = p[0];
            for (let i = 1; i < g + 2; i++) x += p[i] / (n + i);
            const t = n + g + 0.5;
            return Math.sqrt(2 * Math.PI) * Math.pow(t, (n + 0.5)) * Math.exp(-t) * x;
        }
    }

    function primeFactors(n: number): number[] | number {
        if (n <= 1) return NaN;
        const factors = [];
        let divisor = 2;
        while (n >= 2) {
            if (n % divisor == 0) {
                factors.push(divisor);
                n /= divisor;
            }
            else if (divisor > 10_000_000) return NaN;
            else divisor++;
        }
        return factors;
    }
</script>

<div class="calculator-container">
    <div class="calculator">
        <header>
            <span class="brand">{BASE_NAME.toUpperCase()} <span class="model">IT-{BASE}{BASE**2-1}D</span></span>
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
                        onclick={() => { if (decimalDigit == null && inputRight != null) { decimalDigit = 1 } }}
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
    .calculator-container {
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: MATH;
    }

    .calculator {
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

        min-height: 60px;
        display: flex;
        flex-direction: column;
        justify-content: end;
        
        & .curr-calc {
            display: flex;
            justify-content: flex-end;
            font-size: 2rem;
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

        & button {
            height: var(--button-size);
            width: 100%;
            border-radius: 15px;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 0 black;
            font-size: 1.8rem;

            color: var(--button-color);
            --button-bg-color: #9b9b9b;
            background: color-mix(in oklab, var(--button-bg-color) 30%, black 70%);
            border: 1px solid color-mix(in oklab, var(--button-color) 80%, black 20%);

            &:hover {
                background: color-mix(in oklab, var(--button-bg-color) 28%, black 72%);
                transform: translateY(-1px);
                box-shadow: 0 5px 0 black;
            }
            &:active {
                transform: translateY(2px);
                box-shadow: 0 2px 0 black;
            }

            &.digit {
                --button-color: var(--color-text);
                --button-bg-color: var(--color-text);
            }
            &.util { --button-color: var(--color-theme-2); font-size: 1.3rem }
            &.const { --button-color: var(--color-theme-3); }
            &.ac {
                --button-bg-color: var(--color-theme-1);
                --button-color: var(--color-theme-1);
            }
            &.equals {
                --button-bg-color: var(--color-theme-4);
                --button-color: var(--color-theme-4);
            }
        }
    }
</style>