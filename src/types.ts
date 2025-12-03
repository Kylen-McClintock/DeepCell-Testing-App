export interface Estimates {
    sleep: number | "";
    latency: number | "";
    wakeUps: number | "";
    energy: number | "";
    groggy: number | "";
    focus: number | "";
    mood: number | "";
    stress: number | "";
    score: number | "";
}

export interface Reminders {
    enabled: boolean;
    doseTime: string;
    nightlyTime: string;
}

export interface Plan {
    participantName: string;
    participantEmail: string;
    productName: string;
    productVersion: string;
    startDate: string;
    baselineDays: number;
    doseNotes: string;
    defaultDose: number;
    mode: "quick" | "advanced";
    estimates: Estimates;
    reminders: Reminders;
}

export interface DailyMetrics {
    sleep: number;
    latency: number;
    groggy: number;
    energy: number;
    focus: number;
    mood: number;
    stress: number;
}

export interface Wearables {
    score?: number | "";
    total?: string;
    deep?: number | "";
    rem?: number | "";
}

export interface AdvancedMetrics {
    weight?: number;
    rhr?: number;
    hrv?: number;
    bp_sys?: number;
    bp_dia?: number;
    rt?: number;
}

export interface DailyLog {
    date: string;
    tookDose: "yes" | "no";
    doseAmount?: number;
    sliders: DailyMetrics;
    wakeUps?: number;
    wearables: Wearables;
    metrics: AdvancedMetrics;
    notes: string;
}

export interface AppState {
    version: number;
    plan: Plan;
    daily: Record<string, DailyLog>;
}

export const defaultState: AppState = {
    version: 4.3,
    plan: {
        participantName: "",
        participantEmail: "",
        productName: "LIFESPAN+ DeepCell",
        productVersion: "",
        startDate: "",
        baselineDays: 7,
        doseNotes: "3 capsules 30 mins before bed",
        defaultDose: 3,
        mode: "quick",
        estimates: {
            sleep: "",
            latency: "",
            wakeUps: "",
            energy: "",
            groggy: "",
            focus: "",
            mood: "",
            stress: "",
            score: "",
        },
        reminders: { enabled: true, doseTime: "21:30", nightlyTime: "08:00" },
    },
    daily: {},
};
