// In Phase 1-4 MVP, this serves as the type definition for both local IndexedDB and future Supabase sync.

export type RajyaUser = {
    id: string; // auth.uid
    title: string; // Adhipati Name
    age: number;
    createdAt: string;
};

export type KoshEntry = {
    id: string;
    userId: string;
    amount: number; // Monthly Tribute
    confidenceScore: number; // For progressive disclosure (e.g., exact vs approx)
    updatedAt: string;
};

export type VyayaEntry = {
    id: string;
    userId: string;
    categoryId: string; // e.g. 'living', 'utilities'
    amount: number;
    dateLogged: string;
};

export type LeakageAudit = {
    id: string;
    userId: string;
    activeSubscriptions: string[]; // e.g. ['video', 'internet']
    auditedAt: string;
};

// The core gamification metric
export type RajyaState = {
    userId: string;
    stabilityScore: number; // Out of 100
    dataConfidenceScore: number; // Visual representation of how 'verified' the data is
    unlockedModules: string[];
};
