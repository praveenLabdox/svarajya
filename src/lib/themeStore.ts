// Global theme store — manages day/night mode across the app.
// Persists to localStorage when available.

export type ThemeMode = "dark" | "light";

let _mode: ThemeMode = "dark";

function loadFromStorage(): ThemeMode {
    if (typeof window === "undefined") return "dark";
    try {
        const stored = localStorage.getItem("rajya-theme");
        if (stored === "light" || stored === "dark") return stored;
    } catch { }
    return "dark";
}

function applyToDOM(mode: ThemeMode) {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(mode);
    html.style.colorScheme = mode;
}

export const ThemeStore = {
    init() {
        _mode = loadFromStorage();
        applyToDOM(_mode);
    },

    get(): ThemeMode {
        return _mode;
    },

    set(mode: ThemeMode) {
        _mode = mode;
        applyToDOM(mode);
        try { localStorage.setItem("rajya-theme", mode); } catch { }
    },

    toggle(): ThemeMode {
        const next = _mode === "dark" ? "light" : "dark";
        this.set(next);
        return next;
    },
};
