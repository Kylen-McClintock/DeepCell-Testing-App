import React, { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { DailyLog, DailyMetrics } from '@/types';
import { dateStr, addDays, parseDate } from '@/utils/helpers';
import { parseCSV } from '@/utils/csvParser';
import clsx from 'clsx';

const dailyMetricsConfig = {
    sleep: { label: "Sleep Quality", min: 0, max: 10 },
    latency: { label: "Speed to Sleep", min: 0, max: 10 },
    groggy: { label: "Morning Grogginess", min: 0, max: 10 },
    energy: { label: "Energy", min: 0, max: 10 },
    focus: { label: "Focus", min: 0, max: 10 },
    mood: { label: "Mood", min: 0, max: 10 },
    stress: { label: "Stress", min: 0, max: 10 }
};

export default function DailyCheckIn() {
    const { state, updateDaily } = useStore();
    const [date, setDate] = useState(dateStr(new Date()));
    const [log, setLog] = useState<Partial<DailyLog>>({});
    const [wearableMsg, setWearableMsg] = useState("");

    useEffect(() => {
        const existing = state.daily[date] || {};
        setLog({
            ...existing,
            sliders: { ...existing.sliders }, // Ensure sliders object exists
            wearables: { ...existing.wearables },
            metrics: { ...existing.metrics }
        });
    }, [date, state.daily]);

    const handleSliderChange = (key: keyof DailyMetrics, value: number) => {
        setLog(prev => ({
            ...prev,
            sliders: { ...prev.sliders, [key]: value } as DailyMetrics
        }));
    };

    const handleWearableChange = (key: string, value: any) => {
        setLog(prev => ({
            ...prev,
            wearables: { ...prev.wearables, [key]: value }
        }));
    };

    const handleMetricChange = (key: string, value: any) => {
        setLog(prev => ({
            ...prev,
            metrics: { ...prev.metrics, [key]: value }
        }));
    };

    const save = () => {
        // Ensure all required fields are present or default
        const sliders = { ...log.sliders } as DailyMetrics;
        Object.keys(dailyMetricsConfig).forEach(k => {
            if (sliders[k as keyof DailyMetrics] === undefined) {
                sliders[k as keyof DailyMetrics] = 5; // Default value
            }
        });

        const finalLog: DailyLog = {
            date,
            tookDose: log.tookDose || "no",
            doseAmount: log.tookDose === "yes" ? (log.doseAmount || state.plan.defaultDose) : undefined,
            sliders,
            wakeUps: log.wakeUps,
            wearables: log.wearables || {},
            metrics: log.metrics || {},
            notes: log.notes || ""
        };

        updateDaily(date, finalLog);
        alert("Saved");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const updates = await parseCSV(e.target.files[0]);
            let cnt = 0;
            Object.entries(updates).forEach(([d, u]) => {
                const existing = state.daily[d] || {};
                // Merge deeply
                const merged: DailyLog = {
                    date: d,
                    tookDose: existing.tookDose || "no",
                    doseAmount: existing.doseAmount,
                    sliders: existing.sliders || {},
                    wakeUps: existing.wakeUps,
                    wearables: { ...existing.wearables, ...u.wearables },
                    metrics: { ...existing.metrics, ...u.metrics },
                    notes: existing.notes || ""
                } as DailyLog;
                updateDaily(d, merged);
                cnt++;
            });
            setWearableMsg(`Imported ${cnt} entries.`);
            // Refresh current view if current date was updated
            if (updates[date]) {
                const existing = state.daily[date] || {}; // Refetch from state would be better but state update is async
                // For now, just let the useEffect trigger re-render when state updates
            }
        }
    };

    const runReactionTest = () => {
        const overlay = document.createElement("div");
        Object.assign(overlay.style, { position: "fixed", inset: 0, zIndex: 999, background: "#0b0e1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", cursor: "pointer" });
        overlay.innerHTML = "Wait for Green...";
        document.body.appendChild(overlay);
        const t0 = performance.now();
        const delay = 2000 + Math.random() * 2500;
        let ready = false; let start = 0;

        const timer = setTimeout(() => {
            overlay.style.background = "#47d16a"; overlay.innerHTML = "TAP!"; start = performance.now(); ready = true;
        }, delay);

        const handler = (e: Event) => {
            e.preventDefault();
            if (!ready) {
                if (performance.now() - t0 > 500) {
                    overlay.remove(); clearTimeout(timer); alert("Too early!");
                }
                return;
            }
            const rt = Math.round(performance.now() - start);
            overlay.remove();
            handleMetricChange('rt', rt);
            alert(`Reaction Time: ${rt}ms`);
        };

        overlay.onmousedown = handler as any;
        overlay.ontouchstart = handler as any;
    };

    // Phase calculation
    let phase = "";
    if (state.plan.startDate) {
        const start = parseDate(state.plan.startDate);
        const cur = parseDate(date);
        const isQuick = state.plan.mode === "quick";
        if (isQuick) {
            if (cur >= start) phase = "Test (On Product)"; else phase = "Pre-Start";
        } else {
            const baseEnd = addDays(start, state.plan.baselineDays - 1);
            if (cur >= start && cur <= baseEnd) phase = "Baseline Phase";
            else if (cur > baseEnd) phase = "Test (On Product)";
            else phase = "Pre-Start";
        }
    }

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold m-0">Daily Check-in</h2>
                <input
                    type="date"
                    className="input-field max-w-[160px]"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <div className="text-xs text-[var(--muted)] mb-4">Fill this out the morning after sleep.</div>

            {/* Last Night's Sleep */}
            <div className="bg-[#0e1228] p-4 rounded-xl border border-[#2b3266] mb-4">
                <div className="flex items-center gap-2 mb-4 text-[var(--accent2)] font-semibold">
                    <span>🌙</span> Last Night's Sleep
                </div>

                <div className="flex gap-3 mb-4 items-start">
                    <div className="flex-1">
                        <label className="block text-[var(--muted)] text-sm mb-1">Took DeepCell last night?</label>
                        <div className="flex border border-[#2b3266] rounded-xl overflow-hidden">
                            <button
                                className={clsx("flex-1 p-3 font-semibold transition-all", (log.tookDose || "no") === "no" ? "bg-[#2b3266] text-white" : "bg-[#0e1228] text-[var(--muted)]")}
                                onClick={() => setLog(prev => ({ ...prev, tookDose: "no" }))}
                            >
                                Did Not Take
                            </button>
                            <button
                                className={clsx("flex-1 p-3 font-semibold transition-all border-l border-[#2b3266]", (log.tookDose || "no") === "yes" ? "bg-[var(--accent2)] text-[#0b0e1a]" : "bg-[#0e1228] text-[var(--muted)]")}
                                onClick={() => setLog(prev => ({ ...prev, tookDose: "yes", doseAmount: prev.doseAmount || state.plan.defaultDose }))}
                            >
                                Took DeepCell
                            </button>
                        </div>
                    </div>
                    {log.tookDose === "yes" && (
                        <div className="w-[100px]">
                            <label className="block text-[var(--muted)] text-sm mb-1">Capsules</label>
                            <input
                                type="number"
                                className="input-field"
                                step="1"
                                value={log.doseAmount}
                                onChange={(e) => setLog(prev => ({ ...prev, doseAmount: Number(e.target.value) }))}
                            />
                        </div>
                    )}
                </div>

                <div className="mb-2 flex items-center gap-3">
                    <label className="min-w-[140px] text-sm text-[var(--muted)]">Sleep Quality</label>
                    <input
                        type="range"
                        min="0" max="10" step="0.5"
                        className="flex-1"
                        value={log.sliders?.sleep ?? 5}
                        onChange={(e) => handleSliderChange('sleep', Number(e.target.value))}
                    />
                    <span className="w-[30px] text-center text-sm">{log.sliders?.sleep ?? "—"}</span>
                </div>

                <div className="mb-1 flex items-center gap-3">
                    <label className="min-w-[140px] text-sm text-[var(--muted)]">Speed to Sleep</label>
                    <input
                        type="range"
                        min="0" max="10" step="0.5"
                        className="flex-1"
                        value={log.sliders?.latency ?? 5}
                        onChange={(e) => handleSliderChange('latency', Number(e.target.value))}
                    />
                    <span className="w-[30px] text-center text-sm">{log.sliders?.latency ?? "—"}</span>
                </div>
                <div className="text-[10px] text-[var(--muted)] ml-[150px] mb-3">0=Slow • 5=Baseline/Normal • 10=Near Instant</div>

                <div className="mb-4">
                    <label className="block text-[var(--muted)] text-sm mb-1">Wake Ups (#)</label>
                    <input
                        type="number"
                        min="0"
                        className="input-field max-w-[150px]"
                        placeholder="#"
                        value={log.wakeUps ?? ""}
                        onChange={(e) => setLog(prev => ({ ...prev, wakeUps: e.target.value === "" ? undefined : Number(e.target.value) }))}
                    />
                </div>

                <details className="group border border-[#2b3266] rounded-xl">
                    <summary className="cursor-pointer p-3 bg-[#1b2144] rounded-t-xl group-open:rounded-b-none text-[var(--accent2)] font-semibold flex justify-between items-center">
                        <span>Wearable Data (Sleep Score, Stages)</span>
                        <span className="group-open:hidden">+</span>
                        <span className="hidden group-open:block">−</span>
                    </summary>
                    <div className="p-3 bg-[#0e1228] rounded-b-xl border-t border-[#2b3266]">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-[var(--muted)] text-sm mb-1">Sleep Score (0-100)</label>
                                <input type="number" min="0" max="100" className="input-field" value={log.wearables?.score ?? ""} onChange={(e) => handleWearableChange('score', e.target.value === "" ? "" : Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-[var(--muted)] text-sm mb-1">Total Sleep (hr:min)</label>
                                <input type="text" className="input-field" placeholder="e.g. 7:30" value={log.wearables?.total ?? ""} onChange={(e) => handleWearableChange('total', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-[var(--muted)] text-sm mb-1">Deep Sleep (min)</label>
                                <input type="number" className="input-field" value={log.wearables?.deep ?? ""} onChange={(e) => handleWearableChange('deep', e.target.value === "" ? "" : Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-[var(--muted)] text-sm mb-1">REM Sleep (min)</label>
                                <input type="number" className="input-field" value={log.wearables?.rem ?? ""} onChange={(e) => handleWearableChange('rem', e.target.value === "" ? "" : Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="h-px bg-[#222748] my-3"></div>
                        <label className="w-full border-2 border-dashed border-[#2b3266] text-[var(--muted)] p-3 rounded-lg text-center cursor-pointer hover:border-[var(--accent2)] hover:text-[var(--text)] block">
                            📂 Upload Wearable CSV (Oura/Whoop/Apple)
                            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <div className="text-xs text-[var(--ok)] mt-2">{wearableMsg}</div>
                    </div>
                </details>
            </div>

            {/* The Day Following */}
            <div className="bg-[#0e1228] p-4 rounded-xl border border-[#2b3266] mb-4">
                <div className="flex items-center gap-2 mb-4 text-[var(--accent2)] font-semibold">
                    <span>☀️</span> The Day Following
                </div>

                <div className="mb-1 flex items-center gap-3">
                    <label className="min-w-[140px] text-sm text-[var(--muted)]">🥱 Grogginess</label>
                    <input type="range" min="0" max="10" step="0.5" className="flex-1" value={log.sliders?.groggy ?? 5} onChange={(e) => handleSliderChange('groggy', Number(e.target.value))} />
                    <span className="w-[30px] text-center text-sm">{log.sliders?.groggy ?? "—"}</span>
                </div>
                <div className="text-[10px] text-[var(--muted)] ml-[150px] mb-3">0=None/Alert • 10=Very Groggy</div>

                {['energy', 'focus', 'mood', 'stress'].map(k => (
                    <div key={k} className="mb-2 flex items-center gap-3">
                        <label className="min-w-[140px] text-sm text-[var(--muted)] capitalize">
                            {k === 'energy' ? '⚡️ Energy' : k === 'focus' ? '🎯 Focus' : k === 'mood' ? '🙂 Mood' : '🧘 Stress'}
                        </label>
                        <input
                            type="range" min="0" max="10" step="0.5" className="flex-1"
                            value={log.sliders?.[k as keyof DailyMetrics] ?? 5}
                            onChange={(e) => handleSliderChange(k as keyof DailyMetrics, Number(e.target.value))}
                        />
                        <span className="w-[30px] text-center text-sm">{log.sliders?.[k as keyof DailyMetrics] ?? "—"}</span>
                    </div>
                ))}
                <div className="text-[10px] text-[var(--muted)] ml-[150px] mb-3">0=Low/Zen • 10=High/Panic</div>

                <details className="group border border-[#2b3266] rounded-xl mt-4">
                    <summary className="cursor-pointer p-3 bg-[#1b2144] rounded-t-xl group-open:rounded-b-none text-[var(--accent2)] font-semibold flex justify-between items-center">
                        <span>Optional Advanced Metrics</span>
                        <span className="group-open:hidden">+</span>
                        <span className="hidden group-open:block">−</span>
                    </summary>
                    <div className="p-3 bg-[#0e1228] rounded-b-xl border-t border-[#2b3266]">
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <div><label className="block text-[var(--muted)] text-sm mb-1">Weight</label><input type="number" step="0.1" className="input-field" placeholder="kg/lbs" value={log.metrics?.weight ?? ""} onChange={(e) => handleMetricChange('weight', e.target.value === "" ? "" : Number(e.target.value))} /></div>
                            <div><label className="block text-[var(--muted)] text-sm mb-1">Resting HR</label><input type="number" className="input-field" placeholder="bpm" value={log.metrics?.rhr ?? ""} onChange={(e) => handleMetricChange('rhr', e.target.value === "" ? "" : Number(e.target.value))} /></div>
                            <div><label className="block text-[var(--muted)] text-sm mb-1">HRV</label><input type="number" className="input-field" placeholder="ms" value={log.metrics?.hrv ?? ""} onChange={(e) => handleMetricChange('hrv', e.target.value === "" ? "" : Number(e.target.value))} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div><label className="block text-[var(--muted)] text-sm mb-1">BP (Systolic)</label><input type="number" className="input-field" value={log.metrics?.bp_sys ?? ""} onChange={(e) => handleMetricChange('bp_sys', e.target.value === "" ? "" : Number(e.target.value))} /></div>
                            <div><label className="block text-[var(--muted)] text-sm mb-1">BP (Diastolic)</label><input type="number" className="input-field" value={log.metrics?.bp_dia ?? ""} onChange={(e) => handleMetricChange('bp_dia', e.target.value === "" ? "" : Number(e.target.value))} /></div>
                        </div>
                        <div className="flex items-end gap-3">
                            <div className="flex-1"><label className="block text-[var(--muted)] text-sm mb-1">Reaction Time (ms)</label><input type="number" className="input-field" value={log.metrics?.rt ?? ""} onChange={(e) => handleMetricChange('rt', e.target.value === "" ? "" : Number(e.target.value))} /></div>
                            <button className="btn h-[42px] text-xs" onClick={runReactionTest}>Run Test</button>
                        </div>
                    </div>
                </details>
            </div>

            <label className="block text-[var(--muted)] text-sm mb-1">Notes</label>
            <textarea
                className="input-field min-h-[84px] resize-y mb-4"
                placeholder="Dreams, caffeine, alcohol, stressors..."
                value={log.notes ?? ""}
                onChange={(e) => setLog(prev => ({ ...prev, notes: e.target.value }))}
            ></textarea>

            <div className="h-px bg-[#222748] my-5"></div>

            <div className="flex gap-3">
                <button className="btn btn-primary" onClick={save}>Save Check-in</button>
                <div className="flex-grow text-right gap-2 flex justify-end">
                    <button className="btn" onClick={() => setDate(dateStr(addDays(date, -1)))}>←</button>
                    <button className="btn" onClick={() => setDate(dateStr(addDays(date, 1)))}>→</button>
                </div>
            </div>
            <div className="text-center mt-3 text-sm text-[var(--accent2)]">Phase: {phase}</div>
        </div>
    );
}
