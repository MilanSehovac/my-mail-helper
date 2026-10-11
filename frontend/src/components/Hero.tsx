import {Link} from "react-router-dom";
import {Plus} from "lucide-react";

interface HeroProps {
    title: string;
    paragraph: string;
    buttonText?: string;
    href?: string;
}
export default function Hero({title, paragraph, buttonText, href}: HeroProps){
    return(
        <section>
            <div className={"flex items-center justify-between mb-8"}>
                <div>
                    <h1 className={'text-2xl font-bold text-slate-100 tracking-tight'}>
                        {title}
                    </h1>
                    <p className={'text-sm text-slate-500 mt-0.5'}>
                        {paragraph}
                    </p>
                </div>
                {buttonText && href && (
                    <Link
                        to={href}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-100"
                    >
                        <Plus className="size-4" />
                        {buttonText}
                    </Link>
                )}
            </div>
        </section>
    )
}