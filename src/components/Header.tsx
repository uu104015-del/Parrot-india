import { ShoppingBag, ChevronRight, Menu, X, ShieldAlert, User, LogIn, LogOut, Heart } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  currentTab: 'home' | 'admin' | 'track';
  setTab: (tab: 'home' | 'admin' | 'track') => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  currentUser: any | null;
  onAuthClick: () => void;
  onUserLogout: () => void;
}

export default function Header({
  cartCount,
  onCartClick,
  currentTab,
  setTab,
  isAdminLoggedIn,
  onLogout,
  currentUser,
  onAuthClick,
  onUserLogout
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', id: 'home', section: 'hero' },
    { label: 'Our Parrots', id: 'parrots', section: 'parrots-section' },
    { label: 'Testimonials', id: 'testimonials', section: 'testimonials-section' },
    { label: 'Contact', id: 'contact', section: 'contact-section' },
  ];

  const handleNavClick = (sectionId: string) => {
    setTab('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleAdminToggle = () => {
    setTab(currentTab === 'admin' ? 'home' : 'admin');
    setMobileMenuOpen(false);
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div 
            onClick={() => { setTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-[2px] shadow-md shadow-emerald-100 group-hover:rotate-6 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-slate-50 rounded-[14px] flex items-center justify-center text-xl shadow-inner">
                🦜
              </div>
            </div>
            <div>
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-950 tracking-tight leading-none">
                Parrot <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">India</span>
              </h1>
              <p className="font-mono text-[8px] text-slate-400 font-bold tracking-widest mt-1 uppercase">Premium Certified Aviaries</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setTab('home')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentTab === 'home'
                  ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              Home Shop
            </button>

            <button
              onClick={() => setTab('track')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-1.5 ${
                currentTab === 'track'
                  ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              <span>📦</span> Track Order
            </button>

            {currentTab === 'home' && navItems.filter(item => item.id !== 'home').map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.section)}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}

            {(currentTab === 'admin' || currentTab === 'track') && (
              <button
                onClick={() => setTab('home')}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-50 transition-colors duration-200 flex items-center gap-1"
              >
                ← Back to Shop
              </button>
            )}

            <div className="h-4 w-px bg-slate-200 mx-2" />

            {/* User Account Login/Register and Status state widget */}
            {currentUser ? (
              <div className="flex items-center gap-2 mr-1">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 rounded-full px-3 py-1 text-xs text-slate-800 font-medium">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[9px]">👤</span>
                  )}
                  <span className="max-w-[100px] truncate">Hi, {currentUser.name}</span>
                </div>
                <button
                  type="button"
                  onClick={onUserLogout}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Logout Account"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mr-1">
                <button
                  type="button"
                  onClick={onAuthClick}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600 transition-all cursor-pointer flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-400" />
                  Log In
                </button>
                <button
                  type="button"
                  onClick={onAuthClick}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            <div className="h-4 w-px bg-slate-200 mx-1.5" />

            {/* Admin Dashboard Area */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTab('admin')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border flex items-center gap-1.5 transition-all duration-200 ${
                    currentTab === 'admin'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Admin
                </button>
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdminToggle}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  currentTab === 'admin'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 bg-slate-50/50 hover:bg-slate-150 border border-slate-200/80'
                }`}
              >
                Staff Portal
              </button>
            )}
          </nav>

          {/* Cart & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* Shopping Bucket Button */}
            <button
              id="shopping-cart-button"
              onClick={onCartClick}
              className="relative p-2.5 rounded-full text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center shadow-sm"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5.5 h-5.5 text-slate-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-emerald-500 text-white font-mono text-[10px] font-bold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center border-2 border-white animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full text-slate-800 hover:bg-slate-50 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden animate-fade-in bg-white border-b border-slate-100 py-4 px-6 space-y-3 shadow-lg">
          <button
            onClick={() => { setTab('home'); setMobileMenuOpen(false); }}
            className={`block w-full text-left py-2 font-medium border-b border-slate-50 ${currentTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-705'}`}
          >
            Home Shop
          </button>

          <button
            onClick={() => { setTab('track'); setMobileMenuOpen(false); }}
            className={`block w-full text-left py-2 font-medium border-b border-slate-50 flex items-center gap-2 ${currentTab === 'track' ? 'text-emerald-700 font-bold' : 'text-slate-705'}`}
          >
            <span>📦</span> Track Order
          </button>

          {currentTab === 'home' && navItems.filter(item => item.id !== 'home').map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.section)}
              className="block w-full text-left py-2 text-slate-500 hover:text-emerald-600 font-normal border-b border-slate-50 pl-2"
            >
              {item.label}
            </button>
          ))}

          {/* User Section in mobile header list */}
          {currentUser ? (
            <div className="py-2.5 border-b border-slate-50 space-y-2">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-150">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">👤</span>
                <span className="text-sm font-semibold text-slate-800">Hi, {currentUser.name}</span>
              </div>
              <button
                type="button"
                onClick={() => { onUserLogout(); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 border border-slate-200 text-slate-600 font-bold rounded-lg text-xs"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 py-2 border-b border-slate-50">
              <button
                type="button"
                onClick={() => { onAuthClick(); setMobileMenuOpen(false); }}
                className="w-full py-2 border border-slate-200 text-slate-705 font-bold rounded-lg text-xs"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { onAuthClick(); setMobileMenuOpen(false); }}
                className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
              >
                Register
              </button>
            </div>
          )}

          {isAdminLoggedIn ? (
            <div className="pt-2 space-y-2">
              <button
                onClick={() => { setTab('admin'); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Open Admin Dashboard
              </button>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 bg-rose-500 text-white font-semibold rounded-lg"
              >
                Log Out Admin
              </button>
            </div>
          ) : (
            <button
              onClick={() => { handleAdminToggle(); setMobileMenuOpen(false); }}
              className="w-full text-center py-2.5 mt-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium block"
            >
              {currentTab === 'admin' ? 'Back to Shop' : 'Staff Portal Login'}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
