const MAJOR_EMAIL_PROVIDERS = new Set([
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "yahoo.com",
    "icloud.com",
    "proton.me",
    "protonmail.com",
    "zoho.com",
    "aol.com",
    "rediffmail.com",
]);

const DISPOSABLE_EMAIL_PATTERNS = [
    "mailinator",
    "10minutemail",
    "tempmail",
    "guerrillamail",
    "yopmail",
    "trashmail",
    "sharklasers",
    "fakeinbox",
    "dispostable",
    "getnada",
];

export function normalizeIndianMobile(raw: string): string {
    const digits = raw.replace(/\D/g, "");

    if (digits.length === 12 && digits.startsWith("91")) {
        return digits.slice(2);
    }

    if (digits.length === 11 && digits.startsWith("0")) {
        return digits.slice(1);
    }

    return digits;
}

export function validateIndianMobile(raw: string): { valid: boolean; normalized: string; message?: string } {
    const normalized = normalizeIndianMobile(raw);

    if (!/^\d{10}$/.test(normalized)) {
        return { valid: false, normalized, message: "Mobile number must be exactly 10 digits." };
    }

    if (!/^[6-9]/.test(normalized)) {
        return { valid: false, normalized, message: "Mobile number must start with 6, 7, 8, or 9." };
    }

    return { valid: true, normalized };
}

export function validateControlledEmail(raw: string): { valid: boolean; normalized: string; message?: string } {
    const normalized = raw.trim().toLowerCase();

    if (!normalized) {
        return { valid: false, normalized, message: "Email is required." };
    }

    const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!basic) {
        return { valid: false, normalized, message: "Please enter a valid email address." };
    }

    const domain = normalized.split("@")[1] || "";

    if (DISPOSABLE_EMAIL_PATTERNS.some(pattern => domain.includes(pattern))) {
        return { valid: false, normalized, message: "Temporary/disposable email domains are not allowed." };
    }

    if (!MAJOR_EMAIL_PROVIDERS.has(domain)) {
        return { valid: false, normalized, message: "Use a major email provider (for example Gmail, Outlook, Yahoo, iCloud, or Proton)." };
    }

    return { valid: true, normalized };
}
