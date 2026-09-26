import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineAlipayCircle } from "react-icons/ai";
import { BiSearch, BiUser, BiLogOut, BiMenu, BiX, BiHomeAlt } from "react-icons/bi";
import { IoIosChatbubbles } from "react-icons/io";
import { store } from '../store/states';
import '../App.css';

function Header() {
    const { globalLogout, user } = store();
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        if (globalLogout) globalLogout();
        navigate('/login');
    };

    const navItems = [
        {
            label: "Home",
            icon: <BiHomeAlt className="text-xl" />,
            path: "/",
        },
        {
            label: "Messages",
            icon: <IoIosChatbubbles className="text-xl" />,
            path: "/chat",
        }
    ];

    const avatarSrc = user?.profilePicture || user?.profilePic || user?.avatar;
    const userName = user?.firstname
        ? `${user.firstname} ${user.lastname || ''}`.trim()
        : user?.username || user?.name || user?.email || "Profile";

    return (
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">

                    <Link
                        to="/"
                        className="flex items-center gap-2.5 group focus:outline-none"
                        onClick={() => setMenuOpen(false)}
                    >
                        <AiOutlineAlipayCircle className="text-3xl sm:text-4xl text-indigo-600 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                        <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                            Nook-Social
                        </span>
                    </Link>

                

                    <nav className={`
            absolute top-full left-0 w-full bg-white dark:bg-slate-900 md:static md:w-auto md:bg-transparent md:dark:bg-transparent
            border-b md:border-none border-slate-200 dark:border-slate-800 shadow-xl md:shadow-none
            flex flex-col md:flex-row items-center md:gap-6 lg:gap-8 py-6 md:py-0 px-6 md:px-0
            transition-all duration-300 ease-in-out
            ${menuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible md:opacity-100 md:translate-y-0 md:visible'}
          `}>

                     

                        <div className="flex flex-col md:flex-row items-center w-full md:w-auto gap-2 lg:gap-3">
                            {navItems.map((navItem, index) => {
                                const isActive = location.pathname === navItem.path;
                                return (
                                    <Link
                                        key={index}
                                        to={navItem.path}
                                        className={`
                      flex items-center gap-3 w-full md:w-auto px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                                                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'}
                    `}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {navItem.icon}
                                        <span>{navItem.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <hr className="w-full my-4 border-slate-200 dark:border-slate-800 md:hidden" />

                        <div className="flex flex-col md:flex-row items-center w-full md:w-auto gap-3">
                            <Link
                                to="/profile"
                                className={`
                  flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all duration-200 border w-full md:w-auto justify-start
                  ${location.pathname === '/profile'
                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-800/40'}
                `}
                                onClick={() => setMenuOpen(false)}
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt="User Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <BiUser className="text-lg" />
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[130px]">
                                    {userName}
                                </span>
                            </Link>

                            <button
                                className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all duration-200 active:scale-95"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <BiLogOut className="text-lg" />
                                <span>Logout</span>
                            </button>
                        </div>

                    </nav>

                    <button
                        className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors duration-200 text-2xl"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {menuOpen ? <BiX /> : <BiMenu />}
                    </button>

                </div>
            </div>
        </header>
    );
}

export default Header;