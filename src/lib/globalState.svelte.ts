import { browser } from '$app/environment';

export const STORED_STATE = $state({
    base: browser ? JSON.parse(localStorage.getItem('seximal_base') || "6") : 6,
    quickMathsHighscores: browser ? JSON.parse(localStorage.getItem('seximal_quickMathsHighscores') || "{}") : {},
    get baseName() { return getBaseName(this.base) },
})

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
    return BASE_NAMES[b] || `Base ${b}`;
}