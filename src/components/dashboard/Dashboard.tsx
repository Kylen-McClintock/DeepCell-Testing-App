import React, { useState, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { parseDate, addDays, mean, fmt } from '@/utils/helpers';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot
} from 'recharts';
import clsx from 'clsx';

const dailyMetricsConfig = {
    "s.sleep": { label: "Sleep Quality", min: 0, max: 10 },
    "s.latency": { label: "Speed to Sleep", min: 0, max: 10 },
    "s.groggy": { label: "Morning Grogginess", min: 0, max: 10 },
    "s.energy": { label: "Energy", min: 0, max: 10 },
    "s.focus": { label: "Focus", min: 0, max: 10 },
    "s.mood": { label: "Mood", min: 0, max: 10 },
    "s.stress": { label: "Stress", min: 0, max: 10 },
    "w.score": { label: "Sleep Score", min: 0, max: 100 },
    "w.total": { label: "Total Sleep (hrs)", min: 0, max: 12 },
    "w.deep": { label: "Deep Sleep (min)", min: 0, max: 200 },
    "w.rem": { label: "REM Sleep (min)", min: 0, max: 200 },
    "d.wakeUps": { label: "Wake Ups", min: 0, max: 10 },
    "m.rt": { label: "Reaction Time", min: 200, max: 500 },
    "m.rhr": { label: "Resting HR", min: 40, max: 100 },
    "m.hrv": { label: "HRV", min: 0, max: 150 },
};

export default function Dashboard() {
    const { state } = useStore();
    const [metric, setMetric] = useState("s.sleep");
    const [smoothN, setSmoothN] = useState(1);

    const chartData = useMemo(() => {
        const days = Object.keys(state.daily).sort();
        const start = state.plan.startDate ? parseDate(state.plan.startDate) : new Date();
        const isQuick = state.plan.mode === "quick";
        const baseEnd = isQuick ? addDays(start, -1) : addDays(start, state.plan.baselineDays - 1);

        const data: any[] = [];
        const baseVals: number[] = [];
        const testVals: number[] = [];

        days.forEach(d => {
            const r = state.daily[d];
            if (!r) return;

            let v: any = null;
            const [type, key] = metric.split(".");

            if (type === "s") v = r.sliders?.[key as keyof typeof r.sliders];
            else if (type === "w") v = r.wearables?.[key as keyof typeof r.wearables];
            else if (type === "m") v = r.metrics?.[key as keyof typeof r.metrics];
            else if (type === "d") v = r[key as keyof typeof r];

            if (key === "total" && typeof v === "string" && v.includes(":")) {
                const parts = v.split(":");
                v = Number(parts[0]) + Number(parts[1]) / 60;
            }

            v = Number(v);

            if (Number.isFinite(v)) {
                let doseColor = "#5c6b7f"; // 0
                let label = "No Dose";
                if (r.tookDose === "yes") {
                    const amt = r.doseAmount || 3;
                    if (amt <= 1.5) { doseColor = "#0dcaf0"; label = "1 Cap"; }
                    else if (amt <= 2.5) { doseColor = "#2d5bff"; label = "2 Caps"; }
                    else if (amt <= 3.5) { doseColor = "#7d5fff"; label = "3 Caps"; }
                    else { doseColor = "#ffb45e"; label = "4+ Caps"; }
                }

                const dt = parseDate(d);
                const isBase = !isQuick && dt <= baseEnd;
                const isTest = (dt > baseEnd && r.tookDose === "yes") || (isQuick && dt >= start && r.tookDose === "yes");

                if (isBase) baseVals.push(v);
                if (isTest) testVals.push(v);

                data.push({
                    date: d,
                    val: v,
                    doseColor,
                    label,
                    displayDate: `${dt.getMonth() + 1}/${dt.getDate()}`
                });
            }
        });

        return { data, baseVals, testVals };
    }, [state.daily, metric, state.plan]);

    const kpi = useMemo(() => {
        let mBase;
        const isQuick = state.plan.mode === "quick";
        const [type, key] = metric.split(".");

        if (isQuick) {
            if (key === "score") mBase = state.plan.estimates.score;
            else if (key === "wakeUps") mBase = state.plan.estimates.wakeUps;
            else if (type === "s") mBase = state.plan.estimates[key as keyof typeof state.plan.estimates];
            else mBase = "";

            mBase = mBase === "" ? NaN : Number(mBase);
        } else {
            mBase = mean(chartData.baseVals);
        }

        const mTest = mean(chartData.testVals);
        return {
            base: mBase,
            test: mTest,
            diff: mTest - mBase,
            baseLabel: isQuick ? "Estimated" : "Calculated"
        };
    }, [chartData, metric, state.plan]);

    const CustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        return (
            <circle cx={cx} cy={cy} r={6} fill={payload.doseColor} stroke="#0b0e1a" strokeWidth={2} />
        );
    };

    return (
        <div className="card">
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <h2 className="text-xl font-bold m-0 flex-grow">Dashboard</h2>
                <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Metric</label>
                    <select
                        className="input-field py-1"
                        value={metric}
                        onChange={(e) => setMetric(e.target.value)}
                    >
                        {Object.entries(dailyMetricsConfig).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>
                <div className="w-[80px]">
                    <label className="block text-xs text-[var(--muted)] mb-1">Smooth</label>
                    <input
                        type="number"
                        min="1"
                        className="input-field py-1"
                        value={smoothN}
                        onChange={(e) => setSmoothN(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="h-[320px] w-full bg-[#0e1228] border border-[#222748] rounded-xl relative mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid stroke="#2b3266" vertical={false} />
                        <XAxis dataKey="displayDate" stroke="#7f88a9" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis stroke="#7f88a9" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(22, 27, 51, 0.95)', borderColor: '#2b3266', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#7f88a9', marginBottom: '4px' }}
                        />
                        {Number.isFinite(kpi.base) && (
                            <ReferenceLine y={kpi.base} stroke="#20c997" strokeDasharray="6 4" strokeWidth={2} opacity={0.9} />
                        )}
                        <Line
                            type="monotone"
                            dataKey="val"
                            stroke="#5e9bff"
                            strokeWidth={2}
                            dot={<CustomDot />}
                            activeDot={{ r: 8, stroke: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-3 text-[11px] text-[var(--muted)] mb-4">
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#5c6b7f] mr-1.5"></span>0 Caps</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#0dcaf0] mr-1.5"></span>1 Cap (Lite)</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#2d5bff] mr-1.5"></span>2 Caps</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#7d5fff] mr-1.5"></span>3 Caps (Std)</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#ffb45e] mr-1.5"></span>4+ Caps</div>
                <div className="flex items-center"><span className="w-4 h-0 border-t border-dashed border-[#20c997] mr-1.5"></span>Baseline</div>
            </div>

            <div className="flex gap-4 mb-5">
                <div className="flex-1 bg-[var(--card)] border border-[#222748] rounded-2xl p-3 min-w-[100px]">
                    <h3 className="text-sm text-[var(--muted)] font-medium m-0">Baseline</h3>
                    <div className="text-2xl font-bold mt-1">{fmt(kpi.base)}</div>
                    <div className="text-xs text-[var(--muted)]">{kpi.baseLabel}</div>
                </div>
                <div className="flex-1 bg-[var(--card)] border border-[#222748] rounded-2xl p-3 min-w-[100px]">
                    <h3 className="text-sm text-[var(--muted)] font-medium m-0">DeepCell Avg</h3>
                    <div className="text-2xl font-bold mt-1">{fmt(kpi.test)}</div>
                </div>
                <div className="flex-1 bg-[var(--card)] border border-[#222748] rounded-2xl p-3 min-w-[100px]">
                    <h3 className="text-sm text-[var(--muted)] font-medium m-0">Difference</h3>
                    <div className="text-2xl font-bold mt-1">
                        {kpi.diff > 0 ? "+" : ""}{fmt(kpi.diff)}
                    </div>
                </div>
            </div>

            <details className="group border border-[#2b3266] rounded-xl">
                <summary className="cursor-pointer p-3 bg-[#1b2144] rounded-t-xl group-open:rounded-b-none text-[var(--accent2)] font-semibold flex justify-between items-center">
                    <span>View Raw Data (Table)</span>
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:block">−</span>
                </summary>
                <div className="p-0 bg-[#0e1228] rounded-b-xl border-t border-[#2b3266] overflow-x-auto">
                    {chartData.data.length === 0 ? (
                        <div className="p-4 text-sm text-[var(--muted)]">No data available for this metric.</div>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 border-b border-[#2b3266] text-[var(--muted)] font-medium">Date</th>
                                    <th className="p-2 border-b border-[#2b3266] text-[var(--muted)] font-medium">Value</th>
                                    <th className="p-2 border-b border-[#2b3266] text-[var(--muted)] font-medium">Dose</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...chartData.data].reverse().map((d, i) => (
                                    <tr key={i} className="hover:bg-[#161b33]">
                                        <td className="p-2 border-b border-[#1e2445] text-[var(--text)]">{d.date}</td>
                                        <td className="p-2 border-b border-[#1e2445] text-[var(--text)] font-bold">{d.val}</td>
                                        <td className="p-2 border-b border-[#1e2445] text-[var(--text)]">
                                            <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: d.doseColor }}></span>
                                            {d.label}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </details>
        </div>
    );
}
