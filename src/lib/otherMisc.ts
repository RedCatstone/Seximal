import { displayStrOrArray, modInverse } from "./mathstuff.svelte";


// ----------------------
// --- Pronounciation ---
// ----------------------
// base names are stolen straight from https://www.seximal.net/names-of-other-bases
const BASE_NAMES: Record<string, string> = {
    1: "Unary", 2: "Binary", 3: "Ternary", 4: "Quaternary", 5: "Quinary", 6: "Seximal",
    7: "Septimal", 8: "Octal", 9: "Nonary", 10: "Decimal", 11: "Elevenary", 12: "Dozenal",
    13: "Baker's Dozenal", 14: "Biseptimal", 15: "Triquinary", 16: "Hex", 17: "Suboptimal", 18: "Triseximal",
    19: "Untriseximal", 20: "Vigesimal", 21: "Triseptimal", 22: "Bielevenary", 23: "Unbielevenary", 24: "Tetraseximal",
    25: "Pentaquinary", 26: "Biker's Dozenal", 27: "Trinonary", 28: "Tetraseptimal", 29: "Untetraseptimal", 30: "Pentaseximal",
    31: "Unpentaseximal", 32: "Tetroctal", 33: "Trielevenary", 34: "Bisuboptimal", 35: "Pentaseptimal", 36: "Niftimal"
}

export function getBaseName(b: number): string {
    return BASE_NAMES[b] ?? `Base ${b}`;
}


const place1 = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const place2 = ["zero", "on", "twen", "thir", "for", "fif", "six", "seven", "eigh", "nine", "ten", "eleven", "twelve"];

const genericGroupNames = [
    "", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion",
    "septillion", "octillion", "nonillion", "decillion", "undecillion", "duodecillion", "tredecillion", "quattuordecillion", "quindecillion"
]

const basePlaceNames: Record<string, string[]> = {
    6: ["nif", "gross", "mo"],
    8: ["oct", "hunsy"],
    10: ["ty", "hundred"],
    12: ["do", "gro"],
    16: ["hex", "hunsy"],
}

export function pronounce(n: number, base: number): string {
    if (n === Infinity) return "Infinity"
    else if (n === -Infinity) return "minus Infinity"
    else if (isNaN(n)) return "not a number"

    let s = [];
    const absN = Math.abs(n);
    const [digits, fraction] = absN.toString(base).split('.');

    const basePlaceName = basePlaceNames[base] ?? ["sy", "hunsy", "thousy"];
    const groupSize = basePlaceName.length + 1;

    if (digits === "0") s.push("zero");
    
    // loops over all groups, e.g. [1, 2, 3, 4, 5] -> [3, 4, 5], [1, 2]
    let groupCounter = 0;
    for (let i = digits.length; i > 0; i -= groupSize) {
        const group = digits.slice(Math.max(0, i - groupSize), i);

        let sg = [];

        // loops over all digits in a group
        for (let j = 0; j < group.length; j++) {
            const digit = group[j];
            // if a digit is 0, just skip this entirely. e.g. 102 -> one hundred two
            if (digit === "0") continue;

            const untilGroupEnd = parseInt(group.slice(j), base);
            if (untilGroupEnd <= 12) {
                sg.push(place1[untilGroupEnd]);
                break;
            }
            else {
                const inGroupName = basePlaceName[group.length - j - 2] ?? "";

                if (j === group.length - 2) sg.push(`${place2[parseInt(digit, base)] ?? digit}${inGroupName}`);
                else sg.push(`${place1[parseInt(digit, base)] ?? digit} ${inGroupName}`)
            }
        }

        const finalGroupString = (groupCounter == 0) ? sg.join(' ') : `${sg.join(' ')} ${basePlaceName[0]}-${genericGroupNames[groupCounter]}`;
        groupCounter++;

        s.unshift(finalGroupString);
    }
    
    // negative n
    if (n < 0 || Object.is(n, -0)) s.unshift("minus");

    // comma stuff
    if (fraction?.length) {
        s.push(`${basePlaceName[0]}-point`);
        for (const fractionDigit of fraction) {
            s.push(place1[parseInt(fractionDigit, base)] ?? fractionDigit);
        }
    }

    return s.join(' ');
}






// --------------------------
// --- Divisibility Rules ---
// --------------------------
export type DivisibilityRule =
    { type: 'trailing', lastDigits: number, digits?: string }
    | { type: 'universal digit sum', multiplyBy: number, groupDigits: number, example?: string }
    | { type: 'zero' };

const DIV_RULES_DISPLAY_ALL = false;
const DIV_RULES_K_LIMIT = 1_000_000;

export function divisibilityRules(n: number, base: number): DivisibilityRule[] {
    if (n === 0) return [{ type: 'zero' }];
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

                const example = k === 1 || (k <= 2 && Math.abs(easierInverse) === 1) ? generateDigitSumExample(n, easierInverse, k, base) : undefined;
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

function generateDigitSumExample(n: number, multiplyBy: number, groupDigits: number, base: number): string {
    const num = 17 * n;
    if (multiplyBy === 1) {
        // "18232", 2 -> "1 + 82 + 32"
        const grouped = num.toString(base).match(new RegExp(`.{1,${groupDigits}}(?=(.{${groupDigits}})*$)`, "g"))!

        return `${num.toString(base)} ➔ ${grouped.join(' + ')} \
            = ${grouped.map(x => parseInt(x, base)).reduce((tot, x) => tot + x, 0).toString(base)} which is divisble by ${n.toString(base)}`
    } else {
        const [leftDigits, rightDigits] = [Math.floor(num / base**groupDigits), num % base**groupDigits];
        return `${num.toString(base)} ➔ ${leftDigits.toString(base)} ${multiplyBy < 0 ? '-' : '+'} \
            ${rightDigits.toString(base)}${multiplyBy === -1 ? '' : ` * ${Math.abs(multiplyBy).toString(base)}`} \
            = ${(leftDigits + multiplyBy * rightDigits).toString(base)} which is divisble by ${n.toString(base)}`
    }
}