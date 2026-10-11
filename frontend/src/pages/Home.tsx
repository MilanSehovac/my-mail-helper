import {useState, useEffect} from "react";
import type {Agency} from "../types/Agency";
import API from "../api/axios";
import AgencyTable from "../components/AgencyTable";
import Modal from "../components/Modal";
import Hero from "../components/Hero";
import Cards from "../components/Cards";
import {Building2, TrendingUp, Users} from "lucide-react";
export default function Home() {
    const [agencies, setAgencies] = useState<Agency[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [agencyToDelete, setAgencyToDelete] = useState<number | null>(null);

    useEffect(() =>{
        const fetchAgencies = async () => {
            try{
                const res = await API.get('/agency')
                setAgencies(res.data)
            } catch (error){
                console.error('Error fetching agencies: ', error)
            }
        }
        fetchAgencies()
    }, [])
    const triggerDeleteModal = (id: number) => {
        setAgencyToDelete(id);
        setIsModalOpen(true);
    };

    const total = agencies.reduce((sum, agency) => sum + (agency.contacts_count ?? 0), 0);
    const active = agencies.filter(a => ['First Contact', 'First Follow-up', 'Second Follow-up', 'Third Follow-up', 'interview', 'Accepted'].includes(a.status)).length;

    const SummaryCards = [
        { label: "Total Agencies", value: agencies.length, icon: Building2, color: "text-sky-400", bg: "bg-sky-400/10" },
        { label: "In Progress", value: active, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Total Contacts", value: total, icon: Users, color: "text-violet-400", bg: "bg-violet-400/10" },
    ]
    const confirmDelete = async () => {
        if (!agencyToDelete) return;
        try {
            await API.delete(`/agency/${agencyToDelete}`);
            setAgencies(agencies.filter(agency => agency.id !== agencyToDelete));
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error deleting agency:', error);
        }
    };
    return(
        <div className={'container mx-auto'}>
            <Hero
                title={'Agencies'}
                paragraph={'Track and manage your partner agencies.'}
                buttonText={'Add Agency'}
                href={'/agencies/create'}
            />
            <Cards
                data={SummaryCards}
            />
            <AgencyTable
                data={agencies}
                onDelete={triggerDeleteModal}
                link={'/agency/'}
            />
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Brisanje agencije"
                message="Da li ste sigurni da želite da obrišete ovu agenciju? Ova akcija je nepovratna i obrisat će sve povezane podatke."
            />
        </div>
    )
}