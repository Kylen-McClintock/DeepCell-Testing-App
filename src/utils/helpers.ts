export function fmt(n: number | null | undefined, d: number = 1): string {
    if (n == null || Number.isNaN(n)) return "—";
    return Number(n).toFixed(d);
}

export function dateStr(d: Date): string {
    const z = (n: number) => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
}

export function parseDate(s: string): Date {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
}

export function addDays(d: Date | string, n: number): Date {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

export function mean(arr: number[]): number {
    const a = arr.filter((x) => Number.isFinite(x));
    return a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN;
}
