interface CardProps {
    data: any[];
}
export default function Cards({data}: CardProps){
    return(
        <div className="grid grid-cols-3 gap-4 mb-8">
            {data.map((card) => {
                const Icon = card.icon;
                return(
                    <div key={card.label} className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 flex items-center gap-4">
                        <div className={`flex items-center justify-center size-10 rounded-xl ${card.bg}`}>
                            <Icon className={`size-5 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">{card.label}</p>
                            <p className={`text-2xl font-bold font-['JetBrains_Mono',monospace] ${card.color}`}>{card.value}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}