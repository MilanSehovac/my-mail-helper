import { useState } from "react";
import Hero from "../components/Hero";
import API from "../api/axios"
import {ArrowLeft, Building2, Globe, MapPin, Tag} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import type {FormEvent} from "react";
const Statuses = [
    'Research','First Contact', 'First Follow-up', 'Second Follow-up', 'Third Follow-up', 'interview', 'Rejected', 'Accepted', 'Ghosted'
] as const;
export default function CreateAgency(){
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        website: "",
        country: "",
        city: "",
        segment_tag: "",
        status: "Research" as typeof Statuses[number],
    });


    const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isValid = form.name.trim() && form.country.trim() && form.city.trim();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await API.post('/agency', form)
            navigate('/agencies');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save agency');
        } finally {
            setSubmitting(false);
        }
    }
    return(
        <>
            <Link
                to={"/agencies"}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors group"
            >
                <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Agencies
            </Link>
            <Hero
                title={'Add Agency'}
                paragraph={'Register a new partner agency and their primary contact.'}
            />
            <form onSubmit={handleSubmit} className={'max-w-2xl space-y-5'}>
                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="size-9 rounded-lg bg-sky-400/10 flex items-center justify-center">
                            <Building2 className="size-4 text-sky-400" />
                        </div>
                        <h2 className="text-base font-semibold text-slate-100">Agency Information</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Agency Name <span className="text-rose-400">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. Pixel & Co."
                                value={form.name}
                                onChange={(e) => update("name", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                <Globe className="inline size-3 mr-1 text-slate-500" />Website
                            </label>
                            <input
                                type="text"
                                placeholder="agency.com"
                                value={form.website}
                                onChange={(e) => update("website", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                <MapPin className="inline size-3 mr-1 text-slate-500" />Country <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="UK"
                                value={form.country}
                                onChange={(e) => update("country", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">City <span className="text-rose-400">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. London"
                                value={form.city}
                                onChange={(e) => update("city", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                <Tag className="inline size-3 mr-1 text-slate-500" />Segment Tag
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. UK Agencies"
                                value={form.segment_tag}
                                onChange={(e) => update("segment_tag", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                            <div className="flex gap-2">
                                <select
                                    value={form.status}
                                    onChange={(e) => update("status", e.target.value)}
                                    className={`w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all appearance-none`}
                                >
                                    {Statuses.map((c) => <option key={c} value={c} className={"bg-slate-900"}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary contact */}
                {/* <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="size-9 rounded-lg bg-violet-400/10 flex items-center justify-center">
                            <User className="size-4 text-violet-400" />
                        </div>
                        <h2 className="text-base font-semibold text-slate-100">Primary Contact</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                placeholder="Sarah Mitchell"
                                value={form.contact_name}
                                onChange={(e) => update("contact_name", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
                            <input
                                type="text"
                                placeholder="Creative Director"
                                value={form.contact_role}
                                onChange={(e) => update("contact_role", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address <span className="text-rose-400">*</span></label>
                        <input
                            type="email"
                            placeholder="sarah@agency.com"
                            value={form.contact_email}
                            onChange={(e) => update("contact_email", e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                        />
                    </div>
                </div> */}

                 {/* Notes */}
                {/* <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Internal Notes <span className="text-slate-600">(optional)</span></label>
                    <textarea
                        rows={3}
                        placeholder="Any context about this agency, relationship history, etc."
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all resize-none"
                    />
                </div> */}

                 {/* Actions */}
                {error && <p className="text-xs text-rose-400">{error}</p>}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/agencies")}
                        className="px-4 py-2.5 text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || submitting}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        Save Agency
                    </button>
                </div>
            </form>
        </>
    )
}