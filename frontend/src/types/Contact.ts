export interface Contact {
    id: number;
    agency_id: number;
    full_name: string;
    position: string;
    email: string;
    status: 'Subscribed' | 'Unsubscribed' | 'Bounced';
    tag: string;
    created_at?: string;
    agency?: { id: number; name: string };
}
