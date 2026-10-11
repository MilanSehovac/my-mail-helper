import {useEffect, useState} from "react";
import API from "../api/axios";
import Hero from "../components/Hero";
import Modal from "../components/Modal";
import CampaignTable from "../components/CampaignTable";
import CampaignCards from "../components/CampaignCards";
import type {Campaign} from "../types/Campaign";
import {CheckCircle2, Layers, Send, Activity} from "lucide-react";

export default function Campaigns(){
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null);

    useEffect(() =>{
        const fetchCampaigns = async () => {
            try{
                const res = await API.get('/campaign')
                setCampaigns(res.data)
            } catch (error){
                console.error('Error fetching campaigns: ', error)
            }
        }
        fetchCampaigns()
    }, [])

    // Only real, persisted numbers: open/reply/bounce rates need provider events (see TODO.md).
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sent ?? 0), 0);
    const summaryCards = [
        { label: "Total Sent", value: totalSent, sub: "Accepted by SMTP server", icon: Send, accent: "text-sky-400", bg: "bg-sky-400/10" },
        { label: "Campaigns", value: campaigns.length, icon: Layers, accent: "text-violet-400", bg: "bg-violet-400/10" },
        { label: "Active", value: campaigns.filter((c) => c.status === 'Sending' || c.status === 'Scheduled').length, icon: Activity, accent: "text-amber-400", bg: "bg-amber-400/10" },
        { label: "Completed", value: campaigns.filter((c) => c.status === 'Completed').length, icon: CheckCircle2, accent: "text-emerald-400", bg: "bg-emerald-400/10" },
    ];

    const launchCampaign = async (id: number) => {
        try {
            const res = await API.post(`/campaign/${id}/launch`);

            setCampaigns((prev) =>
                prev.map((c) =>
                    c.id === id ? { ...c, status: res.data.status, total: res.data.total } : c
                )
            );
        } catch (error: any) {
            console.error('Error launching campaign:', error);
            alert(error.response?.data?.error || 'Could not launch campaign');
        }
    };

    const pauseCampaign = async (id: number) => {
        try {
            await API.put(`/campaign/${id}`, { status: 'Paused' });

            setCampaigns((prev) =>
                prev.map((c) =>
                    c.id === id ? { ...c, status: 'Paused' } : c
                )
            );
        } catch (error) {
            console.error('Error pausing campaign:', error);
        }
    };

    const toggleCampaign = (id: number) => {
        const campaign = campaigns.find(c => c.id === id);
        if (campaign?.status === 'Paused') {
            launchCampaign(id);
        } else {
            pauseCampaign(id);
        }
    };

    const triggerDeleteModal = (id: number) => {
        setCampaignToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!campaignToDelete) return;
        try {
            await API.delete(`/campaign/${campaignToDelete}`);
            setCampaigns(campaigns.filter(campaign => campaign.id !== campaignToDelete));
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error deleting campaign:', error);
        }
    };
    return(
        <div className={'container mx-auto'}>
            <Hero
                title={'Email Campaigns'}
                paragraph={'Manage and monitor all your outreach campaigns.'}
                buttonText={'New Campaign'}
                href={'/campaigns/create'}
            />
            <CampaignCards
                data={summaryCards}
            />
            <CampaignTable
                data={campaigns}
                onDelete={triggerDeleteModal}
                onPause={toggleCampaign}
            />
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Brisanje Kampanje"
                message="Da li ste sigurni da želite da obrišete ovu kampanju? Ova akcija je nepovratna i obrisat će sve povezane podatke."
            />
        </div>
    )
}