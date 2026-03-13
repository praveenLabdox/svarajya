export type ValidationLevel = "valid" | "warning" | "invalid";

export interface ValidationResult {
    status: ValidationLevel;
    message: string;
    normalizedValue: string;
}

export const DocumentValidator = {
    validateAadhaar(rawInput: string): ValidationResult {
        const normalized = rawInput.replace(/[\s-]/g, "");
        if (!/^[0-9]{12}$/.test(normalized)) {
            return {
                status: "invalid",
                message: "Aadhaar number must be exactly 12 digits without letters or symbols.",
                normalizedValue: normalized
            };
        }
        // Obvious pattern check
        if (/^(\d)\1{11}$/.test(normalized) || normalized === "123456789012") {
            return {
                status: "invalid",
                message: "This Aadhaar number looks like a dummy pattern.",
                normalizedValue: normalized
            };
        }
        return { status: "valid", message: "", normalizedValue: normalized };
    },

    validatePAN(rawInput: string): ValidationResult {
        const normalized = rawInput.replace(/\s/g, "").toUpperCase();
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(normalized)) {
            return {
                status: "invalid",
                message: "PAN should be 10 characters in the format ABCDE1234F.",
                normalizedValue: normalized
            };
        }
        return { status: "valid", message: "", normalizedValue: normalized };
    },

    validateVoterID(rawInput: string): ValidationResult {
        const normalized = rawInput.replace(/\s/g, "").toUpperCase();
        
        // Strict modern format
        if (/^[A-Z]{3}[0-9]{7}$/.test(normalized)) {
            return { status: "valid", message: "", normalizedValue: normalized };
        }
        
        // Legacy fallback format
        if (/^[A-Z0-9]{8,13}$/.test(normalized)) {
            return {
                status: "warning",
                message: "This Voter ID does not match the common EPIC format. Please verify once before saving.",
                normalizedValue: normalized
            };
        }

        return {
            status: "invalid",
            message: "Voter ID should contain only letters and numbers (8-13 characters long).",
            normalizedValue: normalized
        };
    },

    validatePassport(rawInput: string): ValidationResult {
        const normalized = rawInput.replace(/\s/g, "").toUpperCase();
        if (!/^[A-Z][0-9]{7}$/.test(normalized)) {
            return {
                status: "invalid",
                message: "Passport number should be 1 letter followed by 7 digits.",
                normalizedValue: normalized
            };
        }
        return { status: "valid", message: "", normalizedValue: normalized };
    },

    validateDrivingLicence(rawInput: string): ValidationResult {
        const normalized = rawInput.replace(/[\s-]/g, "").toUpperCase();
        if (/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(normalized)) {
            return { status: "valid", message: "", normalizedValue: normalized };
        }
        
        // If it roughly looks like a DL but doesn't perfectly match the precise length of modern DLs
        if (/^[A-Z0-9]{10,20}$/.test(normalized)) {
            return {
                status: "warning",
                message: "This licence number does not match the common Parivahan format. Please verify.",
                normalizedValue: normalized
            };
        }

        return {
            status: "invalid",
            message: "Driving Licence number can contain only letters and digits.",
            normalizedValue: normalized
        };
    },

    validateUAN(rawInput: string): ValidationResult {
        const normalized = rawInput.replace(/\s/g, "");
        if (!/^[0-9]{12}$/.test(normalized)) {
            return {
                status: "invalid",
                message: "UAN must be exactly 12 digits.",
                normalizedValue: normalized
            };
        }
        return { status: "valid", message: "", normalizedValue: normalized };
    },

    validateGSTIN(rawInput: string, linkedPAN?: string): ValidationResult {
        const normalized = rawInput.replace(/\s/g, "").toUpperCase();
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/.test(normalized)) {
            return {
                status: "invalid",
                message: "GSTIN format looks invalid. It must be exactly 15 characters matching standard structure.",
                normalizedValue: normalized
            };
        }

        if (linkedPAN && linkedPAN.trim().length === 10) {
            const panSegment = normalized.substring(2, 12);
            if (panSegment !== linkedPAN.toUpperCase()) {
                return {
                    status: "warning",
                    message: "The PAN inside this GSTIN does not match the PAN you entered.",
                    normalizedValue: normalized
                };
            }
        }

        return { status: "valid", message: "", normalizedValue: normalized };
    },

    validateIFSC(rawInput: string): ValidationResult {
        const normalized = rawInput.replace(/\s/g, "").toUpperCase();
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(normalized)) {
            return {
                status: "invalid",
                message: "IFSC must be 11 characters and look like HDFC0001234 (5th character must be 0).",
                normalizedValue: normalized
            };
        }
        return { status: "valid", message: "", normalizedValue: normalized };
    },

    validateBankAccount(rawInput: string): ValidationResult {
        const normalized = rawInput.replace(/\s/g, "");
        if (!/^[0-9]{9,18}$/.test(normalized)) {
            return {
                status: "invalid",
                message: "Bank account number should contain only digits and be between 9 and 18 characters long.",
                normalizedValue: normalized
            };
        }
        if (/^0+$/.test(normalized)) {
            return {
                status: "invalid",
                message: "Bank account number cannot be all zeros.",
                normalizedValue: normalized
            };
        }
        return { status: "valid", message: "", normalizedValue: normalized };
    },

    validatePIN(rawInput: string): ValidationResult {
        const normalized = rawInput.replace(/\s/g, "");
        if (!/^[1-9][0-9]{5}$/.test(normalized)) {
            return {
                status: "invalid",
                message: "PIN code must be exactly 6 digits and cannot start with 0.",
                normalizedValue: normalized
            };
        }
        return { status: "valid", message: "", normalizedValue: normalized };
    },

    /**
     * General router for document types, mapped to the IdentityStore's DocType.
     * Note: Not all types in DocType have explicit validations yet, fallback to loose.
     */
    validateByType(docType: string, rawInput: string): ValidationResult {
        switch (docType) {
            case "aadhaar": return this.validateAadhaar(rawInput);
            case "pan": return this.validatePAN(rawInput);
            case "passport": return this.validatePassport(rawInput);
            case "dl": return this.validateDrivingLicence(rawInput);
            case "voter": return this.validateVoterID(rawInput);
            // Handle future proofing and unmapped types loosely
            default: return { status: "valid", message: "", normalizedValue: rawInput.trim() };
        }
    }
};
