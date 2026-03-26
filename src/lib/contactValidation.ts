

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

    return { valid: true, normalized };
}
