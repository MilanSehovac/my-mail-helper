import {useState, useEffect} from "react";
import API from '../api/axios';
import Hero from "../components/Hero";
import {Link, useNavigate} from "react-router-dom";
import { ArrowLeft, User, Mail, Building2 } from "lucide-react";
import type {FormEvent} from "react";
import type {Agency} from "../types/Agency";

export default function CreateContact(){
    const navigate = useNavigate();
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        agency_id: null as number | null,
        position: "",
        tag:""
    });
    const [agencyNames, setAgencyNames] = useState<Agency[]>([])
    useEffect(() => {
        const agencyNames = async () => {
            try{
                const res = await API.get('/agency/names')
                setAgencyNames(res.data)
            } catch(error) {
                console.log(error)
            }
        }
        agencyNames()
    }, [])
    const update = <K extends keyof typeof form>(
        key: K,
        value: typeof form[K]
    ) => {
        setForm(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isValid = form.full_name.trim() && form.email.trim() && form.agency_id

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await API.post('/contact', form)
            navigate('/contacts');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save contact');
        } finally {
            setSubmitting(false);
        }
    }
    return(
        <>
            <Link
                to={'/contacts'}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors group"
            >
                <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Contacts
            </Link>
            <Hero
                title={'Add Contact'}
                paragraph={'Add a single contact to one of your agencies.'}
            />
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="size-9 rounded-lg bg-sky-400/10 flex items-center justify-center">
                            <User className="size-4 text-sky-400" />
                        </div>
                        <h2 className="text-base font-semibold text-slate-100">Contact Details</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name <span className="text-rose-400">*</span></label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={form.full_name}
                                onChange={(e) => update("full_name", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                <Mail className="inline size-3 mr-1 text-slate-500" />Email Address <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="sarah@pixelco.io"
                                value={form.email}
                                onChange={(e) => update("email", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                <Building2 className="inline size-3 mr-1 text-slate-500" />Company
                            </label>
                            <select
                                value={form.agency_id ?? ""}
                                onChange={(e) => {
                                    const id = e.target.value ? Number(e.target.value) : null;

                                    const agency = agencyNames.find(a => a.id === id);

                                    setForm(prev => ({
                                        ...prev,
                                        agency_id: id,
                                        tag: agency?.segment_tag ?? ""
                                    }));
                                }}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all appearance-none"
                            >
                                <option value="" className="bg-slate-900">Select Agency…</option>
                                {agencyNames.map((agency) => (
                                    <option key={agency.id} value={agency.id}>
                                        {agency.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Position / Title</label>
                            <input
                                type="text"
                                placeholder="Creative Director"
                                value={form.position}
                                onChange={(e) => update("position", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Segment Tag</label>
                            <input
                                type="text"
                                placeholder="B&H Agency"
                                value={form.tag}
                                onChange={(e) => update("tag", e.target.value)}
                                disabled
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                    </div>
                </div>



                {error && <p className="text-xs text-rose-400">{error}</p>}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/contacts")}
                        className="px-4 py-2.5 text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || submitting}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {"Save Contact"}
                    </button>
                </div>
            </form>
        </>
    )
}