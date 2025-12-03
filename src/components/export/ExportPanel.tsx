import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { AppState } from '@/types';

export default function ExportPanel() {
    const { state, updateDaily } = useStore(); // updateDaily used for import
    const [passphrase, setPassphrase] = useState("");
    const [encMsg, setEncMsg] = useState("");

    const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "levl_deepcell_v4_3.json";
        a.click();
    };

    const downloadCSV = () => {
        const h = ["date", "tookDose", "doseAmount", "sleep_score", "sleep_quality", "speed_to_sleep", "groggy", "wake_ups", "total_sleep", "deep", "rem", "energy", "focus", "mood", "stress", "weight", "rhr", "hrv", "bp_sys", "bp_dia", "reaction_time", "notes"];
        let csv = h.join(",") + "\n";

        Object.keys(state.daily).sort().forEach(d => {
            const r = state.daily[d];
            const s = r.sliders || {};
            const w = r.wearables || {};
            const m = r.metrics || {};

            const row = [
                d,
                r.tookDose,
                r.doseAmount || "",
                w.score || "",
                s.sleep || "",
                s.latency || "",
                s.groggy || "",
                r.wakeUps || "",
                w.total || "",
                w.deep || "",
                w.rem || "",
                s.energy || "",
                s.focus || "",
                s.mood || "",
                s.stress || "",
                m.weight || "",
                m.rhr || "",
                m.hrv || "",
                m.bp_sys || "",
                m.bp_dia || "",
                m.rt || "",
                (r.notes || "").replace(/,/g, ";").replace(/\n/g, " ")
            ];
            csv += row.join(",") + "\n";
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "levl_deepcell_v4_3.csv";
        a.click();
    };

    const exportEncrypted = () => {
        if (!passphrase) { alert("Enter a passphrase"); return; }
        // Simple XOR for demo purposes (NOT REAL ENCRYPTION)
        const json = JSON.stringify(state);
        let out = "";
        for (let i = 0; i < json.length; i++) {
            out += String.fromCharCode(json.charCodeAt(i) ^ passphrase.charCodeAt(i % passphrase.length));
        }
        const blob = new Blob([btoa(out)], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "levl_deepcell_enc.dat";
        a.click();
    };

    const importEncrypted = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        if (!passphrase) { alert("Enter passphrase to decrypt"); return; }

        try {
            const txt = await e.target.files[0].text();
            const decoded = atob(txt);
            let json = "";
            for (let i = 0; i < decoded.length; i++) {
                json += String.fromCharCode(decoded.charCodeAt(i) ^ passphrase.charCodeAt(i % passphrase.length));
            }
            const obj = JSON.parse(json) as AppState;

            // Merge logic (simplified: just overwrite daily logs if newer? or just merge all)
            // For safety, let's just alert success and maybe reload or merge manually?
            // The original app didn't specify merge logic, so we'll just say "Imported"
            // In a real app we'd use the store to merge.

            // Let's merge daily logs
            let cnt = 0;
            if (obj.daily) {
                Object.entries(obj.daily).forEach(([d, log]) => {
                    updateDaily(d, log);
                    cnt++;
                });
            }
            setEncMsg(`Imported ${cnt} records successfully.`);

        } catch (err) {
            setEncMsg("Decryption failed. Wrong password?");
        }
    };

    return (
        <div className="card">
            <h2 className="text-xl font-bold mt-0 mb-4">Export Data</h2>

            <div className="flex gap-3 mb-5">
                <button className="btn btn-primary" onClick={downloadJSON}>Export JSON</button>
                <button className="btn" onClick={downloadCSV}>Export CSV</button>
            </div>

            <div className="h-px bg-[#222748] my-5"></div>

            <h3 className="text-lg font-bold mb-3">Encrypted Sync</h3>
            <div className="flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    className="input-field max-w-[200px]"
                    placeholder="Passphrase"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                />
                <button className="btn" onClick={exportEncrypted}>Export Encrypted</button>
                <label className="btn cursor-pointer">
                    Import
                    <input type="file" className="hidden" onChange={importEncrypted} />
                </label>
            </div>
            <div className="text-xs text-[var(--muted)] mt-2">{encMsg}</div>
        </div>
    );
}
