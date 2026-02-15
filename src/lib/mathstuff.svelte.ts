import { baseState } from "$lib/globalState.svelte";
let base = $derived(baseState.base);

export type PrefixOperator = '%' | '√' | '!' | 'log' | '1/' | 'Sum ' | 'Prim ';
export type InfixOperator = '+' | '-' | '*' | '÷' | '^' | 'mod' | 'log_';

export type InfixOrPrefixCalc = [number, InfixOperator, number] | [PrefixOperator, number];

export const infixOpNames = {
    '+': 'Addition',
    '-': 'Subtraction',
    '*': 'Multiplication',
    '÷': 'Division',
    '^': 'Exponentiation',
    'mod': 'Modular',
    'log_': 'Logarithmic',
}

export function doPrefixCalc(op: PrefixOperator, n: number): number | number[] {
    if (op == '%') return n / base**2;
    else if (op == '√') return Math.sqrt(n);
    else if (op == '!') return gamma(n + 1);
    else if (op == 'log') return Math.log(n) / Math.log(base);
    else if (op == '1/') return 1 / n;
    else if (op == 'Sum ') return n.toString(base).split('').reduce((tot, x) => tot + parseInt(x, base), 0);
    else if (op == 'Prim ') return primeFactors(n);
    throw new Error("woops.")
}

export function doInfixCalc(left: number, op: InfixOperator, right: number): number {
    if (op == '+') return left + right;
    else if (op == '-') return left - right;
    else if (op == '*') return left * right;
    else if (op == '÷') return left / right;
    else if (op == '^') return left ** right;
    else if (op == 'mod') return left % right;
    else if (op == 'log_') return Math.log(right) / Math.log(left || NaN /* NaN on base zero */);
    throw new Error("woopsie.")
}


export function displayNumber(n: number | null): string {
    if (n == null) return "";
    else if (Object.is(n, -0)) return "-";
    else if (n === 0) return "0";
    else if (n === Infinity) return "Infinity";
    else if (n === -Infinity) return "-Infinity";
    else if (Number.isNaN(n)) return "ERROR";
    const absN = Math.abs(n);

    // thresholds for switching to exponential
    const upperLimit = base ** 9;
    const lowerLimit = base ** -5;
    
    if (absN >= lowerLimit && absN <= upperLimit) {
        return n.toString(base);
    }
    const exponent = Math.floor(Math.log(absN) / Math.log(base));
    const significand = n / base**exponent;
    return `${significand.toString(base).substring(0, 6)}𝕖${exponent.toString(base)}`;
}

export function displayCalc(calc: InfixOrPrefixCalc): string {
    return calc.length === 3 ? displayInfix(...calc, null) : displayPrefix(...calc)
}
export function doCalc(calc: InfixOrPrefixCalc): number | number[] {
    return calc.length === 3 ? doInfixCalc(...calc) : doPrefixCalc(...calc)
}

export function displayInfix(left: number|number[]|null, op: string|null, right: number|null, decimalDigit: number|null): string {
    const strLeft = Array.isArray(left) ? `[${left.map(x => displayNumber(x))}]` : displayNumber(left);
    let strRight = displayNumber(right);
    if (decimalDigit && !strRight.includes('.')) {
        strRight += '.' + '0'.repeat(decimalDigit - 1)
    }
    if (op === "log_") return `${op ?? ''}${strLeft}(${strRight || ' '})`
    else return `${strLeft} ${op ?? ''} ${strRight}`
}
function displayPrefix(op: string|null, left: number|null): string {
    if (op === "!" || op == "%") return `${displayNumber(left)}${op}`
    else return `${op}${displayNumber(left)}`
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

// Source - https://stackoverflow.com/a/40200710
export function isPrime(num: number): boolean {
    for(let i = 2, s = Math.sqrt(num); i <= s; i++) {
        if(num % i === 0) return false;
    }
    return num > 1;
}


export function isHarshad(n: number) {
    if (n === 0) return false;
    const digits = n.toString(base).split('').map(d => parseInt(d, base));
    const digitSum = digits.reduce((a, b) => a + b, 0);
    return n % digitSum === 0;
}