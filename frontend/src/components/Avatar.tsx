import { useMemo } from 'react';

interface AvatarProps {
    firstName: string;
    lastName: string;
    className?: string;
}

const gradients = [
    'from-sky-400 to-blue-600',
    'from-purple-400 to-pink-600',
    'from-emerald-400 to-teal-600',
    'from-orange-400 to-red-600',
    'from-amber-400 to-yellow-600',
    'from-cyan-400 to-blue-600',
    'from-violet-400 to-purple-600',
    'from-green-400 to-emerald-600',
    'from-rose-400 to-pink-600',
    'from-indigo-400 to-purple-600',
    'from-lime-400 to-green-600',
    'from-fuchsia-400 to-purple-600',
];

export default function Avatar({ firstName, lastName, className = 'size-16' }: AvatarProps) {
    const gradient = useMemo(() => {
        const combined = `${firstName}${lastName}`;
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            hash = ((hash << 5) - hash) + combined.charCodeAt(i);
            hash |= 0;
        }
        return gradients[Math.abs(hash) % gradients.length];
    }, [firstName, lastName]);

    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

    return (
        <div className={`${className} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-xl font-bold text-white`}>
            {initials}
        </div>
    );
}