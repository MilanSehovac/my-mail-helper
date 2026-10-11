import Hero from "../components/Hero";
import {Link, useNavigate} from "react-router-dom";
import {ArrowLeft, Code, Eye, FileText, Lightbulb} from "lucide-react";
import API from "../api/axios";
import {useState} from "react";
import type {FormEvent} from "react";

const categories = ["Outreach", "Follow-up", "Demo", "Onboarding", "Re-engagement", "Newsletter"];

const variables = [
    { token: "{{full_name}}", desc: "Contact full name" },
    { token: "{{first_name}}", desc: "Contact first name" },
    { token: "{{last_name}}", desc: "Contact last name" },
    { token: "{{email}}", desc: "Contact email" },
    { token: "{{position}}", desc: "Contact job position" },
    { token: "{{status}}", desc: "Contact status (prospect, client, etc)" },
    { token: "{{tag}}", desc: "Contact tag/category" },
    { token: "{{agency_name}}", desc: "Agency or company name" },
    { token: "{{location}}", desc: "Agency location/city" },
    { token: "{{website}}", desc: "Agency website" },
    { token: "{{sender_name}}", desc: "Your name (sender)" },
    { token: "{{sender_email}}", desc: "Your email (reply-to)" },
    { token: "{{current_date}}", desc: "Today's date" },
];

const starterTemplates = [
    {
        name: "Cold Outreach",
        subject: "Quick question about {{agency_name}}",
        body: `Hi {{first_name}},

I came across your work at {{agency_name}} and was genuinely impressed by what you're building.

I'm reaching out because I think there could be a great fit between what we do and the kind of clients you work with.

Would you be open to a quick 15-minute call this week? I promise to keep it brief and focused.

Best,
{{sender_name}}`,
    },
    {
        name: "Follow-up",
        subject: "Following up — {{agency_name}}",
        body: `Hi {{first_name}},

Just wanted to circle back on my last message in case it got buried — completely understand if the timing isn't right.

Happy to send over a short overview instead, or hop on a call whenever works for you.

Either way, hope things are going well at {{agency_name}}.

{{sender_name}}`,
    },
];

export default function CreateTemplate(){
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        subject: "",
        category: "",
        body: "",
    });
    const [preview, setPreview] = useState(false);

    const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
    const insertToken = (token: string) => {
        update("body", form.body + token);
    };

    const sample: Record<string, string> = {
        first_name: "Sarah", last_name: "Mitchell", full_name: "Sarah Mitchell",
        email: "sarah@pixelco.io", position: "Creative Director", status: "Subscribed",
        tag: "UK Agencies", agency_name: "Pixel & Co.", location: "London",
        website: "pixelco.io", sender_name: "Alex Liu", sender_email: "alex@agency.io",
        current_date: new Date().toLocaleDateString(),
    };
    const resolvedPreview = form.body.replace(/{{\s*(\w+)\s*}}/g, (m, key) => sample[key] ?? m);

    const isValid = form.name.trim() && form.subject.trim() && form.body.trim();

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await API.post('/template', { ...form, category: form.category || null })
            navigate('/templates');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save template');
        } finally {
            setSubmitting(false);
        }
    }
    return(
        <>
            <Link
                to={"/templates"}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors group"
            >
                <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Templates
            </Link>
            <Hero
                title={'New Template'}
                paragraph={'Create a reusable email template with merge variables.'}
            />
            <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_260px] gap-6 items-start">
                {/* Main editor */}
                <div className="space-y-5">
                    {/* Starter shortcuts */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="size-3.5 text-amber-400" />
                            <span className="text-xs font-medium text-slate-400">Start from a template</span>
                        </div>
                        <div className="flex gap-2">
                            {starterTemplates.map((t) => (
                                <button
                                    key={t.name}
                                    type="button"
                                    onClick={() => setForm({ name: t.name, subject: t.subject, category: "Outreach", body: t.body })}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 hover:border-slate-600 rounded-lg transition-colors"
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-5">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="size-9 rounded-lg bg-sky-400/10 flex items-center justify-center">
                                <FileText className="size-4 text-sky-400" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-100">Template Details</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Template Name <span className="text-rose-400">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Cold Outreach — Agency"
                                    value={form.name}
                                    onChange={(e) => update("name", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => update("category", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all appearance-none"
                                >
                                    <option value="" className="bg-slate-900">Select category…</option>
                                    {categories.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Subject Line <span className="text-rose-400">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. Quick question about {{agency_name}}"
                                value={form.subject}
                                onChange={(e) => update("subject", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all font-mono"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-slate-400">Email Body <span className="text-rose-400">*</span></label>
                                <button
                                    type="button"
                                    onClick={() => setPreview((p) => !p)}
                                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${preview ? "text-sky-400" : "text-slate-500 hover:text-slate-300"}`}
                                >
                                    {preview ? <Code className="size-3.5" /> : <Eye className="size-3.5" />}
                                    {preview ? "Edit" : "Preview"}
                                </button>
                            </div>
                            {preview ? (
                                <div className="w-full min-h-[280px] px-4 py-3.5 bg-slate-800/50 border border-slate-700/60 rounded-lg text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                                    {resolvedPreview || <span className="text-slate-600">Nothing to preview yet.</span>}
                                </div>
                            ) : (
                                <textarea
                                    rows={12}
                                    placeholder={"Hi {{first_name}},\n\nYour message here…"}
                                    value={form.body}
                                    onChange={(e) => update("body", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all resize-none font-mono leading-relaxed"
                                />
                            )}
                            {!preview && (
                                <p className="text-xs text-slate-600 mt-1.5">Use variables like <code className="text-sky-400/80 font-mono">{"{{first_name}}"}</code> — click chips on the right to insert.</p>
                            )}
                        </div>
                    </div>

                    {error && <p className="text-xs text-rose-400">{error}</p>}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/templates")}
                            className="px-4 py-2.5 text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid || submitting}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Save Template
                        </button>
                    </div>
                </div>

                {/* Sidebar — variables */}
                <div className="space-y-4 sticky top-20">
                    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Merge Variables</p>
                        <div className="space-y-2">
                            {variables.map((v) => (
                                <button
                                    key={v.token}
                                    type="button"
                                    onClick={() => insertToken(v.token)}
                                    className="w-full flex items-start gap-3 px-3 py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600 rounded-lg text-left transition-colors group"
                                >
                                    <code className="text-xs text-sky-400 font-mono shrink-0 mt-0.5">{v.token}</code>
                                    <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{v.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Preview As</p>
                        <div className="space-y-1 text-xs text-slate-500">
                            <div className="flex justify-between">
                                <span>first_name</span><span className="text-slate-300 font-mono">Sarah</span>
                            </div>
                            <div className="flex justify-between">
                                <span>agency_name</span><span className="text-slate-300 font-mono">Pixel & Co.</span>
                            </div>
                            <div className="flex justify-between">
                                <span>sender_name</span><span className="text-slate-300 font-mono">Alex Liu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}