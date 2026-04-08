import { useState, useEffect } from 'react';
import { AppState, defaultState, UserProtocol, Profile, DailyLog, Modality } from '@/types';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = "levl_protocols_v5_0";

export function useStore() {
    const [state, setState] = useState<AppState>(defaultState);
    const [loading, setLoading] = useState(true);

    const loadAvailableModalities = async () => {
        try {
            const { data, error } = await supabase.from('modalities').select('*');
            if (!error && data) {
                const mapped: Modality[] = data.map(d => ({
                    id: d.id,
                    name: d.name,
                    description: d.description,
                    category: d.category,
                    defaultInstructions: d.default_instructions,
                    metadata: d.metadata
                }));
                setState(prev => ({ ...prev, availableModalities: mapped }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Load initial state
    useEffect(() => {
        const load = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                // Always try to load modalities
                await loadAvailableModalities();

                if (session) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    const { data: protocols } = await supabase
                        .from('user_protocols')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .eq('status', 'active')
                        .order('start_date', { ascending: false })
                        .limit(1);

                    const activeUserProtocol = protocols && protocols.length > 0 ? protocols[0] : null;

                    let logs = [];
                    if (activeUserProtocol) {
                        const { data: logData } = await supabase
                            .from('daily_logs')
                            .select('*')
                            .eq('user_id', session.user.id)
                            .eq('user_protocol_id', activeUserProtocol.id);
                        if (logData) logs = logData;
                    } else {
                         const { data: logData } = await supabase
                            .from('daily_logs')
                            .select('*')
                            .eq('user_id', session.user.id);
                         if (logData) logs = logData;
                    }

                    if (profile || activeUserProtocol || logs.length > 0) {
                        const daily: Record<string, DailyLog> = {};
                        logs?.forEach((log: any) => {
                            daily[log.date] = {
                                date: log.date,
                                userProtocolId: log.user_protocol_id,
                                adherence: log.adherence || {},
                                sliders: log.sliders || { sleep: 0, latency: 0, groggy: 0, energy: 0, focus: 0, mood: 0, stress: 0 },
                                wakeUps: log.wake_ups,
                                wearables: log.wearables || {},
                                metrics: log.metrics || {},
                                notes: log.notes || ''
                            };
                        });

                        const loadedProfile: Profile = {
                            participantName: profile?.participant_name || "",
                            participantEmail: profile?.participant_email || session.user.email || ""
                        };

                        let parsedProtocol: UserProtocol | null = null;
                        if (activeUserProtocol) {
                             parsedProtocol = {
                                 id: activeUserProtocol.id,
                                 userId: activeUserProtocol.user_id,
                                 startDate: activeUserProtocol.start_date,
                                 baselineDays: activeUserProtocol.baseline_days,
                                 activeModalities: activeUserProtocol.active_modalities || [],
                                 estimates: activeUserProtocol.estimates || { sleep: "", latency: "", wakeUps: "", energy: "", groggy: "", focus: "", mood: "", stress: "", score: "" },
                                 reminders: activeUserProtocol.reminders || { enabled: false, doseTime: "", nightlyTime: "" },
                                 mode: activeUserProtocol.mode || 'quick',
                                 status: activeUserProtocol.status
                             };
                        }

                        setState(prev => ({
                            ...prev,
                            version: 5.0,
                            profile: loadedProfile,
                            activeProtocol: parsedProtocol,
                            daily
                        }));
                    } else {
                        const raw = localStorage.getItem(STORAGE_KEY);
                        if (raw) {
                            try {
                                const obj = JSON.parse(raw);
                                setState(prev => ({ ...prev, ...obj }));
                            } catch (e) { }
                        }
                    }
                } else {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    if (raw) {
                        try {
                            const obj = JSON.parse(raw);
                            setState(prev => ({ ...prev, ...obj }));
                        } catch (e) { }
                    }
                }
            } catch (err) {
                console.error("Store load error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const saveProfile = async (profile: Profile) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const updates = {
            id: session.user.id,
            updated_at: new Date(),
            participant_name: profile.participantName,
            participant_email: profile.participantEmail,
        };
        const { error } = await supabase.from('profiles').upsert(updates);
        if (error) console.error('Error saving profile:', error);
    };

    const saveUserProtocol = async (protocol: UserProtocol) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const record: any = {
            user_id: session.user.id,
            start_date: protocol.startDate,
            baseline_days: protocol.baselineDays,
            active_modalities: protocol.activeModalities,
            estimates: protocol.estimates,
            reminders: protocol.reminders,
            mode: protocol.mode,
            status: protocol.status || 'active',
            updated_at: new Date()
        };

        if (protocol.id) {
            record.id = protocol.id;
        }

        if (!record.id) {
           const { data, error } = await supabase.from('user_protocols').insert(record).select().single();
           if (error) { console.error('Error inserting protocol:', error); return null; }
           return data.id;
        } else {
           const { error } = await supabase.from('user_protocols').update(record).eq('id', record.id);
           if (error) console.error('Error updating protocol:', error);
           return record.id;
        }
    };

    const saveDailyLog = async (date: string, log: DailyLog) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const updates = {
            user_id: session.user.id,
            user_protocol_id: log.userProtocolId,
            date: date,
            updated_at: new Date(),
            adherence: log.adherence,
            sliders: log.sliders,
            wake_ups: log.wakeUps,
            wearables: log.wearables,
            metrics: log.metrics,
            notes: log.notes
        };

        const { error } = await supabase.from('daily_logs').upsert(updates, { onConflict: 'user_id,date' });
        if (error) console.error('Error saving log:', error);
    };

    const updateProfile = (updates: Partial<Profile>) => {
        const newProfile = { ...state.profile, ...updates };
        const newState = { ...state, profile: newProfile };
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        saveProfile(newProfile);
    };

    const updateProtocol = async (updates: Partial<UserProtocol>) => {
        const currentProtocol = state.activeProtocol || {
            startDate: new Date().toISOString().split('T')[0],
            baselineDays: 7,
            activeModalities: [],
            estimates: { sleep: "", latency: "", wakeUps: "", energy: "", groggy: "", focus: "", mood: "", stress: "", score: "" },
            reminders: { enabled: false, doseTime: "", nightlyTime: "" },
            mode: "quick",
            status: 'active'
        } as UserProtocol;

        const newProtocol = { ...currentProtocol, ...updates } as UserProtocol;
        const newState = { ...state, activeProtocol: newProtocol };
        
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        
        const newId = await saveUserProtocol(newProtocol);
        if (newId && !newProtocol.id) {
            const withId = { ...newProtocol, id: newId };
            setState({ ...newState, activeProtocol: withId });
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...newState, activeProtocol: withId }));
        }
    };

    const updateDaily = (date: string, updates: DailyLog) => {
        const newDaily = { ...state.daily, [date]: updates };
        const newState = { ...state, daily: newDaily };
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        saveDailyLog(date, updates);
    };

    const reset = async () => {
        if (confirm("Clear ALL data? This will delete data from the cloud too.")) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await supabase.from('daily_logs').delete().eq('user_id', session.user.id);
                await supabase.from('user_protocols').delete().eq('user_id', session.user.id);
                await supabase.from('profiles').delete().eq('id', session.user.id);
            }
            localStorage.removeItem(STORAGE_KEY);
            setState(defaultState);
            window.location.reload();
        }
    };

    return { state, loading, updateProfile, updateProtocol, updateDaily, reset };
}
