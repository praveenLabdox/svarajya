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
    mobile?: string;
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
    set: async (partial: Partial<OnboardingData>) => {
        _data = { ..._data, ...partial };
        // Sync to API in background
        if (typeof window !== 'undefined') {
            try {
                await fetch('/api/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(_data)
                });
            } catch (err) {
                console.error("Failed to sync profile", err);
            }
        }
    },
    addFamilyMember: async (member: any) => {
        _data.familyMembers = [...(_data.familyMembers || []), member];
        if (typeof window !== 'undefined') {
            try {
                // Generate a temporary ID until we fetch the real one, or let the API generate it
                const res = await fetch('/api/family', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(member)
                });
                if (res.ok) {
                    const dbMember = await res.json();
                    // Replace temp local member with DB verified member
                    _data.familyMembers = _data.familyMembers!.map(m => m.id === member.id ? dbMember : m);
                }
            } catch (err) {
                console.error("Failed to sync family member", err);
            }
        }
    },
    hydrate: async () => {
        if (typeof window !== 'undefined') {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const dbProfile = await res.json();
                    if (dbProfile) {
                        _data = { ..._data, ...dbProfile };
                    }
                }
            } catch (err) {
                console.error("Failed to hydrate profile", err);
            }
        }
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
