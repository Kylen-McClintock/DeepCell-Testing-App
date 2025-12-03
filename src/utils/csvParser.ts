import { DailyLog } from '@/types';

export async function parseCSV(file: File): Promise<Record<string, Partial<DailyLog>>> {
    const txt = await file.text();
    const rows = txt.split(/\r?\n/).map(r => r.split(","));
    const head = rows[0].map(s => s.toLowerCase().replace(/[\s_"]/g, ""));

    const colDate = head.findIndex(h => h.includes("date") || h.includes("day"));
    const colRHR = head.findIndex(h => h.includes("rest") && h.includes("heart"));
    const colHRV = head.findIndex(h => h.includes("hrv") || h.includes("rmssd"));
    const colScore = head.findIndex(h => h.includes("score") && h.includes("sleep"));

    const updates: Record<string, Partial<DailyLog>> = {};

    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r[colDate]) continue;

        let dStr = r[colDate];
        if (!dStr.includes("-")) {
            try {
                dStr = new Date(dStr).toISOString().slice(0, 10);
            } catch (e) {
                continue;
            }
        }

        const metrics: any = {};
        const wearables: any = {};

        if (colRHR > -1 && Number(r[colRHR])) metrics.rhr = Number(r[colRHR]);
        if (colHRV > -1 && Number(r[colHRV])) metrics.hrv = Number(r[colHRV]);
        if (colScore > -1 && Number(r[colScore])) wearables.score = Number(r[colScore]);

        if (Object.keys(metrics).length > 0 || Object.keys(wearables).length > 0) {
            updates[dStr] = {
                metrics,
                wearables
            };
        }
    }

    return updates;
}
