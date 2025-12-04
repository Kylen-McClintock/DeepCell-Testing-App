import { useState, useEffect } from 'react';
import { AppState, defaultState, Plan, DailyLog } from '@/types';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = "levl_deepcell_v4_3";

export function useStore() {
    const [state, setState] = useState<AppState>(defaultState);
    const [loading, setLoading] = useState(true);

    // Load initial state
    useEffect(() => {
        const load = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    // Load from Supabase
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    const { data: logs } = await supabase
                        .from('daily_logs')
                        .select('*')
                        .eq('user_id', session.user.id);

                    if (profile || (logs && logs.length > 0)) {
                        const daily: Record<string, DailyLog> = {};
                        logs?.forEach((log: any) => {
                            daily[log.date] = {
                                date: log.date,
                                tookDose: log.took_dose,
                                doseAmount: log.dose_amount ? Number(log.dose_amount) : undefined,
                                sliders: log.sliders,
                                wakeUps: log.wake_ups,
                                wearables: log.wearables,
                                metrics: log.metrics,
                                notes: log.notes
                            };
                        });

                        const plan: Plan = {
                            ...defaultState.plan,
                            participantEmail: session.user.email || "",
                            ...(profile ? {
                                participantName: profile.participant_name,
                                participantEmail: profile.participant_email || session.user.email || "",
                                productName: profile.product_name,
                                productVersion: profile.product_version,
                                startDate: profile.start_date,
                                baselineDays: profile.baseline_days,
                                doseNotes: profile.dose_notes,
                                defaultDose: profile.default_dose ? Number(profile.default_dose) : 3,
                                mode: profile.mode,
                                estimates: profile.estimates,
                                reminders: profile.reminders
                            } : {})
                        };

                        setState({
                            version: 4.3,
                            plan,
                            daily
                        });
                    } else {
                        // Fallback to local storage if no cloud data found (first login?)
                        const raw = localStorage.getItem(STORAGE_KEY);
                        if (raw) {
                            try {
                                const obj = JSON.parse(raw);
                                setState({ ...defaultState, ...obj });
                            } catch (e) { }
                        }
                    }
                } else {
                    // No session, check local storage just in case
                    const raw = localStorage.getItem(STORAGE_KEY);
                    if (raw) {
                        try {
                            const obj = JSON.parse(raw);
                            setState({ ...defaultState, ...obj });
                        } catch (e) { }
                    }
                }
            } catch (err) {
                console.error("Store load error:", err);
                // alert("Error loading data: " + (err as any).message); // Optional: alert user
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const saveProfile = async (plan: Plan) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const updates = {
            id: session.user.id,
            updated_at: new Date(),
            participant_name: plan.participantName,
            participant_email: plan.participantEmail,
            product_name: plan.productName,
            product_version: plan.productVersion,
            start_date: plan.startDate,
            baseline_days: plan.baselineDays,
            dose_notes: plan.doseNotes,
            default_dose: plan.defaultDose,
            mode: plan.mode,
            estimates: plan.estimates,
            reminders: plan.reminders
        };

        const { error } = await supabase.from('profiles').upsert(updates);
        if (error) console.error('Error saving profile:', error);
    };

    const saveDailyLog = async (date: string, log: DailyLog) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const updates = {
            user_id: session.user.id,
            date: date,
            updated_at: new Date(),
            took_dose: log.tookDose,
            dose_amount: log.doseAmount,
            sliders: log.sliders,
            wake_ups: log.wakeUps,
            wearables: log.wearables,
            metrics: log.metrics,
            notes: log.notes
        };

        const { error } = await supabase.from('daily_logs').upsert(updates, { onConflict: 'user_id,date' });
        if (error) console.error('Error saving log:', error);
    };

    const updatePlan = (updates: Partial<Plan>) => {
        const newPlan = { ...state.plan, ...updates };
        const newState = { ...state, plan: newPlan };
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        saveProfile(newPlan);
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
                await supabase.from('profiles').delete().eq('id', session.user.id);
            }
            localStorage.removeItem(STORAGE_KEY);
            setState(defaultState);
            window.location.reload();
        }
    };

    return { state, loading, updatePlan, updateDaily, reset };
}
