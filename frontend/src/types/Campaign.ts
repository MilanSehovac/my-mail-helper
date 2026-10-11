export interface Campaign {
    id: number;
    name: string;
    target: string;
    sent: number;
    total: number;
    status: 'Scheduled' | 'Sending' | 'Completed' | 'Paused';
}
