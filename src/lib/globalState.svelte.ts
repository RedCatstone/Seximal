import { browser } from '$app/environment';

export const STORED_STATE = $state({
    base: browser ? JSON.parse(localStorage.getItem('seximal_base') || "6") : 6,
    quickMathsHighscores: browser ? JSON.parse(localStorage.getItem('seximal_quickMathsHighscores') || "{}") : {},
    get baseName() { return getBaseName(this.base) },
})
const base = $derived(STORED_STATE.base);

if (browser) $effect.root(() => {
    $effect(() => {
        localStorage.setItem('quickMathsHighscores', JSON.stringify(STORED_STATE.quickMathsHighscores))
        localStorage.setItem('base', JSON.stringify(STORED_STATE.base))
    })
})

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

export function pronounce(n: number): string {
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