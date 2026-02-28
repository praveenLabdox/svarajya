// Shared in-memory store for onboarding data across steps.
// In Phase 2 this will be replaced by writing to Supabase on completion.

export type OnboardingData = {
    fullName: string;
    dob: string;
    lifePhase: string;
    maritalStatus: string;
    occupationType: string;
    occupationOther: string;
    email: string;
    whatsappEnabled: boolean;
    priority: string; // Save / Protect / Grow / Organise
    familyMembers: Array<{
        id: string;
        name: string;
        relationship: string;
        dob: string;
        dependent: boolean;
        nomineeEligible: boolean;
        accessRole: "Viewer" | "Executor" | "Emergency-only" | "None";
    }>;
};

let _data: Partial<OnboardingData> = {};

export const OnboardingStore = {
    get: () => ({ ..._data }),
    set: (partial: Partial<OnboardingData>) => {
        _data = { ..._data, ...partial };
    },
    reset: () => { _data = {}; },
};

// Life Phase logic derived from DOB
export function deriveLifePhase(dob: string): string {
    if (!dob) return "Nirmaan";
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 25) return "Yuva";
    if (age < 40) return "Nirmaan";
    if (age < 60) return "Sthirta";
    return "Parampara";
}
