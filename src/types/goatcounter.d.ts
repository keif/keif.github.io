interface GoatCounter {
    count: (options: { path: string; event: boolean }) => void;
}

declare global {
    interface Window {
        goatcounter?: GoatCounter;
    }
}

export {};
