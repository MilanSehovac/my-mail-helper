import {AnimatePresence, motion} from "framer-motion";
import {AlertCircle} from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}
export default function Modal({isOpen, onClose, onConfirm, title = 'Brisanje Agencije', message = 'Da li ste sigurni da želite da obrišete ovu agenciju? Ova akcija je nepovratna i obrisat će sve povezane podatke.'}: ModalProps) {

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl z-10 text-slate-800"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-red-500/10 text-red-400 rounded-full">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-dark">{title}</h3>
                                <p className="text-sm text-slate-400 mt-2">
                                    {message}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-start space-x-3 mt-6">
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-medium rounded-lg text-sm shadow-md shadow-red-600/15 transition-colors cursor-pointer"
                            >
                                Da, obriši
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-300 font-medium rounded-lg text-sm transition-colors cursor-pointer"
                            >
                                Otkaži
                            </button>
                        </div>
                    </motion.div>

                </div>
            )}
        </AnimatePresence>
    )
}