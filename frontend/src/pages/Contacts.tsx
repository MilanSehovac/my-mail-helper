import {useEffect, useState} from 'react';
import API from "../api/axios";
import type {Contact} from "../types/Contact";
import Hero from "../components/Hero";
import Cards from "../components/Cards";
import Modal from "../components/Modal";

import { Mail, Tag, Users} from "lucide-react";
import ContactsTable from "../components/ContactsTable";

export default function Contacts(){
    const [contacts, setContacts] = useState<Contact[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<number | null>(null);
    useEffect(() => {
        const fetchContacts = async () => {
            try{
                const res = await API.get('/contact')
                setContacts(res.data)
            } catch (error){
                console.error('Error fetching contacts: ', error)
            }
        }
        fetchContacts()
    }, [])
    const summaryCards = [
        { label: "Total Contacts", value: contacts.length, color: "text-sky-400", bg: "bg-sky-400/10", icon: Users },
        { label: "Subscribed", value: contacts.filter((contact) => contact.status === 'Subscribed').length, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Mail },
        { label: "Bounced", value: contacts.filter((contact) => contact.status === 'Bounced').length, color: "text-rose-400", bg: "bg-rose-400/10", icon: Tag },
    ]
    const triggerDeleteModal = (id: number) => {
        setContactToDelete(id);
        setIsModalOpen(true);
    };
    const confirmDelete = async () => {
        if (!contactToDelete) return;
        try {
            await API.delete(`/contact/${contactToDelete}`);
            setContacts(contacts.filter(contact => contact.id !== contactToDelete));
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };
    return(
        <div className={'container mx-auto'}>
            <Hero
                title={'Contacts'}
                paragraph={'Your email contacts and subscription status.'}
                buttonText={'Add Contact'}
                href={'/contacts/create'}
            />
            <Cards
                data={summaryCards}
            />
            <ContactsTable
                data={contacts}
                onDelete={triggerDeleteModal}
            />
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Brisanje kontakta"
                message="Da li ste sigurni da želite da obrišete ovaj kontakt? Ova akcija je nepovratna i obrisat će sve povezane podatke."
            />
        </div>
    )
}