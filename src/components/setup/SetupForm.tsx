import React, { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { Plan } from '@/types';
import clsx from 'clsx';
import { dateStr } from '@/utils/helpers';

export default function SetupForm() {
    const { state, updatePlan, reset } = useStore();
    const [formData, setFormData] = useState<Plan>(state.plan);

    useEffect(() => {
        setFormData(state.plan);
    }, [state.plan]);

    const handleChange = (field: keyof Plan, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleEstimateChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            estimates: { ...prev.estimates, [field]: value === "" ? "" : Number(value) }
        }));
    };

    const handleReminderChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            reminders: { ...prev.reminders, [field]: value }
        }));
    };

    const save = () => {
        updatePlan(formData);
        alert("Plan Saved");
    };

    const hardReset = () => {
        if (confirm("Clear ALL data?")) {
            reset();
        }
    };

    if (!formData.startDate) {
        // Initialize start date if empty
        handleChange('startDate', dateStr(new Date()));
    }

    return (
        <div className="card">
            <h2 className="text-xl font-bold mt-0 mb-4">Study Plan</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-[var(--muted)] text-sm mb-1">Participant Email (Required)</label>
                    <input
                        type="text"
                        className="input-field border-[var(--accent2)]"
                        placeholder="name@email.com"
                        value={formData.participantEmail}
                        onChange={(e) => handleChange('participantEmail', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[var(--muted)] text-sm mb-1">Participant Name</label>
                    <input
                        type="text"
                        className="input-field"
                        value={formData.participantName}
                        onChange={(e) => handleChange('participantName', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-[var(--muted)] text-sm mb-1">Product</label>
                    <input
                        type="text"
                        className="input-field text-[var(--muted)]"
                        value={formData.productName}
                        readOnly
                    />
                </div>
                <div>
                    <label className="block text-[var(--muted)] text-sm mb-1">Product Version</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="See label, or date received"
                        value={formData.productVersion}
                        onChange={(e) => handleChange('productVersion', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-[var(--muted)] text-sm mb-1">Start Date</label>
                    <input
                        type="date"
                        className="input-field"
                        value={formData.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[var(--muted)] text-sm mb-1">Typical Dose Protocol</label>
                    <input
                        type="text"
                        className="input-field"
                        value={formData.doseNotes}
                        onChange={(e) => handleChange('doseNotes', e.target.value)}
                    />
                </div>
            </div>

            <div className="h-px bg-[#222748] my-5"></div>

            <label className="block text-[var(--muted)] text-sm mb-2">Select Study Mode:</label>

            <div className="flex gap-3 mb-4">
                <div
                    onClick={() => handleChange('mode', 'quick')}
                    className={clsx(
                        "flex-1 p-4 border rounded-xl cursor-pointer text-center transition-all",
                        formData.mode === 'quick'
                            ? "border-[var(--accent2)] bg-gradient-to-b from-[rgba(94,155,255,0.1)] to-transparent shadow-[0_0_12px_rgba(94,155,255,0.15)]"
                            : "border-[#2b3266] bg-[#161b33] hover:bg-[#1e2445]"
                    )}
                >
                    <h3 className="text-white font-bold mb-1">🚀 Quick Start</h3>
                    <p className="text-xs text-[var(--muted)]">Estimate your baseline now. Start DeepCell immediately.</p>
                </div>
                <div
                    onClick={() => handleChange('mode', 'advanced')}
                    className={clsx(
                        "flex-1 p-4 border rounded-xl cursor-pointer text-center transition-all",
                        formData.mode === 'advanced'
                            ? "border-[var(--accent2)] bg-gradient-to-b from-[rgba(94,155,255,0.1)] to-transparent shadow-[0_0_12px_rgba(94,155,255,0.15)]"
                            : "border-[#2b3266] bg-[#161b33] hover:bg-[#1e2445]"
                    )}
                >
                    <h3 className="text-white font-bold mb-1">🔬 Advanced Study</h3>
                    <p className="text-xs text-[var(--muted)]">Track for 7 days <b>before</b> starting DeepCell for highest accuracy.</p>
                </div>
            </div>

            {formData.mode === 'quick' && (
                <div className="bg-[#1b2144] p-4 rounded-xl border border-[#2b3266] mb-4">
                    <div className="text-xs text-white mb-3"><b>Step 2: Estimate your typical baseline.</b> Be honest—this is what we compare against!</div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Sleep Quality (0-10)</label>
                            <input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={formData.estimates.sleep} onChange={(e) => handleEstimateChange('sleep', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Speed to Sleep (0-10)</label>
                            <div className="text-[10px] text-[var(--muted)] -mt-1 mb-1">0=Slow, 10=Instant</div>
                            <input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={formData.estimates.latency} onChange={(e) => handleEstimateChange('latency', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Typical Wake Ups (#)</label>
                            <input type="number" min="0" className="input-field" placeholder="e.g. 1" value={formData.estimates.wakeUps} onChange={(e) => handleEstimateChange('wakeUps', e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Morning Energy (0-10)</label>
                            <input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={formData.estimates.energy} onChange={(e) => handleEstimateChange('energy', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Grogginess (0-10)</label>
                            <div className="text-[10px] text-[var(--muted)] -mt-1 mb-1">0=None/Alert, 10=Very Groggy</div>
                            <input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={formData.estimates.groggy} onChange={(e) => handleEstimateChange('groggy', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Sleep Score (0-100)</label>
                            <input type="number" min="0" max="100" className="input-field" placeholder="0-100" value={formData.estimates.score} onChange={(e) => handleEstimateChange('score', e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Daily Focus (0-10)</label>
                            <input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={formData.estimates.focus} onChange={(e) => handleEstimateChange('focus', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Daily Mood (0-10)</label>
                            <input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={formData.estimates.mood} onChange={(e) => handleEstimateChange('mood', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Daily Stress (0-10)</label>
                            <div className="text-[10px] text-[var(--muted)] -mt-1 mb-1">0=Low, 10=High</div>
                            <input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={formData.estimates.stress} onChange={(e) => handleEstimateChange('stress', e.target.value)} />
                        </div>
                    </div>
                </div>
            )}

            {formData.mode === 'advanced' && (
                <div className="bg-[#1b2144] p-4 rounded-xl border border-[#2b3266] mb-4">
                    <div className="text-xs text-white mb-3"><b>Step 2: Set Baseline Phase.</b> Please record data for these days without taking DeepCell.</div>
                    <div>
                        <label className="block text-[var(--muted)] text-sm mb-1">Baseline Duration (Days)</label>
                        <input type="number" min="3" className="input-field" value={formData.baselineDays} onChange={(e) => handleChange('baselineDays', Number(e.target.value))} />
                    </div>
                </div>
            )}

            <div className="h-px bg-[#222748] my-5"></div>

            <details className="group">
                <summary className="cursor-pointer outline-none font-semibold mb-2 px-3 py-2 bg-[#1b2144] rounded-lg text-[var(--accent2)] flex items-center justify-between hover:bg-[#222955] list-none">
                    <span>Reminders (optional)</span>
                    <span className="text-lg font-bold group-open:hidden">+</span>
                    <span className="text-lg font-bold hidden group-open:block">−</span>
                </summary>
                <div className="p-3 bg-[#0e1228] border-t border-[#2b3266] rounded-b-lg">
                    <div className="flex gap-3 flex-wrap">
                        <div className="w-[120px]">
                            <label className="block text-[var(--muted)] text-sm mb-1">Enable</label>
                            <select
                                className="input-field"
                                value={formData.reminders.enabled ? "on" : "off"}
                                onChange={(e) => handleReminderChange('enabled', e.target.value === "on")}
                            >
                                <option value="off">Off</option>
                                <option value="on">On</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Dose Reminder</label>
                            <input
                                type="time"
                                className="input-field"
                                value={formData.reminders.doseTime}
                                onChange={(e) => handleReminderChange('doseTime', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[var(--muted)] text-sm mb-1">Morning Check-in</label>
                            <input
                                type="time"
                                className="input-field"
                                value={formData.reminders.nightlyTime}
                                onChange={(e) => handleReminderChange('nightlyTime', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </details>

            <div className="flex gap-3 mt-5">
                <button className="btn btn-primary" onClick={save}>Save Plan</button>
                <button className="btn btn-warn" onClick={hardReset}>Reset All</button>
            </div>
        </div>
    );
}
