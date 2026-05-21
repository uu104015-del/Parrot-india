import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import TrustBadges from './components/TrustBadges';
import ParrotCard from './components/ParrotCard';
import ReviewSection from './components/ReviewSection';
import ContactForm from './components/ContactForm';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import OrderTracker from './components/OrderTracker';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { Parrot, CartItem } from './types';
import { Search, SlidersHorizontal, Volume2, ShieldAlert } from 'lucide-react';

import macawPic from './assets/images/macaw_portrait_1779307405891.png';
import greyPic from './assets/images/african_grey_portrait_1779307424635.png';
import cockatooPic from './assets/images/cockatoo_portrait_1779307443037.png';

const DEFAULT_PARROTS: Parrot[] = [
  {
    id: "parrot-1",
    name: "Aura",
    category: "Macaws",
    species: "Blue & Gold Macaw",
    price: 135000,
    description: "Extremely playful, highly intelligent, and beautiful companion with vibrant blue and bright gold feathers. Aura is hand-raised, gentle, and already knows basic greetings and whistles. Ideal for a loving home.",
    imageUrl: macawPic,
    age: "8 Months",
    healthStatus: "Fully Certified & Vet-Checked",
    talkativeLevel: "Excellent",
    available: true
  },
  {
    id: "parrot-2",
    name: "Echo",
    category: "African Greys",
    species: "Congo African Grey",
    price: 155000,
    description: "Echo is a prime Congolense African Grey. Famous worldwide for legendary cognitive abilities and vocabulary. Echo mimics ambient sounds perfectly and is currently picking up active conversational phrases.",
    imageUrl: greyPic,
    age: "10 Months",
    healthStatus: "DNA Certified Male & Healthy",
    talkativeLevel: "Very High",
    available: true
  },
  {
    id: "parrot-3",
    name: "Casper",
    category: "Cockatoos",
    species: "Umbrella Cockatoo",
    price: 125000,
    description: "If you are looking for a gentle, extremely affectionate companion, Casper is the perfect fit. He loves head scratches, raises his majestic crest when excited, and has beautiful pure white plumage.",
    imageUrl: cockatooPic,
    age: "7 Months",
    healthStatus: "DNA Certified Female & Fully De-wormed",
    talkativeLevel: "High",
    available: true
  }
];

const sanitizeImageUrl = (url: string): string => {
  if (!url) return macawPic;
  if (url.includes('macaw_portrait')) return macawPic;
  if (url.includes('african_grey_portrait')) return greyPic;
  if (url.includes('cockatoo_portrait')) return cockatooPic;
  return url;
};

export default function App() {
  // Navigation & View Section states
  const [currentTab, setTab] = useState<'home' | 'admin' | 'track'>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // User persistent status state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('parrot_india_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Track User session to storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('parrot_india_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('parrot_india_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Data states loaded via server
  const [parrots, setParrots] = useState<Parrot[]>(DEFAULT_PARROTS);
  const [loading, setLoading] = useState(true);

  // Filter and Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Shopping cart persistent states
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('parrot_paradise_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin session management
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('parrot_paradise_admin_token') || null;
    } catch {
      return null;
    }
  });

  // 1. Fetch initial parrots from dynamic backend server.ts API
  useEffect(() => {
    fetchParrots();
  }, []);

  // Save Cart to localstorage on change
  useEffect(() => {
    try {
      localStorage.setItem('parrot_paradise_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart items:', err);
    }
  }, [cartItems]);

  const fetchParrots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parrots');
      if (response.ok) {
        const data = await response.json();
        setParrots(data);
      } else {
        console.error('Failed to load parrots list');
      }
    } catch (error) {
      console.error('Connection error when fetching parrots list:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Refresh listed parrots data trigger (used from Admin CRUD)
  const handleRefreshData = () => {
    fetchParrots();
  };

  // 3. Cart Interaction Logics
  const handleAddToBucket = (parrot: Parrot) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setCartItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.parrot.id === parrot.id);
      if (index !== -1) {
        // Increment quantity if already exists
        const copy = [...prevItems];
        copy[index] = { ...copy[index], quantity: copy[index].quantity + 1 };
        return copy;
      } else {
        // Add new
        return [...prevItems, { parrot, quantity: 1 }];
      }
    });
    // Visual drawer pop out feedback
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, amount: number) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.parrot.id === id) {
            const nextQty = item.quantity + amount;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.parrot.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // 4. Admin Session loggers
  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    try {
      localStorage.setItem('parrot_paradise_admin_token', token);
    } catch (err) {
      console.warn('Storage security limit met:', err);
    }
    setTab('admin');
  };

  const handleLogout = () => {
    setAdminToken(null);
    try {
      localStorage.removeItem('parrot_paradise_admin_token');
    } catch (err) {
      console.warn('Storage security limit met:', err);
    }
    setTab('home');
  };

  // 5. Scroll helper
  const handleExploreClick = () => {
    setTab('home');
    setTimeout(() => {
      document.getElementById('parrots-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 6. Filtering & Searching Parrots
  const uniqueCategories = ['All', 'Macaws', 'African Greys', 'Cockatoos', 'Conures', 'Budgies & Cockatiels'];

  const filteredParrots = parrots.filter((parrot) => {
    const matchesCategory = selectedCategory === 'All' || parrot.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      parrot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parrot.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parrot.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItemsCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      
      {/* 1. Header Navigation Bar */}
      <Header
        cartCount={cartItemsCount}
        onCartClick={() => setIsCartOpen(true)}
        currentTab={currentTab}
        setTab={setTab}
        isAdminLoggedIn={!!adminToken}
        onLogout={handleLogout}
        currentUser={currentUser}
        onAuthClick={() => setIsAuthOpen(true)}
        onUserLogout={() => setCurrentUser(null)}
      />

      {/* 2. Main Body (Conditional views) */}
      <div className="flex-grow">
        {currentTab === 'home' ? (
          <div className="space-y-0">
            {/* Hero Section Banner */}
            <HeroBanner onExploreClick={handleExploreClick} />

            {/* Sincerity Badges */}
            <TrustBadges />

            {/* Categories & Dynamic Search Grid */}
            <section id="parrots-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-10 scroll-mt-10">
              
              {/* Headline */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-600 font-bold">Catalog Showcase</span>
                  <h2 className="font-display font-extrabold text-[#0f172a] text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-none mt-1">
                    Meet Our Hand-Raised Fledglings
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-light mt-2 max-w-xl">
                    Every fledgling is spoon-fed, completely socialized inside our family space, DNA sexed, and veterinarian certified before list publishing.
                  </p>
                </div>

                {/* Filter and Search Bar controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  
                  {/* Search text field */}
                  <div className="relative flex-grow sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search species or hobbies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-slate-800 outline-none outline-none shadow-2xs transition-all placeholder:text-slate-400"
                    />
                  </div>

                </div>
              </div>

              {/* Dynamic Category Pill Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 mr-2 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Group By:
                </span>
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                        : 'bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Parrots Showcase Grid list */}
              {loading ? (
                <div className="py-24 text-center space-y-4">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-mono text-xs text-slate-400 font-medium">Querying Avian Sourcing Databases...</p>
                </div>
              ) : filteredParrots.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white max-w-xl mx-auto space-y-3">
                  <p className="text-2xl">🌱</p>
                  <h4 className="font-display font-semibold text-slate-800 text-sm">No Companion Birds Found</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed font-light font-sans">
                    We don't currently have active fledglings matching those filters. Submit our consult enquiry form to pre-book upcoming breeds!
                  </p>
                  <button
                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                    className="px-4 py-2 text-xs font-semibold text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 rounded-xl transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredParrots.map((parrot) => (
                    <ParrotCard
                      key={parrot.id}
                      parrot={parrot}
                      onAddToBucket={handleAddToBucket}
                    />
                  ))}
                </div>
              )}

            </section>

            {/* Testimonial reviews section */}
            <ReviewSection />

            {/* Contact us Consultation enquire form */}
            <ContactForm />
          </div>
        ) : currentTab === 'track' ? (
          /* Companion Tracker view */
          <OrderTracker />
        ) : (
          /* Secure Admin Panel view */
          <AdminPanel
            token={adminToken}
            onLoginSuccess={handleLoginSuccess}
            parrots={parrots}
            onRefreshData={handleRefreshData}
          />
        )}
      </div>

      {/* 3. Footer Section with sourcing and legal guidelines details */}
      <Footer setTab={setTab} />

      {/* 4. Sliding Shopping Bucket Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 5. Authentication Overlay Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

    </div>
  );
}
