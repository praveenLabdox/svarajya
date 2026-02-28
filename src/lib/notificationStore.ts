// Notification system — in-memory store for admin/system notifications and pending task nudges.

export type NotificationType = "info" | "warning" | "action" | "milestone";

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    route?: string; // optional deep link
    read: boolean;
    createdAt: number;
}

let _notifications: Notification[] = [];
let _initialized = false;

function genId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Default system notifications seeded on first access
function seedDefaults() {
    if (_initialized) return;
    _initialized = true;
    _notifications = [
        {
            id: genId(),
            type: "action",
            title: "Complete your Identity Vault",
            message: "You haven't added any identity documents yet. Start with your PAN or Aadhaar.",
            route: "/identity/add",
            read: false,
            createdAt: Date.now() - 60000,
        },
        {
            id: genId(),
            type: "info",
            title: "Welcome to Sva-Rajya",
            message: "Your personal financial governance system is ready. Explore the dashboard to get started.",
            route: "/dashboard",
            read: false,
            createdAt: Date.now() - 120000,
        },
        {
            id: genId(),
            type: "warning",
            title: "Foundation Profile Incomplete",
            message: "Upload a profile photo and complete your family details to strengthen your foundation.",
            route: "/foundation",
            read: false,
            createdAt: Date.now() - 180000,
        },
    ];
}

export const NotificationStore = {
    getAll(): Notification[] {
        seedDefaults();
        return [..._notifications].sort((a, b) => b.createdAt - a.createdAt);
    },

    getUnreadCount(): number {
        seedDefaults();
        return _notifications.filter(n => !n.read).length;
    },

    markRead(id: string) {
        const n = _notifications.find(n => n.id === id);
        if (n) n.read = true;
    },

    markAllRead() {
        _notifications.forEach(n => { n.read = true; });
    },

    // Admin or system can push notifications
    push(partial: Omit<Notification, "id" | "read" | "createdAt">) {
        seedDefaults();
        _notifications.unshift({
            id: genId(),
            ...partial,
            read: false,
            createdAt: Date.now(),
        });
    },

    // Generate task-based nudges from current state
    generatePendingTaskNudges(identityCoverage: number, identityConfidence: number) {
        seedDefaults();
        // Only add if not already present
        const existingTitles = new Set(_notifications.map(n => n.title));

        if (identityCoverage < 3 && !existingTitles.has("Add more identity documents")) {
            this.push({
                type: "action",
                title: "Add more identity documents",
                message: `You've added ${identityCoverage} of 6 documents. Add more to improve your identity readiness.`,
                route: "/identity",
            });
        }

        if (identityConfidence > 0 && identityConfidence < 60 && !existingTitles.has("Strengthen your seals")) {
            this.push({
                type: "warning",
                title: "Strengthen your seals",
                message: "Your identity confidence is below 60%. Upload files and verify documents to improve.",
                route: "/identity",
            });
        }
    },

    clear() {
        _notifications = [];
        _initialized = false;
    },
};
