export const baseState = $state({
    base: 6,
    get baseName() { return getBaseName(this.base) },
})

const BASE_NAMES: Record<string, string> = {
    1: "Unary", 2: "Binary", 3: "Ternary", 4: "Quaternary", 5: "Quinary", 6: "Seximal", 7: "Septimal", 8: "Octal", 9: "Nonary", 10: "Decimal",
    11: "Elevenary", 12: "Dozenal", 13: "Baker's Dozenal", 14: "Biseptimal", 15: "Triquinary", 16: "Hex"
}

export function getBaseName(b: number): string {
    return BASE_NAMES[b] || `Base ${b}`;
}