declare class SpinnerManager {
    private spinner;
    start(text: string): void;
    succeed(text?: string): void;
    fail(text?: string): void;
    update(text: string): void;
    stop(): void;
}
export declare const spinner: SpinnerManager;
export {};
