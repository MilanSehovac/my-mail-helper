import { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import { ArrowLeft, Mail, Users, FileText, ChevronRight, Calendar, Zap } from "lucide-react";
import API from "../api/axios";
import type {Template} from "../types/Template";

const steps = ["Details", "Audience", "Template", "Schedule"];
function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-0">
            {steps.map((label, i) => (
                <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                            i < current
                                ? "bg-sky-500 border-sky-500 text-white"
                                : i === current
                                    ? "bg-sky-500/10 border-sky-500 text-sky-400"
                                    : "bg-slate-800 border-slate-700 text-slate-600"
                        }`}>
                            {i < current ? "✓" : i + 1}
                        </div>
                        <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${i === current ? "text-sky-400" : i < current ? "text-slate-400" : "text-slate-600"}`}>
              {label}
            </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-20 h-px mx-1 mb-4 transition-colors ${i < current ? "bg-sky-500" : "bg-slate-800"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}
export default function CreateCampaign(){
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [targetGroups, setTargetGroups] = useState<string[]>([]);
    const [form, setForm] = useState({
        name: "",
        description: "",
        target: "",
        daily_limit: 50,
        template_id: 0,
        send_date: "",
        send_time: "09:00",
        send_mode: "scheduled" as "scheduled" | "immediate",
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [templateOptions, setTemplateOptions] = useState<Template[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const templateRes = await API.get('/template');
                setTemplateOptions(templateRes.data);

                const segmentRes = await API.get('/agency/segment-tags');
                setTargetGroups(segmentRes.data);
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };

        loadData();
    }, []);
    const handleSubmit = async () => {
        setError('');
        let scheduledAt: string | null = null;
        if (form.send_mode === "scheduled") {
            if (!form.send_date) {
                setError("Please select a date");
                return;
            }
            const when = new Date(`${form.send_date}T${form.send_time}:00`);
            if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
                setError("Scheduled time must be in the future");
                return;
            }
            scheduledAt = when.toISOString();
        }
        const dataToSend = {
            name: form.name,
            description: form.description,
            target: form.target,
            template_id: form.template_id,
            daily_limit: form.daily_limit,
            send_mode: form.send_mode,
            scheduled_at: scheduledAt,
        };
        setSubmitting(true);
        try {
            await API.post('/campaign', dataToSend);
            navigate('/campaigns');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create campaign');
        } finally {
            setSubmitting(false);
        }
    }
    const update = (k: keyof typeof form, v: string | number) =>
        setForm((p) => ({ ...p, [k]: k === "daily_limit" ? Number(v) : v }));

    const canProceed = () => {
        if (step === 0) return form.name.trim().length > 0;
        if (step === 1) return form.target.length > 0;
        if (step === 2) return form.template_id > 0;
        if (step === 3) {
            if (form.send_mode === "scheduled") {
                return form.send_date.trim().length > 0;
            }
            return true;
        }
        return true;
    };

    return(
        <>
            <Link
                to={'/campaigns'}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors group"
            >
                <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Campaigns
            </Link>
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">New Campaign</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Set up your outreach campaign in four steps.</p>
                </div>
                <StepIndicator current={step} />
            </div>
            <div className="max-w-2xl">
                {/* Step 0 — Details */}
                {step === 0 && (
                    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-9 rounded-lg bg-sky-400/10 flex items-center justify-center">
                                <Mail className="size-4 text-sky-400" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-100">Campaign Details</h2>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Campaign Name <span className="text-rose-400">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. Spring Outreach 2025"
                                value={form.name}
                                onChange={(e) => update("name", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description <span className="text-slate-600">(optional)</span></label>
                            <textarea
                                rows={3}
                                placeholder="What's the goal of this campaign?"
                                value={form.description}
                                onChange={(e) => update("description", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Daily Send Limit</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={10}
                                    max={500}
                                    step={10}
                                    value={form.daily_limit}
                                    onChange={(e) => update("daily_limit", e.target.value)}
                                    className="flex-1 accent-sky-500"
                                />
                                <span className="font-mono text-sm text-sky-400 w-14 text-right">{form.daily_limit}/day</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1 — Audience */}
                {step === 1 && (
                    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-9 rounded-lg bg-violet-400/10 flex items-center justify-center">
                                <Users className="size-4 text-violet-400" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-100">Select Audience</h2>
                        </div>
                        <p className="text-xs text-slate-500">Choose the contact group this campaign will target.</p>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            {targetGroups.map((group) => (
                                <button
                                    key={group}
                                    onClick={() => update("target", group)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                                        form.target === group
                                            ? "border-sky-500/60 bg-sky-500/10 text-sky-300"
                                            : "border-slate-700/60 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                                    }`}
                                >
                                    <div className={`size-2 rounded-full shrink-0 ${form.target === group ? "bg-sky-400" : "bg-slate-600"}`} />
                                    <span className="text-sm font-medium">{group}</span>
                                </button>
                            ))}
                        </div>

                        {form.target && (
                            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/40 text-xs text-slate-400 font-mono">
                                Selected: <span className="text-sky-400">{form.target}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2 — Template */}
                {step === 2 && (
                    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-9 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                                <FileText className="size-4 text-emerald-400" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-100">Choose Template</h2>
                        </div>
                        <p className="text-xs text-slate-500">Pick the email template that will be sent.</p>

                        <div className="space-y-3 pt-1">
                            {templateOptions.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => update("template_id", t.id)}
                                    className={`w-full flex items-start gap-4 px-4 py-4 rounded-xl border text-left transition-all ${
                                        form.template_id === t.id
                                            ? "border-sky-500/60 bg-sky-500/10"
                                            : "border-slate-700/60 bg-slate-800/40 hover:border-slate-600"
                                    }`}
                                >
                                    <div className={`size-2 rounded-full mt-1.5 shrink-0 ${form.template_id === t.id ? "bg-sky-400" : "bg-slate-600"}`} />
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium ${form.template_id === t.id ? "text-sky-300" : "text-slate-300"}`}>{t.name}</p>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">Subject: {t.subject}</p>
                                        <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400">{t.category}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3 — Schedule */}
                {step === 3 && (
                    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-9 rounded-lg bg-amber-400/10 flex items-center justify-center">
                                <Calendar className="size-4 text-amber-400" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-100">Schedule</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {(["scheduled", "immediate"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => update("send_mode", mode)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                                        form.send_mode === mode
                                            ? "border-sky-500/60 bg-sky-500/10 text-sky-300"
                                            : "border-slate-700/60 bg-slate-800/40 text-slate-400 hover:border-slate-600"
                                    }`}
                                >
                                    {mode === "immediate" ? <Zap className="size-4" /> : <Calendar className="size-4" />}
                                    <span className="text-sm font-medium capitalize">{mode === "immediate" ? "Send Now" : "Scheduled"}</span>
                                </button>
                            ))}
                        </div>

                        {form.send_mode === "scheduled" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Date</label>
                                    <input
                                        type="date"
                                        value={form.send_date}
                                        onChange={(e) => update("send_date", e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Send Time</label>
                                    <input
                                        type="time"
                                        value={form.send_time}
                                        onChange={(e) => update("send_time", e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="mt-2 p-4 bg-slate-800/50 rounded-xl border border-slate-700/40 space-y-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Summary</p>
                            {[
                                { label: "Campaign", value: form.name },
                                { label: "Audience", value: form.target },
                                { label: "Template", value: templateOptions.find((t) => t.id === form.template_id)?.name ?? "—" },
                                { label: "Daily Limit", value: `${form.daily_limit} emails/day` },
                                { label: "Send Mode", value: form.send_mode === "immediate" ? "Send Immediately" : `${form.send_date || "—"} at ${form.send_time}` },
                            ].map((r) => (
                                <div key={r.label} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">{r.label}</span>
                                    <span className="text-slate-300 font-mono">{r.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && <p className="mt-4 text-xs text-rose-400">{error}</p>}
                {/* Nav buttons */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => (step === 0 ? navigate("/campaigns") : setStep((s) => s - 1))}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        {step === 0 ? "Cancel" : "Back"}
                    </button>

                    {step < steps.length - 1 ? (
                        <button
                            onClick={() => setStep((s) => s + 1)}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Continue
                            <ChevronRight className="size-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-40"
                        >
                            <Zap className="size-4" />
                            Create Campaign
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}