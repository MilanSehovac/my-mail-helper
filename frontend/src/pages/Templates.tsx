import {useEffect, useState} from 'react'
import Hero from "../components/Hero";
import TemplateCards from "../components/TemplateCards";
import type {Template} from "../types/Template";
import API from "../api/axios";
import Modal from "../components/Modal";

export default function Templates(){
    const [templates, setTemplates] = useState<Template[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

    useEffect (() => {
        const fetchTemplates = async () => {
            try{
                const res = await API.get('/template')
                setTemplates(res.data)
            } catch(error) {
                console.error('Error fetching templates: ', error)
            }
        }
        fetchTemplates()
    }, [])

    const triggerDeleteModal = (id: number) => {
        setTemplateToDelete(id);
        setIsModalOpen(true);
    };
    const confirmDelete = async () => {
        if (!templateToDelete) return;
        try {
            await API.delete(`/template/${templateToDelete}`);
            setTemplates(templates.filter(template => template.id !== templateToDelete));
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error deleting template:', error);
            alert(error.response?.data?.error || 'Could not delete template');
            setIsModalOpen(false);
        }
    };
    return(
        <div>
            <Hero
                title={'Email Templates'}
                paragraph={'Build and manage reusable email templates with variables'}
                buttonText={'New Template'}
                href={'/templates/create'}
            />
            <TemplateCards
                data={templates}
                onDelete={triggerDeleteModal}
            />
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Brisanje šablona"
                message="Da li ste sigurni da želite da obrišete ovaj šablon? Ova akcija je nepovratna i obrisat će sve povezane podatke."
            />
        </div>
    )
}