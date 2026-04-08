import React, { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { Profile, UserProtocol, Modality } from '@/types';
import clsx from 'clsx';
import { dateStr } from '@/utils/helpers';

const deepCellComponents = [
    "magnesium", "tryptophan", "vitamin b6", "theanine", "lemon balm", "passion flower", "valerian", "hops", "zinc", "apigenin", "luteolin", "spermidine", "lithium"
];

const influencerProtocols = [
    {
        name: "The Huberman Cocktail",
        influencer: "Andrew Huberman",
        icon: "🔬",
        stack: ["magnesium glycinate", "l-theanine", "apigenin", "myo-inositol", "nsdr", "morning sunlight", "dim lights"]
    },
    {
        name: "Blueprint Longevity",
        influencer: "Bryan Johnson",
        icon: "🩸",
        stack: ["blue light", "temperature", "melatonin", "ashwagandha", "glycine"]
    },
    {
        name: "Drive Optimization",
        influencer: "Peter Attia",
        icon: "🏎️",
        stack: ["magnesium", "ashwagandha", "glycine", "temperature", "dim lights"]
    },
    {
        name: "Limitless Recovery",
        influencer: "Chris Hemsworth",
        icon: "🏋️‍♂️",
        stack: ["temperature", "warm bath", "morning sunlight", "sleep stories"]
    }
];

export default function SetupForm() {
    const { state, updateProfile, updateProtocol, reset } = useStore();
    const [profileData, setProfileData] = useState<Profile>(state.profile);
    const [protocolData, setProtocolData] = useState<UserProtocol>(state.activeProtocol || {
        startDate: dateStr(new Date()),
        baselineDays: 7,
        activeModalities: [],
        estimates: { sleep: "", latency: "", wakeUps: "", energy: "", groggy: "", focus: "", mood: "", stress: "", score: "" },
        reminders: { enabled: true, doseTime: "21:30", nightlyTime: "08:00" },
        mode: 'quick',
        status: 'active'
    });
    const [savedMsg, setSavedMsg] = useState("");
    const [expandedMods, setExpandedMods] = useState<Record<string, boolean>>({});
    const [activeInfluencer, setActiveInfluencer] = useState<string | null>(null);
    
    // Custom Modes State
    const [customMods, setCustomMods] = useState<Modality[]>([]);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customModName, setCustomModName] = useState("");
    const [customModDesc, setCustomModDesc] = useState("");

    // Fallback static modalities if none from DB yet
    const fallbackModalities: Modality[] = [
        { id: 'mod-deepcell', name: 'LIFESPAN+ DeepCell', description: 'Advanced sleep formulation', category: 'supplement', defaultInstructions: 'Take 3 capsules 30 mins before bed' },
        { id: 'mod-bluelight', name: 'Blue Light Blocking', description: 'Block blue light 2 hrs prior to sleep', category: 'behavioral', defaultInstructions: 'Wear amber glasses starting at 8 PM' },
        { id: 'mod-nosocial', name: 'No Social Media', description: 'Stop scrolling 1 hr before bed', category: 'behavioral', defaultInstructions: 'Devices away by 9 PM' }
    ];

    const displayModalities = [...(state.availableModalities.length > 0 ? state.availableModalities : fallbackModalities), ...customMods];

    // Normalize modalities (rename "DeepCell" to "LIFESPAN+ DeepCell" to avoid duplicates and fix the anchor)
    const normalizedModalities = displayModalities.map(m => {
        if (m.name.trim() === "DeepCell") {
            return { ...m, name: "LIFESPAN+ DeepCell" };
        }
        return m;
    }).filter((v, i, a) => a.findIndex(t => t.name === v.name) === i); // Ensure unique names

    const mainAnchor = normalizedModalities.find(m => m.name.includes("LIFESPAN+ DeepCell"));
    const isAnchorActive = protocolData.activeModalities.some(m => m.name.includes("LIFESPAN+ DeepCell") || m.name === "DeepCell");

    const componentMods = normalizedModalities.filter(m => 
        !m.name.includes("LIFESPAN+ DeepCell") && 
        deepCellComponents.some(comp => m.name.toLowerCase().includes(comp))
    );

    const otherMods = normalizedModalities.filter(m => 
        !m.name.includes("LIFESPAN+ DeepCell") && 
        !deepCellComponents.some(comp => m.name.toLowerCase().includes(comp))
    );

    // Initial setup if empty
    useEffect(() => {
        if (!state.activeProtocol && protocolData.activeModalities.length === 0 && mainAnchor) {
            setProtocolData(prev => ({
                ...prev,
                activeModalities: [mainAnchor]
            }));
        }
    }, [state.activeProtocol, mainAnchor, protocolData.activeModalities.length]);

    useEffect(() => { setProfileData(state.profile); }, [state.profile]);
    useEffect(() => { if (state.activeProtocol) setProtocolData(state.activeProtocol); }, [state.activeProtocol]);

    const handleProfileChange = (field: keyof Profile, value: any) => setProfileData(prev => ({ ...prev, [field]: value }));
    const handleProtocolChange = (field: keyof UserProtocol, value: any) => setProtocolData(prev => ({ ...prev, [field]: value }));
    const handleEstimateChange = (field: string, value: string) => setProtocolData(prev => ({ ...prev, estimates: { ...prev.estimates, [field]: value === "" ? "" : Number(value) } }));
    const handleReminderChange = (field: string, value: any) => setProtocolData(prev => ({ ...prev, reminders: { ...prev.reminders, [field]: value } }));

    const toggleModality = (modality: Modality) => {
        setActiveInfluencer(null); // Clear influencer tag if they manually tweak
        setProtocolData(prev => {
            const exists = prev.activeModalities.find(m => m.id === modality.id || m.name === modality.name);
            if (exists) {
                return { ...prev, activeModalities: prev.activeModalities.filter(m => m.id !== modality.id && m.name !== modality.name) };
            } else {
                return { ...prev, activeModalities: [...prev.activeModalities, modality] };
            }
        });
    };

    const applyInfluencerProtocol = (influencerName: string, stackKeywords: string[]) => {
        setActiveInfluencer(influencerName);
        const selectedMods = normalizedModalities.filter(m => 
            stackKeywords.some(kw => m.name.toLowerCase().includes(kw))
        );
        setProtocolData(prev => ({
            ...prev,
            activeModalities: selectedMods
        }));
    };

    const toggleExpand = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setExpandedMods(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAddCustom = () => {
        if (!customModName.trim()) return;
        const newMod: Modality = {
            id: `custom-${Date.now()}`,
            name: customModName,
            description: customModDesc,
            category: 'general',
            defaultInstructions: ''
        };
        setCustomMods(prev => [...prev, newMod]);
        setProtocolData(prev => ({
            ...prev,
            activeModalities: [...prev.activeModalities, newMod]
        }));
        setCustomModName("");
        setCustomModDesc("");
        setShowCustomForm(false);
    };

    const save = async () => {
        updateProfile(profileData);
        await updateProtocol(protocolData);
        setSavedMsg("✅ Protocol Saved successfully! View your active stack on the Daily check-in page.");
        setTimeout(() => setSavedMsg(""), 5000); // clear after 5s
    };

    const hardReset = () => {
        if (confirm("Clear ALL data?")) reset();
    };

    const renderModalityCard = (mod: Modality) => {
        const isActive = protocolData.activeModalities.some(m => m.id === mod.id || m.name === mod.name);
        const isExpanded = expandedMods[mod.id];

        // Parse metadata if it's a string, or use as object
        let metadataObj: any = mod.metadata || {};
        if (typeof metadataObj === 'string') {
            try { metadataObj = JSON.parse(metadataObj); } catch(e) {}
        }
        
        const metadataEntries = Object.entries(metadataObj);

        return (
            <div 
                key={mod.id} 
                onClick={() => toggleModality(mod)}
                className={clsx(
                    "p-4 border rounded-xl cursor-pointer transition-all",
                    isActive
                        ? "border-[var(--accent2)] bg-gradient-to-br from-[rgba(94,155,255,0.15)] to-transparent"
                        : "border-[#2b3266] bg-[#161b33] hover:bg-[#1e2445]",
                    isExpanded ? "md:col-span-2 lg:col-span-3 scale-[1.01] shadow-xl relative z-10 bg-[#161b33]" : ""
                )}
            >
                <div className="flex justify-between items-start mb-2">
                    <h4 className={clsx("font-bold text-[var(--accent2)] leading-tight flex-1 pr-2", isExpanded ? "text-xl" : "text-sm")}>{mod.name}</h4>
                    <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5", isActive ? "border-[var(--accent2)] bg-[var(--accent2)]" : "border-[#404b80]")}>
                        {isActive && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                </div>
                
                <p className={clsx("text-[var(--text)] mb-3", isExpanded ? "text-sm" : "text-[11px]")}>{mod.description}</p>
                
                {metadataEntries.length > 0 && (
                    <div 
                        className="text-[10px] text-[var(--muted)] hover:text-white inline-flex items-center gap-1 font-medium select-none mb-1 px-2 py-1 bg-black/20 rounded-md"
                        onClick={(e) => toggleExpand(e, mod.id)}
                    >
                        {isExpanded ? "▼ Hide attributes" : "▶ Show attributes & evidence"}
                    </div>
                )}

                {isExpanded && metadataEntries.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#2b3266] cursor-default grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" onClick={(e) => e.stopPropagation()}>
                        {metadataEntries.map(([key, val]: any) => {
                            if (!val) return null;
                            const rating = val.rating;
                            const explanation = val.explanation || (typeof val === 'string' ? val : null);
                            if (!explanation && !rating) return null;

                            return (
                                <div key={key} className="text-xs leading-snug flex flex-col gap-1 bg-[#0e1228] p-3 rounded-lg border border-[rgba(255,255,255,0.05)] shadow-inner">
                                    <div className="flex justify-between items-baseline gap-2">
                                        <span className="font-bold text-[#8fbfff]">{key}</span>
                                        {rating != null && <span className="font-mono text-[#20c997] bg-[#20c997]/10 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{rating}/100</span>}
                                    </div>
                                    {explanation && <span className="text-[var(--muted)]">{explanation}</span>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mt-0 mb-4 text-white">LEVL Protocol Builder</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-[var(--muted)] text-sm mb-1">Participant Email</label>
                    <input type="text" className="input-field border-[var(--accent2)]" placeholder="name@email.com" value={profileData.participantEmail} onChange={(e) => handleProfileChange('participantEmail', e.target.value)} />
                </div>
                <div>
                    <label className="block text-[var(--muted)] text-sm mb-1">Participant Name</label>
                    <input type="text" className="input-field" value={profileData.participantName} onChange={(e) => handleProfileChange('participantName', e.target.value)} />
                </div>
            </div>

            <div className="h-px bg-[#222748] my-5"></div>

            <h3 className="font-bold mb-1 text-white text-lg">Assemble Your Sleep Protocol</h3>
            <p className="text-sm text-[var(--muted)] mb-5">Select the modalities you will follow for this tracking period. We natively recommend anchoring your stack with <b className="text-[var(--accent2)]">LIFESPAN+ DeepCell</b>.</p>

            {/* Influencer Quick Start */}
            <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#8fbfff] mb-3">Influencer Quick Starts</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {influencerProtocols.map(proto => (
                        <div 
                            key={proto.influencer}
                            onClick={() => applyInfluencerProtocol(proto.influencer, proto.stack)}
                            className={clsx(
                                "p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[90px]",
                                activeInfluencer === proto.influencer 
                                    ? "bg-[rgba(94,155,255,0.15)] border-[var(--accent2)] shadow-[0_0_15px_rgba(94,155,255,0.2)] scale-[1.02]" 
                                    : "bg-[#0e1228] border-[#2b3266] hover:bg-[#161b33] hover:border-[#404b80]"
                            )}
                        >
                            <span className="text-2xl mb-1 block">{proto.icon}</span>
                            <span className="text-xs font-bold text-white block leading-tight">{proto.name}</span>
                            <span className="text-[9px] text-[var(--muted)] mt-1">{proto.influencer}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Baseline & Other Mods */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {mainAnchor && renderModalityCard(mainAnchor)}
                {otherMods.map(renderModalityCard)}
            </div>

            {/* Grouped DeepCell Ingredients - conditionally collapsed */}
            {componentMods.length > 0 && (
                <details className="group mb-4 border border-[#2b3266] rounded-xl bg-[#0e1228]" open={!isAnchorActive}>
                    <summary className="cursor-pointer p-4 bg-[#1b2144] rounded-xl group-open:rounded-b-none font-semibold text-[var(--accent2)] flex justify-between items-center text-sm transition-colors hover:bg-[#222955]">
                        <div className="flex flex-wrap items-center gap-2 pr-3">
                            <span>Individual LIFESPAN+ DeepCell Supplements (Dial-in options)</span>
                            {isAnchorActive && <span className="text-[10px] bg-[rgba(94,155,255,0.2)] text-[#8fbfff] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Autocollapsed</span>}
                        </div>
                        <span className="group-open:hidden whitespace-nowrap text-xs font-bold bg-black/20 px-2 py-1 rounded">▶ Expand</span>
                        <span className="hidden group-open:block whitespace-nowrap text-xs font-bold bg-black/20 px-2 py-1 rounded">▼ Collapse</span>
                    </summary>
                    <div className="p-4 border-t border-[#2b3266]">
                        <p className="text-xs text-[var(--muted)] mb-4">If DeepCell overall isn&apos;t ideal for you, you can manually assemble its individual constituents to isolate what works best for your neurochemistry.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {componentMods.map(renderModalityCard)}
                        </div>
                    </div>
                </details>
            )}

            {/* Custom Modality Logic */}
            {!showCustomForm ? (
                <div 
                    onClick={() => setShowCustomForm(true)}
                    className="border border-dashed border-[#404b80] text-[var(--muted)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--accent2)] hover:text-[var(--accent2)] hover:bg-[#161b33] transition-all mb-5 font-medium"
                >
                    + Add Custom Modality
                </div>
            ) : (
                <div className="bg-[#1b2144] p-4 rounded-xl border border-[var(--accent2)] mb-5 shadow-[0_0_15px_rgba(94,155,255,0.1)]">
                    <h4 className="font-bold text-white mb-3">Create Custom Modality</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-[11px] text-[var(--muted)] mb-1">Modality Name</label>
                            <input type="text" className="input-field" placeholder="e.g. Chamomile Tea" value={customModName} onChange={e => setCustomModName(e.target.value)} autoFocus />
                        </div>
                        <div>
                            <label className="block text-[11px] text-[var(--muted)] mb-1">Short Description</label>
                            <input type="text" className="input-field" placeholder="e.g. 1 cup before bed" value={customModDesc} onChange={e => setCustomModDesc(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-primary text-sm py-1.5" onClick={handleAddCustom} disabled={!customModName.trim()}>Add & Select</button>
                        <button className="btn text-sm py-1.5" onClick={() => setShowCustomForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                    <label className="block text-[var(--muted)] text-sm mb-1">Protocol Start Date</label>
                    <input type="date" className="input-field max-w-[200px]" value={protocolData.startDate} onChange={(e) => handleProtocolChange('startDate', e.target.value)} />
                </div>
            </div>

            <div className="h-px bg-[#222748] my-5"></div>

            <label className="block text-[var(--muted)] text-sm mb-2">Select Study Mode:</label>
            <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div onClick={() => handleProtocolChange('mode', 'quick')} className={clsx("flex-1 p-4 border rounded-xl cursor-pointer text-center transition-all", protocolData.mode === 'quick' ? "border-[var(--accent2)] bg-gradient-to-b from-[rgba(94,155,255,0.1)] to-transparent shadow-[0_0_12px_rgba(94,155,255,0.15)]" : "border-[#2b3266] bg-[#161b33] hover:bg-[#1e2445]")}>
                    <h3 className="text-white font-bold mb-1">🚀 Quick Start</h3>
                    <p className="text-xs text-[var(--muted)]">Estimate your baseline now. Start Protocol immediately.</p>
                </div>
                <div onClick={() => handleProtocolChange('mode', 'advanced')} className={clsx("flex-1 p-4 border rounded-xl cursor-pointer text-center transition-all", protocolData.mode === 'advanced' ? "border-[var(--accent2)] bg-gradient-to-b from-[rgba(94,155,255,0.1)] to-transparent shadow-[0_0_12px_rgba(94,155,255,0.15)]" : "border-[#2b3266] bg-[#161b33] hover:bg-[#1e2445]")}>
                    <h3 className="text-white font-bold mb-1">🔬 Advanced Study</h3>
                    <p className="text-xs text-[var(--muted)]">Track for {protocolData.baselineDays} days <b>before</b> starting your protocol.</p>
                </div>
            </div>

            {protocolData.mode === 'quick' && (
                <div className="bg-[#1b2144] p-4 rounded-xl border border-[#2b3266] mb-4">
                    <div className="text-xs text-white mb-3"><b>Step 2: Estimate your typical baseline.</b> Be honest—this is what we compare against!</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div><label className="block text-[var(--muted)] text-sm mb-1">Sleep Quality (0-10)</label><input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={protocolData.estimates.sleep} onChange={(e) => handleEstimateChange('sleep', e.target.value)} /></div>
                        <div><label className="block text-[var(--muted)] text-sm mb-1">Speed to Sleep (0-10)</label><div className="text-[10px] text-[var(--muted)] -mt-1 mb-1">0=Slow, 10=Instant</div><input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={protocolData.estimates.latency} onChange={(e) => handleEstimateChange('latency', e.target.value)} /></div>
                        <div><label className="block text-[var(--muted)] text-sm mb-1">Typical Wake Ups (#)</label><input type="number" min="0" className="input-field" placeholder="e.g. 1" value={protocolData.estimates.wakeUps} onChange={(e) => handleEstimateChange('wakeUps', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div><label className="block text-[var(--muted)] text-sm mb-1">Morning Energy (0-10)</label><input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={protocolData.estimates.energy} onChange={(e) => handleEstimateChange('energy', e.target.value)} /></div>
                        <div><label className="block text-[var(--muted)] text-sm mb-1">Grogginess (0-10)</label><div className="text-[10px] text-[var(--muted)] -mt-1 mb-1">0=None/Alert, 10=Very Groggy</div><input type="number" min="0" max="10" className="input-field" placeholder="0-10" value={protocolData.estimates.groggy} onChange={(e) => handleEstimateChange('groggy', e.target.value)} /></div>
                        <div><label className="block text-[var(--muted)] text-sm mb-1">Sleep Score (0-100)</label><input type="number" min="0" max="100" className="input-field" placeholder="0-100" value={protocolData.estimates.score} onChange={(e) => handleEstimateChange('score', e.target.value)} /></div>
                    </div>
                </div>
            )}

            {protocolData.mode === 'advanced' && (
                <div className="bg-[#1b2144] p-4 rounded-xl border border-[#2b3266] mb-4">
                    <div className="text-xs text-white mb-3"><b>Step 2: Set Baseline Phase.</b> Please record data for these days without following your protocol.</div>
                    <div><label className="block text-[var(--muted)] text-sm mb-1">Baseline Duration (Days)</label><input type="number" min="3" className="input-field max-w-[120px]" value={protocolData.baselineDays} onChange={(e) => handleProtocolChange('baselineDays', Number(e.target.value))} /></div>
                </div>
            )}

            <div className="h-px bg-[#222748] my-5"></div>

            <details className="group">
                <summary className="cursor-pointer outline-none font-semibold mb-2 px-3 py-2 bg-[#1b2144] rounded-lg text-[var(--accent2)] flex items-center justify-between hover:bg-[#222955] list-none border border-transparent group-open:border-[#2b3266] group-open:rounded-b-none">
                    <span>Reminders (optional)</span>
                    <span className="text-lg font-bold group-open:hidden">+</span>
                    <span className="text-lg font-bold hidden group-open:block">−</span>
                </summary>
                <div className="p-3 bg-[#0e1228] border border-t-0 border-[#2b3266] rounded-b-lg -mt-2">
                    <div className="flex gap-3 flex-wrap">
                        <div className="w-[120px]"><label className="block text-[var(--muted)] text-sm mb-1">Enable</label><select className="input-field" value={protocolData.reminders.enabled ? "on" : "off"} onChange={(e) => handleReminderChange('enabled', e.target.value === "on")}><option value="off">Off</option><option value="on">On</option></select></div>
                        <div><label className="block text-[var(--muted)] text-sm mb-1">Protocol Action Time</label><input type="time" className="input-field" value={protocolData.reminders.doseTime} onChange={(e) => handleReminderChange('doseTime', e.target.value)} /></div>
                        <div><label className="block text-[var(--muted)] text-sm mb-1">Morning Check-in</label><input type="time" className="input-field" value={protocolData.reminders.nightlyTime} onChange={(e) => handleReminderChange('nightlyTime', e.target.value)} /></div>
                    </div>
                </div>
            </details>

            {savedMsg && (
                <div className="mt-4 p-4 bg-[rgba(32,201,151,0.1)] border border-[#20c997] text-[#20c997] rounded-xl text-sm font-semibold flex items-center gap-3 shadow-[0_0_15px_rgba(32,201,151,0.15)] transition-all">
                    <span className="text-xl">✅</span> {savedMsg}
                </div>
            )}

            <div className="flex gap-3 mt-5">
                <button className="btn btn-primary shadow-[0_0_15px_rgba(94,155,255,0.3)]" onClick={save}>Save Protocol</button>
                <button className="btn btn-warn" onClick={hardReset}>Reset All</button>
            </div>
        </div>
    );
}
