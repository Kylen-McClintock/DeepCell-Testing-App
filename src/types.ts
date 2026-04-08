export interface Profile {
    participantName: string;
    participantEmail: string;
}

export interface Modality {
    id: string;
    name: string;
    description: string;
    category: string;
    defaultInstructions: string;
    metadata?: Record<string, any>;
}

export interface Protocol {
    id: string;
    title: string;
    description: string;
    isRecommended: boolean;
    isPublic: boolean;
    modalities?: Modality[];
}

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

export interface UserProtocol {
    id?: string;
    userId?: string;
    startDate: string;
    baselineDays: number;
    activeModalities: Modality[];
    estimates: Estimates;
    reminders: Reminders;
    mode: "quick" | "advanced";
    status?: 'active' | 'archived';
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
    userProtocolId?: string;
    adherence: Record<string, boolean>; // map of modality ID to adherence boolean
    sliders: DailyMetrics;
    wakeUps?: number;
    wearables: Wearables;
    metrics: AdvancedMetrics;
    notes: string;
}

export interface AppState {
    version: number;
    profile: Profile;
    activeProtocol: UserProtocol | null;
    availableModalities: Modality[];
    daily: Record<string, DailyLog>;
}

export const defaultState: AppState = {
    version: 5.0,
    profile: {
        participantName: "",
        participantEmail: ""
    },
    activeProtocol: null,
    availableModalities: [],
    daily: {},
};
