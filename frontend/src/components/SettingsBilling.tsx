import { CreditCard } from "lucide-react";

export default function SettingsBilling() {
    return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6">
            <div className="flex items-center gap-4">
                <CreditCard className="size-5 text-slate-400" />
                <div>
                    <h2 className="text-base font-semibold text-slate-100">Billing</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Billing and plans are not available yet. Nothing is charged.
                    </p>
                </div>
            </div>
        </div>
    );
}
