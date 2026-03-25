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

export function validateIndianMobile(raw: string): { valid: boolean; message?: string; normalized: string } {
    const normalized = normalizeIndianMobile(raw);
    if (normalized.length !== 10) {
        return { valid: false, message: "Mobile number must be exactly 10 digits", normalized };
    }
    if (!/^[6-9]/.test(normalized)) {
        return { valid: false, message: "Valid mobile numbers must start with 6, 7, 8, or 9", normalized };
    }
    return { valid: true, normalized };
}

export function validateControlledEmail(email: string): { valid: boolean; message?: string; normalized: string } {
    const cleaned = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleaned) {
        return { valid: false, message: "Email is required", normalized: "" };
    }
    if (!emailRegex.test(cleaned)) {
        return { valid: false, message: "Please enter a valid email address", normalized: cleaned };
    }
    return { valid: true, normalized: cleaned };
}
