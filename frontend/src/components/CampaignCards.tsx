import type { LucideIcon } from 'lucide-react'

export interface CampaignCard {
    label: string;
    value: string | number;
    sub?: string;
    icon: LucideIcon;
    accent: string;
    bg: string;
}

interface CampaignCardsProps {
    data: CampaignCard[];
}

export default function CampaignCards({ data }: CampaignCardsProps) {
    return (
        <div className="grid grid-cols-4 gap-4 mb-8">
            {data.map((card) => {
                const Icon = card.icon;
                return (
                    <div key={card.label} className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`flex items-center justify-center size-9 rounded-lg ${card.bg}`}>
                                <Icon className={`size-4 ${card.accent}`} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                        <p className={`text-2xl font-bold font-['JetBrains_Mono',monospace] ${card.accent}`}>{card.value}</p>
                        {card.sub && <p className="text-xs text-slate-600 mt-1">{card.sub}</p>}
                    </div>
                );
            })}
        </div>
    )
}
