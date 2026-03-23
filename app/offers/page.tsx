import Link from 'next/link';

export default function OffersPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <span className="material-symbols-outlined text-6xl text-royal-blue dark:text-blue-400 mb-4">sell</span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Offers & Deals</h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
                Exciting discounts and combo offers are coming soon to The Bengal Canteen. Keep an eye out!
            </p>
            <Link href="/" className="bg-royal-blue hover:bg-blue-800 text-white px-6 py-3 rounded-2xl font-bold transition-all">
                Go back Home
            </Link>
        </main>
    );
}
