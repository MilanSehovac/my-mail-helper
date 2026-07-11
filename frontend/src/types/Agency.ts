export interface Agency {
    id: number;
    name: string;
    country: 'HR' | 'SRB' | 'BiH' | 'CG';
    city?: string | null;
    website?: string | null;
    focus_tags?: string | null;
    status: 'Istraživanje' | 'Poslat 1. mail' | 'Poslat Follow-up' | 'Intervju' | 'Odbijen' | 'Prihvaćen' | 'Ghostovan';
    counter: number;
    last_contact?: string | null;
    comment?: string | null;

}