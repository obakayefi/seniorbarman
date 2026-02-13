export type ScanError = {
    title: string;
    message: string;
    suggestion?: string;
    canVoid?: boolean;
    canCheckOut?: boolean;
    ticket?: any;
}
