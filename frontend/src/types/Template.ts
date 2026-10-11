export interface Template {
    id: number;
    name: string;
    subject: string;
    body?: string;
    category?: string | null;
    preview?: string;
    used_in?: number;
    updated_at?: string;
}
