import { Outlet, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const UserLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-neutral-light text-[#111813] font-display">
            <header className="bg-forest-green h-16 flex items-center px-4 sm:px-6 sticky top-0 z-50">
                <div className="flex items-center gap-2 text-white">
                    <img src={logo} alt="SalesPro Logo" className="h-10 w-auto object-contain" />
                    <Link to="/dashboard" className="text-lg sm:text-xl font-bold tracking-tight hover:text-warm-gold transition-colors">SalesPro</Link>
                </div>
            </header>
            <div className="flex flex-1">
                <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full">
                    <Outlet />
                </main>
            </div>
            <footer className="bg-white border-t border-border-light py-4 px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
                <p>© {new Date().getFullYear()} Swamp Deer. All rights reserved.</p>

            </footer>
        </div>
    );
};

export default UserLayout;
