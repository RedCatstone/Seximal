import { baseState } from "$lib/globalState.svelte";
let base = $derived(baseState.base);

export type PrefixOperator = '%' | '√' | '!' | 'log' | '1/' | 'Sum ' | 'Prim ';
export type InfixOperator = '+' | '-' | '*' | '÷' | '^' | 'mod' | 'log_';

export function doPrefixOp(op: PrefixOperator, n: number): number | number[] {
    if (op == '%') return n / base**2;
    else if (op == '√') return Math.sqrt(n);
    else if (op == '!') return gamma(n + 1);
    else if (op == 'log') return Math.log(n) / Math.log(base);
    else if (op == '1/') return 1 / n;
    else if (op == 'Sum ') return n.toString(base).split('').reduce((tot, x) => tot += Number(x), 0);
    else if (op == 'Prim ') return primeFactors(n);
    throw new Error("woops.")
}

export function doInfixOp(left: number, op: InfixOperator, right: number): number {
    if (op == '+') return left + right;
    else if (op == '-') return left - right;
    else if (op == '*') return left * right;
    else if (op == '÷') return left / right;
    else if (op == '^') return left ** right;
    else if (op == 'mod') return left % right;
    else if (op == 'log_') return Math.log(right) / Math.log(left || NaN /* NaN on base zero */);
    throw new Error("woopsie.")
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