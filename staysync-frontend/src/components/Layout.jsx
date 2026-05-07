import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, CreditCard, Banknote, History, Settings, Menu, Bell, User } from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { name: 'Dashboard', icon: Home, path: '/' },
        { name: 'Fee Structures', icon: Settings, path: '/fee-structures' },
        { name: 'Record Payment', icon: CreditCard, path: '/payments/record' },
        { name: 'Payment History', icon: History, path: '/payments/history' },
    ];

    return (
        <div className="w-64 bg-white border-r h-screen fixed left-0 top-0 flex flex-col hidden md:flex">
            <div className="p-6 border-b flex items-center gap-3">
                <div className="bg-primary text-white p-2 rounded-lg">
                    <Banknote size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold font-sans text-gray-900 tracking-tight">StaySync</h1>
                    <p className="text-xs text-gray-500 font-medium tracking-wide">HOSTEL MGT</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-blue-50 text-primary font-semibold shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon size={20} className={({ isActive }) => isActive ? 'text-primary' : 'text-gray-500'} />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Admin User</p>
                        <p className="text-xs text-gray-500">Super Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Header = () => {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Menu size={24} />
                </button>
                <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">Fees & Payments Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 relative text-gray-500 hover:text-primary hover:bg-blue-50 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-2 w-2 h-2 bg-danger rounded-full ring-2 ring-white"></span>
                </button>
            </div>
        </header>
    );
};

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="md:ml-64 w-full md:w-[calc(100%-16rem)] min-h-screen flex flex-col relative transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 md:p-8">
                    <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-200">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
