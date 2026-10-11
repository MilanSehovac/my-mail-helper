export interface Agency {
    id: number;
    name: string;
    country: string;
    city?: string | null;
    website?: string | null;
    segment_tag?: string | null;
    status: 'Research'| 'First Contact'| 'First Follow-up'| 'Second Follow-up'| 'Third Follow-up'| 'interview'| 'Rejected'| 'Accepted' | 'Ghosted';
    counter: number;
    last_contact?: string | null;
    comment?: string | null;
    contacts_count? : number;

}