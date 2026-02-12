import { useState } from 'react';
import clsx from 'clsx';
import { Menu, X, Pin, PinOff, ChevronDown, ChevronRight } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const SidebarGroup = ({ label, icon, children, isOpen, onToggle, isSidebarPinned }: {
    label: string,
    icon: string,
    children: React.ReactNode,
    isOpen: boolean,
    onToggle: () => void,
    isSidebarPinned: boolean
}) => {
    return (
        <div className="flex flex-col">
            <button
                onClick={onToggle}
                className={clsx(
                    "flex items-center justify-between px-6 py-3 text-gray-300 hover:bg-swamp-deer hover:text-warm-gold transition-colors duration-200 group/btn",
                    isOpen && "bg-swamp-deer/30 text-warm-gold/90"
                )}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined shrink-0">{icon}</span>
                    <span className={clsx(
                        "font-medium whitespace-nowrap transition-opacity duration-300",
                        !isSidebarPinned && "lg:opacity-0 lg:group-hover:opacity-100"
                    )}>
                        {label}
                    </span>
                </div>
                <div className={clsx(
                    "transition-all duration-300 shrink-0",
                    !isSidebarPinned && "lg:opacity-0 lg:group-hover:opacity-100"
                )}>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
            </button>
            <div className={clsx(
                "overflow-hidden transition-all duration-300 ease-in-out bg-black/10",
                isOpen ? "max-h-96" : "max-h-0"
            )}>
                {children}
            </div>
        </div>
    );
};

const AdminLayout = () => {
    const { logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile
    const [isSidebarPinned, setIsSidebarPinned] = useState(true); // For desktop
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        management: true,
        creation: false,
    });

    const toggleGroup = (group: string) => {
        setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const togglePin = () => setIsSidebarPinned(!isSidebarPinned);

    const navLinkClasses = ({ isActive }: { isActive: boolean }, isSubItem = false) =>
        clsx(
            "sidebar-link flex items-center gap-3 transition-colors duration-200",
            isSubItem ? "px-10 py-2.5 text-sm" : "px-6 py-3",
            isActive
                ? "active bg-swamp-deer text-warm-gold border-r-4 border-warm-gold"
                : "text-gray-300 hover:bg-swamp-deer hover:text-warm-gold"
        );

    return (
        <div className="min-h-screen flex bg-neutral-light text-[#111813] font-display overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-50 bg-forest-green text-white transition-all duration-300 ease-in-out lg:static lg:translate-x-0 group",
                    sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
                    isSidebarPinned ? "lg:w-72" : "lg:w-20 lg:hover:w-72"
                )}
            >
                <div className="h-full flex flex-col overflow-hidden">
                    <div className="h-16 flex items-center justify-between px-6 bg-black/10 shrink-0">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <img src={logo} alt="SalesPro Logo" className="h-8 w-auto object-contain" />
                            <h2 className={clsx(
                                "text-xl font-bold tracking-tight whitespace-nowrap transition-opacity duration-300",
                                !isSidebarPinned && "lg:opacity-0 lg:group-hover:opacity-100"
                            )}>
                                SalesPro
                            </h2>
                        </div>
                        <button onClick={toggleSidebar} className="lg:hidden text-white hover:text-warm-gold focus:outline-none">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {/* Dashboard - Single Item */}
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => navLinkClasses({ isActive })}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="material-symbols-outlined shrink-0">dashboard</span>
                            <span className={clsx(
                                "font-medium whitespace-nowrap transition-opacity duration-300",
                                !isSidebarPinned && "lg:opacity-0 lg:group-hover:opacity-100"
                            )}>
                                Dashboard
                            </span>
                        </NavLink>

                        <div className="my-2 border-t border-white/5"></div>

                        {/* Management Group */}
                        <SidebarGroup
                            label="Management"
                            icon="settings"
                            isOpen={openGroups.management}
                            onToggle={() => toggleGroup('management')}
                            isSidebarPinned={isSidebarPinned}
                        >
                            <NavLink to="/manage-branches" className={({ isActive }) => navLinkClasses({ isActive }, true)}>
                                <span className="material-symbols-outlined text-sm">domain</span>
                                <span>Branches</span>
                            </NavLink>
                            <NavLink to="/manage-sales" className={({ isActive }) => navLinkClasses({ isActive }, true)}>
                                <span className="material-symbols-outlined text-sm">badge</span>
                                <span>Sales Users</span>
                            </NavLink>
                            <NavLink to="/manage-investors" className={({ isActive }) => navLinkClasses({ isActive }, true)}>
                                <span className="material-symbols-outlined text-sm">group</span>
                                <span>Investors</span>
                            </NavLink>
                            <NavLink to="/approve-sales" className={({ isActive }) => navLinkClasses({ isActive }, true)}>
                                <span className="material-symbols-outlined text-sm">gavel</span>
                                <span>Approve Sales</span>
                            </NavLink>
                            <NavLink to="/approve-rewards" className={({ isActive }) => navLinkClasses({ isActive }, true)}>
                                <span className="material-symbols-outlined text-sm">emoji_events</span>
                                <span>Approve Rewards</span>
                            </NavLink>
                            <NavLink to="/approve-withdrawals" className={({ isActive }) => navLinkClasses({ isActive }, true)}>
                                <span className="material-symbols-outlined text-sm">payments</span>
                                <span>Withdrawals</span>
                            </NavLink>
                            <NavLink to="/manage-plans" className={({ isActive }) => navLinkClasses({ isActive }, true)}>
                                <span className="material-symbols-outlined text-sm">settings_suggest</span>
                                <span>Investment Plans</span>
                            </NavLink>
                        </SidebarGroup>

                        {/* Creation Hub */}
                        <SidebarGroup
                            label="Creation Hub"
                            icon="add_circle"
                            isOpen={openGroups.creation}
                            onToggle={() => toggleGroup('creation')}
                            isSidebarPinned={isSidebarPinned}
                        >
                            <NavLink to="/add-branch" className={({ isActive }) => navLinkClasses({ isActive }, true)}>
                                <span className="material-symbols-outlined text-sm">domain_add</span>
                                <span>New Branch</span>
                            </NavLink>
                            <NavLink to="/create-sales-account" className={({ isActive }) => navLinkClasses({ isActive }, true)}>
                                <span className="material-symbols-outlined text-sm">person_add</span>
                                <span>New Sales User</span>
                            </NavLink>
                        </SidebarGroup>

                        <div className="my-2 border-t border-white/5"></div>

                        {/* Reports & History */}
                        <NavLink to="/history" className={({ isActive }) => navLinkClasses({ isActive })}>
                            <span className="material-symbols-outlined shrink-0">history</span>
                            <span className={clsx(
                                "font-medium whitespace-nowrap transition-opacity duration-300",
                                !isSidebarPinned && "lg:opacity-0 lg:group-hover:opacity-100"
                            )}>
                                Sales History
                            </span>
                        </NavLink>

                        <NavLink to="/change-password" className={({ isActive }) => navLinkClasses({ isActive })}>
                            <span className="material-symbols-outlined shrink-0">lock_reset</span>
                            <span className={clsx(
                                "font-medium whitespace-nowrap transition-opacity duration-300",
                                !isSidebarPinned && "lg:opacity-0 lg:group-hover:opacity-100"
                            )}>
                                Change Password
                            </span>
                        </NavLink>
                    </nav>

                    <div className="px-6 py-4 border-t border-white/10">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full py-3 text-gray-300 hover:text-warm-gold transition-colors duration-200"
                        >
                            <span className="material-symbols-outlined shrink-0">logout</span>
                            <span className={clsx(
                                "font-medium whitespace-nowrap transition-opacity duration-300",
                                !isSidebarPinned && "lg:opacity-0 lg:group-hover:opacity-100"
                            )}>
                                Logout
                            </span>
                        </button>
                    </div>

                    <div className={clsx(
                        "p-6 text-xs text-gray-500 bg-black/5 whitespace-nowrap transition-opacity duration-300 shrink-0",
                        !isSidebarPinned && "lg:opacity-0 lg:group-hover:opacity-100"
                    )}>
                        © {new Date().getFullYear()} Swamp Deer
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-border-light flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden text-forest-green hover:text-warm-gold focus:outline-none"
                        >
                            <Menu size={24} />
                        </button>
                        <button
                            onClick={togglePin}
                            className="hidden lg:flex text-forest-green hover:text-warm-gold focus:outline-none items-center gap-2"
                            title={isSidebarPinned ? "Unpin Sidebar" : "Pin Sidebar"}
                        >
                            {isSidebarPinned ? <Pin size={20} className="rotate-45" /> : <PinOff size={20} />}
                        </button>
                        <h1 className="text-lg font-bold text-gray-800 uppercase tracking-widest truncate">Super Admin Dashboard</h1>
                    </div>
                </header>
                <main className="p-4 sm:p-8 space-y-8 overflow-y-auto bg-neutral-light flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
