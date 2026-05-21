import React, { useState, useEffect } from 'react';
import { Parrot, Enquiry } from '../types';
import { 
  Key, Shield, AlertCircle, Plus, Edit, Trash2, 
  HelpCircle, Eye, Calendar, User, Phone, CheckCircle, Clock,
  Camera, Upload, Link, Tag, Percent, ShoppingBag, Mail, Globe, Sparkles
} from 'lucide-react';

interface AdminPanelProps {
  token: string | null;
  onLoginSuccess: (token: string) => void;
  parrots: Parrot[];
  onRefreshData: () => void;
}

export default function AdminPanel({
  token,
  onLoginSuccess,
  parrots,
  onRefreshData
}: AdminPanelProps) {
  // Login credentials states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  // Form states for Create & Update (CRUD)
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedParrotId, setSelectedParrotId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Macaws');
  const [formSpecies, setFormSpecies] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formHealth, setFormHealth] = useState('Fully Certified & Vet-Checked');
  const [formTalkative, setFormTalkative] = useState<'High' | 'Very High' | 'Excellent' | 'Moderate'>('Excellent');
  const [formAvailable, setFormAvailable] = useState(true);
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>('upload');

  // Feedback states
  const [formMessage, setFormMessage] = useState({ text: '', type: 'success' });
  const [submittingForm, setSubmittingForm] = useState(false);

  // Enquiry state
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  // Active Admin segment Tab list
  const [adminTab, setAdminTab] = useState<'catalog' | 'enquiries' | 'orders' | 'promocodes'>('catalog');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Promo codes State
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);

  // Promo creation Form states
  const [promoFormCode, setPromoFormCode] = useState('');
  const [promoFormType, setPromoFormType] = useState<'percentage' | 'flat'>('percentage');
  const [promoFormValue, setPromoFormValue] = useState('');
  const [promoFormMinOrder, setPromoFormMinOrder] = useState('');
  const [promoFormActive, setPromoFormActive] = useState(true);
  const [promoMessage, setPromoMessage] = useState('');

  // 1. Fetch Enquiries, Orders, and Promo codes when logged in
  useEffect(() => {
    if (token) {
      fetchEnquiries();
      fetchOrders();
      fetchPromoCodes();
    }
  }, [token]);

  const fetchEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const response = await fetch('/api/enquiries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEnquiries(data);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Sort descending so newest are on top
        setOrders(Array.isArray(data) ? data.reverse() : []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchPromoCodes = async () => {
    setLoadingPromos(true);
    try {
      const response = await fetch('/api/promocodes');
      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data || []);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setLoadingPromos(false);
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoFormCode.trim() || !promoFormValue) {
      setPromoMessage('Code and Value are required.');
      return;
    }

    try {
      const response = await fetch('/api/promocodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: promoFormCode.trim().toUpperCase(),
          type: promoFormType,
          value: Number(promoFormValue),
          minOrder: Number(promoFormMinOrder) || 0,
          active: promoFormActive
        })
      });

      if (response.ok) {
        setPromoFormCode('');
        setPromoFormValue('');
        setPromoFormMinOrder('');
        setPromoFormActive(true);
        setPromoMessage('Promo code published successfully!');
        fetchPromoCodes();
        setTimeout(() => setPromoMessage(''), 4000);
      } else {
        const r = await response.json();
        setPromoMessage(r.error || 'Server rejected creation request.');
      }
    } catch (err) {
      console.error(err);
      setPromoMessage('Error creating promo code.');
    }
  };

  const handleDeletePromo = async (code: string) => {
    if (!window.confirm(`Delete promo code ${code}?`)) return;
    try {
      const response = await fetch(`/api/promocodes/${code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchPromoCodes();
      } else {
        alert('Failed to delete promo code.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncAll = () => {
    fetchEnquiries();
    fetchOrders();
    fetchPromoCodes();
    onRefreshData();
  };

  // 2. Perform Login action
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError('Both Username and Password are required.');
      return;
    }

    setAuthenticating(true);
    setLoginError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        onLoginSuccess(result.token);
      } else {
        setLoginError(result.error || 'Invalid credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Could not establish connection to safety server.');
    } finally {
      setAuthenticating(false);
    }
  };

  // 3. Populate Form for Editing (CRUD - Update Trigger)
  const handleEditTrigger = (parrot: Parrot) => {
    setIsEditMode(true);
    setSelectedParrotId(parrot.id);
    
    setFormName(parrot.name);
    setFormCategory(parrot.category);
    setFormSpecies(parrot.species);
    setFormPrice(parrot.price.toString());
    setFormDescription(parrot.description);
    setFormImageUrl(parrot.imageUrl);
    setFormAge(parrot.age);
    setFormHealth(parrot.healthStatus);
    setFormTalkative(parrot.talkativeLevel);
    setFormAvailable(parrot.available);

    // Scroll cleanly block
    document.getElementById('admin-form-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  // 4. Clear/Reset Form State
  const resetForm = () => {
    setIsEditMode(false);
    setSelectedParrotId(null);

    setFormName('');
    setFormCategory('Macaws');
    setFormSpecies('');
    setFormPrice('');
    setFormDescription('');
    setFormImageUrl('');
    setFormAge('');
    setFormHealth('Fully Certified & Vet-Checked');
    setFormTalkative('Excellent');
    setFormAvailable(true);
    setImageInputMethod('upload');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 5. Create or Update submission (CRUD - Create & Update Submission)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSpecies.trim() || !formPrice) {
      setFormMessage({ text: 'Name, Species specification, and Price are required.', type: 'error' });
      return;
    }

    setSubmittingForm(true);
    setFormMessage({ text: '', type: 'success' });

    const payload = {
      name: formName,
      category: formCategory,
      species: formSpecies,
      price: Number(formPrice),
      description: formDescription || 'Beautiful exotic captive-bred parrot.',
      imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=800&q=85',
      age: formAge || 'N/A',
      healthStatus: formHealth,
      talkativeLevel: formTalkative,
      available: formAvailable
    };

    const endpoint = isEditMode && selectedParrotId 
      ? `/api/parrots/${selectedParrotId}` 
      : '/api/parrots';
      
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok) {
        setFormMessage({ 
          text: isEditMode 
            ? `Successfully updated details for ${formName}.` 
            : `Successfully registered ${formName} as a new aviary parrot.`, 
          type: 'success' 
        });
        resetForm();
        onRefreshData(); // Re-trigger live lists
      } else {
        setFormMessage({ text: result.error || 'Server rejected request.', type: 'error' });
      }
    } catch (err) {
      console.error('CRUD edit error:', err);
      setFormMessage({ text: 'Failed to complete transaction connection.', type: 'error' });
    } finally {
      setSubmittingForm(false);
    }
  };

  // 6. Delete Parrot item (CRUD - Delete)
  const handleDeleteParrot = async (id: string, name: string) => {
    const confirmed = window.confirm(`Are you absolutely sure you want to remove ${name} from products list database?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/parrots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (response.ok) {
        alert(`${name} has been successfully deleted.`);
        onRefreshData();
      } else {
        alert(`Error deleting parrot: ${result.error}`);
      }
    } catch (err) {
      console.error('CRUD delete error:', err);
      alert('Failed to connect and delete. Try again later.');
    }
  };

  // Simple Indian Rupee formatter
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Render Login interface when Unauthorized
  if (!token) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 min-h-[60vh] flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          
          <div className="text-center space-y-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-150 flex items-center justify-center text-slate-700 mx-auto">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-[#0f172a] text-xl sm:text-2xl tracking-tight leading-none">
                Aviary Administration Area
              </h2>
              <p className="text-xs text-slate-400 font-light mt-2">
                Authorized entry with server security keys.
              </p>
            </div>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-light">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  @
                </div>
                <input
                  id="admin-username"
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-slate-800 outline-none outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Secret Access Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-slate-800 outline-none outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:tracking-wide text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              {authenticating ? 'Verifying Session with Server...' : 'Authorize Login Session'}
            </button>
          </form>

          {/* Quick Info Hints for Testing */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-[10px] text-slate-400 leading-snug">
            <p>Demo Admin Credentials:</p>
            <p className="font-mono mt-1 font-semibold text-slate-500">Username: <span className="text-emerald-600">Qasib86990</span> &nbsp;|&nbsp; Password: <span className="text-emerald-600">Qasib@8699026488</span></p>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display font-black text-slate-900 text-2xl sm:text-3xl tracking-tight leading-none flex items-center gap-2">
            🛡️ Aviary Administrative Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-light">
            Authorized portal for species stock control, live promotional discount codes, client enquiries, and customer order handovers.
          </p>
        </div>
        <div>
          <button 
            onClick={handleSyncAll}
            className="px-4 py-2.5 text-xs sm:text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            🔄 Sync Live Database
          </button>
        </div>
      </div>

      {/* Tabs list selector */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setAdminTab('catalog')}
          className={`px-4 py-3 font-display text-xs sm:text-sm font-semibold border-b-2 tracking-tight transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'catalog'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          🦜 Manage Catalog ({parrots.length})
        </button>
        <button
          onClick={() => setAdminTab('orders')}
          className={`px-4 py-3 font-display text-xs sm:text-sm font-semibold border-b-2 tracking-tight transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'orders'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          📦 Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setAdminTab('promocodes')}
          className={`px-4 py-3 font-display text-xs sm:text-sm font-semibold border-b-2 tracking-tight transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'promocodes'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          🏷️ Promo Codes ({promoCodes.length})
        </button>
        <button
          onClick={() => setAdminTab('enquiries')}
          className={`px-4 py-3 font-display text-xs sm:text-sm font-semibold border-b-2 tracking-tight transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'enquiries'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          📥 Enquiry Inbox ({enquiries.length})
        </button>
      </div>

      {/* --- Catalog tab container --- */}
      {adminTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Create / Edit Form */}
          <div id="admin-form-anchor" className="lg:col-span-4 bg-white border border-slate-150 p-6 sm:p-8 rounded-2xl shadow-sm relative">
            <h3 className="font-display font-bold text-slate-950 text-base tracking-tight mb-1.5">
              {isEditMode ? '✏️ Modify Parrot Details' : '➕ Register New Aviary Parrot'}
            </h3>
            <p className="text-xs text-slate-400 font-light mb-6">
              {isEditMode ? 'Modify specific attributes for database entry.' : 'Provide details below to publish live listings in India aviary store.'}
            </p>

            {formMessage.text && (
              <div className={`mb-5 p-3 rounded-xl text-xs flex items-center gap-2 ${
                formMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-800 border border-rose-100'
              }`}>
                {formMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                <span>{formMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="form-name" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Parrot Call Name
                </label>
                <input
                  id="form-name"
                  type="text"
                  required
                  placeholder="e.g., Sky"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="form-category" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Category Group
                </label>
                <select
                  id="form-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none"
                >
                  <option value="Macaws">Macaws</option>
                  <option value="African Greys">African Greys</option>
                  <option value="Cockatoos">Cockatoos</option>
                  <option value="Conures">Conures</option>
                  <option value="Budgies & Cockatiels">Budgies & Cockatiels</option>
                </select>
              </div>

              {/* Species */}
              <div>
                <label htmlFor="form-species" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Species Breed Title
                </label>
                <input
                  id="form-species"
                  type="text"
                  required
                  placeholder="e.g., Scarlet Macaw"
                  value={formSpecies}
                  onChange={(e) => setFormSpecies(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none"
                />
              </div>

              {/* Price (INR) */}
              <div>
                <label htmlFor="form-price" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Price (₹ INR Contrib)
                </label>
                <input
                  id="form-price"
                  type="number"
                  required
                  placeholder="e.g., 95000"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none font-mono"
                />
              </div>

              {/* Age */}
              <div>
                <label htmlFor="form-age" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Bird Age Report
                </label>
                <input
                  id="form-age"
                  type="text"
                  placeholder="e.g., 9 Months"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none"
                />
              </div>

              {/* Health */}
              <div>
                <label htmlFor="form-health" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Health/Vaccination Status
                </label>
                <input
                  id="form-health"
                  type="text"
                  placeholder="e.g., Vet checked & De-wormed"
                  value={formHealth}
                  onChange={(e) => setFormHealth(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none"
                />
              </div>

              {/* Intelligent talkative level */}
              <div>
                <label htmlFor="form-talkative" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Talkative Mimic Level
                </label>
                <select
                  id="form-talkative"
                  value={formTalkative}
                  onChange={(e) => setFormTalkative(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Very High">Very High</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                </select>
              </div>

              {/* Image Upload or URL Loader Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Parrot Presentation Image
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('upload')}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                        imageInputMethod === 'upload'
                          ? 'bg-emerald-100 text-emerald-850 border border-emerald-200'
                          : 'bg-slate-50 text-slate-400 hover:text-slate-600 border border-transparent'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('url')}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                        imageInputMethod === 'url'
                          ? 'bg-emerald-100 text-emerald-850 border border-emerald-200'
                          : 'bg-slate-50 text-slate-400 hover:text-slate-600 border border-transparent'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageInputMethod === 'upload' ? (
                  <div className="space-y-2">
                    {formImageUrl ? (
                      <div className="relative border border-slate-200 rounded-xl overflow-hidden p-1.5 bg-slate-50 flex items-center gap-3">
                        <img
                          src={formImageUrl}
                          alt="Preview upload"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200/80 shrink-0"
                        />
                        <div className="text-left overflow-hidden">
                          <p className="text-[10px] text-emerald-700 font-bold leading-none">✓ Photo Attached</p>
                          <p className="text-[9px] text-slate-400 font-mono truncate mt-1">
                            {formImageUrl.startsWith('data:') ? 'Local Base64 Binary File' : formImageUrl}
                          </p>
                          <button
                            type="button"
                            onClick={() => setFormImageUrl('')}
                            className="mt-1.5 text-[9px] font-mono font-bold text-rose-600 hover:text-rose-800 transition-colors uppercase cursor-pointer"
                          >
                            Delete Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <Camera className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">Choose / Drag Local Image</p>
                          <p className="text-[10px] text-slate-400 font-light mt-0.5">Supports PNG, JPG, JPEG, WEBP</p>
                        </div>
                      </label>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 scale-90">
                        <Link className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="form-img"
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-slate-600 truncate"
                      />
                    </div>
                    {formImageUrl && (
                      <div className="mt-2 p-1.5 bg-slate-50 border border-slate-150 rounded-lg flex items-center gap-2">
                        <img src={formImageUrl} alt="Preview web URL" className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0" />
                        <span className="text-[9px] text-slate-400 font-mono truncate">{formImageUrl}</span>
                      </div>
                    )}
                    <p className="text-[9px] text-slate-400 mt-1 pl-1">Insert direct Unsplash or cloud image web address.</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="form-desc" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description / Highlights
                </label>
                <textarea
                  id="form-desc"
                  rows={3}
                  placeholder="Write highlights like behavior, hand-feeding details, DNA sexing"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none resize-none"
                />
              </div>

              {/* Available Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="form-avail"
                  type="checkbox"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <label htmlFor="form-avail" className="text-xs text-slate-700 font-medium select-none">
                  List as Available for Booking
                </label>
              </div>

              {/* Form actions CTA */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2.5 text-xs font-semibold border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-semibold rounded-xl hover:shadow shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  {submittingForm ? 'Submitting...' : isEditMode ? 'Update Database Record' : 'Publish New Parrot'}
                </button>
              </div>

            </form>
          </div>

          {/* Right Side: Manage list stock */}
          <div className="lg:col-span-8 bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm tracking-tight">
                  📋 Manage Current Aviary Stock
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Edit or remove records directly from products.json database.</p>
              </div>
              <span className="font-mono text-xs text-slate-500 font-semibold bg-white border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                {parrots.length} listed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50/50 text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase">
                    <th className="py-3 px-4">Parrot Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (₹)</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-xs text-slate-705">
                  {parrots.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 font-light">
                        No species listed in the database. Add one above!
                      </td>
                    </tr>
                  ) : (
                    parrots.map((parrot) => (
                      <tr key={parrot.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Image + Info */}
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <img
                            src={parrot.imageUrl}
                            alt={parrot.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200/85"
                          />
                          <div>
                            <p className="font-bold text-slate-950 font-display text-sm">{parrot.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{parrot.species}</p>
                          </div>
                        </td>
                        
                        {/* Category */}
                        <td className="py-3.5 px-4 font-medium text-slate-500 font-mono text-[11px]">
                          {parrot.category}
                        </td>
                        
                        {/* Price formatted */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {formatINR(parrot.price)}
                        </td>

                        {/* Status Checkbox visual */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            parrot.available
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${parrot.available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {parrot.available ? 'On Display' : 'Sold Out'}
                          </span>
                        </td>

                        {/* Actions buttons */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditTrigger(parrot)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded bg-white border border-slate-150 transition-all cursor-pointer"
                              title="Edit particulars"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteParrot(parrot.id, parrot.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded bg-white border border-slate-150 transition-all cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- Enquiry tab view --- */}
      {adminTab === 'enquiries' && (
        <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden animate-fade-in text-left">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                📥 Client Consulting Requests Inbox
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Offline/Online customer callback leads compiled directly from landing platform form.</p>
            </div>
            <span className="font-mono text-xs text-slate-500 font-semibold bg-white border border-slate-200/80 px-2.5 py-0.5 rounded-full">
              {enquiries.length} requests
            </span>
          </div>

          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {loadingEnquiries ? (
              <div className="py-8 text-center text-slate-400 font-light text-xs font-mono animate-pulse">
                Syncing server consulting desk...
              </div>
            ) : enquiries.length === 0 ? (
              <div className="py-14 text-center text-slate-400 font-light text-xs">
                Inbox lead queue is currently empty.
              </div>
            ) : (
              enquiries.map((enq) => (
                <div 
                  key={enq.id} 
                  className="p-4.5 bg-slate-50 border border-slate-150/80 rounded-xl space-y-3 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <div className="w-6.5 h-6.5 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 text-[10px]">
                        👤
                      </div>
                      {enq.name}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400 font-medium">
                      <span className="flex items-center gap-0.5 text-slate-700 bg-white px-2.5 py-0.5 border border-slate-200 rounded font-bold">
                        <Phone className="w-3 h-3 text-slate-400" /> {enq.phone}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {new Date(enq.date).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg font-light">
                    {enq.message || <span className="text-slate-300 italic">No message recorded. Customer requested immediate voice callback consulting on care schedules.</span>}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- Customer Orders tab view with Payment Reference check --- */}
      {adminTab === 'orders' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-black text-slate-900 text-sm">
                📦 Registered Captive-Bred Handover Bookings
              </h3>
              <p className="text-[11px] text-slate-500 font-light mt-0.5">Verify official client payments and approve DNA dispatch clearance certifications.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white border border-slate-200 px-3 py-1 rounded-xl text-slate-600 font-bold">
                Total Revenue Pool: {formatINR(orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0))}
              </span>
            </div>
          </div>

          {loadingOrders ? (
            <div className="py-20 text-center text-slate-400 text-xs font-mono">
              Loading client-registered dispatch forms...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-150 rounded-2xl p-16 text-center text-slate-400 text-xs">
              No official customer orders found in aviary log storage.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((ord: any) => {
                const isUPI = ord.paymentMethod === 'upi';
                return (
                  <div key={ord.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    
                    {/* Header bar */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Track ID Shipment</p>
                          <h4 className="font-mono text-sm font-bold text-emerald-800">{ord.id}</h4>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 inline-block">
                            {new Date(ord.date).toLocaleString('en-IN')}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                            isUPI ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {isUPI ? 'Scan & Pay (UPI)' : 'Cash on Delivery'}
                          </span>
                        </div>
                      </div>

                      {/* Payment Verification panel (CRITICAL for UPI) */}
                      <div className={`p-3 rounded-xl space-y-1.5 border ${
                        isUPI 
                          ? ord.utrNumber 
                            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950' 
                            : 'bg-rose-50/50 border-rose-100 text-rose-950'
                          : 'bg-amber-50/50 border-amber-150/50 text-amber-950'
                      }`}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold uppercase tracking-tight font-mono">
                            💰 Payment Assurance Status:
                          </span>
                          <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${
                            isUPI 
                              ? ord.utrNumber ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isUPI ? ord.utrNumber ? 'UTR Provided (Verified)' : 'Pending UTR Entry' : 'Pay on Step'}
                          </span>
                        </div>
                        
                        {isUPI ? (
                          <div className="text-xs space-y-1">
                            <p className="font-light text-slate-600">
                              Please match this transaction reference in bank feeds before forestry ring attachment:
                            </p>
                            <p className="font-mono bg-white p-1.5 rounded border border-slate-200 text-slate-800 font-extrabold select-all text-center">
                              UTR/Ref: {ord.utrNumber ? ord.utrNumber : '🚨 NO REFERENCE ID ENTERED BY USER'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 font-light leading-snug">
                            Collect cash of <strong>{formatINR(ord.totalAmount)}</strong> from customer upon transport doorstep arrival.
                          </p>
                        )}
                      </div>

                      {/* Customer Snapshot */}
                      <div className="space-y-1 text-xs">
                        <p className="text-slate-500 font-medium">
                          👤 <strong className="text-slate-800">Customer Details:</strong> {ord.firstName} {ord.lastName || ''}
                        </p>
                        {ord.email && (
                          <p className="text-slate-500 font-medium">
                            📬 <strong className="text-slate-800">Email Address:</strong> <a className="text-[#2563eb] underline truncate" href={`mailto:${ord.email}`}>{ord.email}</a>
                          </p>
                        )}
                        <p className="text-slate-500">
                          📞 <strong className="text-slate-800">Phone:</strong> {ord.phone}
                        </p>
                        <p className="text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-normal mt-1 text-[11px]">
                          📍 <strong className="text-slate-800">Address:</strong> {ord.address} {ord.pincode ? `(Pincode: ${ord.pincode})` : ''} 
                          {ord.landmark ? ` [Landmark: ${ord.landmark}]` : ''}
                        </p>
                        {ord.notes && (
                          <p className="text-slate-400 italic text-[11px] mt-1 pl-2 border-l border-slate-200">
                            Note: "{ord.notes}"
                          </p>
                        )}
                      </div>

                      {/* Booked Consignment Specimen lists */}
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1.5">Consignment Species Details</p>
                        <div className="space-y-1.5">
                          {ord.items && ord.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-dashed border-slate-100 last:border-b-0">
                              <div>
                                <span className="font-bold text-slate-800">{item.parrot?.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono ml-2">({item.parrot?.species})</span>
                              </div>
                              <span className="font-mono text-slate-600 font-bold">Qty {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Promo Code Discount Panel */}
                      {ord.promoCode && (
                        <div className="pt-2 border-t border-slate-150 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-emerald-700 font-semibold font-mono bg-emerald-50 px-2 py-0.5 rounded">
                            <Tag className="w-3 h-3" /> USED CODE: {ord.promoCode}
                          </div>
                          <span className="font-mono text-rose-600 font-semibold">
                            -{formatINR(ord.discountAmount || 0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer Amount summary */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 font-mono">ESTIMATED FINAL DUE:</span>
                      <span className="text-base font-mono font-black text-slate-900">{formatINR(ord.totalAmount)}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- Promo Codes administration view --- */}
      {adminTab === 'promocodes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-left">
          
          {/* Left: Create Promo form */}
          <div className="lg:col-span-4 bg-white border border-slate-150 p-6 sm:p-8 rounded-2xl shadow-xs">
            <h3 className="font-display font-bold text-slate-950 text-base tracking-tight mb-1.5">
              🏷️ Create New Promo Code
            </h3>
            <p className="text-xs text-slate-400 font-light mb-6">
              Establish a system-wide discount coupon. Customers can apply this code during checkout in their shopping cart.
            </p>

            {promoMessage && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-medium">
                📢 {promoMessage}
              </div>
            )}

            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <div>
                <label htmlFor="promo-code" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Coupon Code Name
                </label>
                <input
                  id="promo-code"
                  type="text"
                  required
                  placeholder="e.g., EASTER25"
                  value={promoFormCode}
                  onChange={(e) => setPromoFormCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Discount Deduction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPromoFormType('percentage')}
                    className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                      promoFormType === 'percentage'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 font-bold'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromoFormType('flat')}
                    className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                      promoFormType === 'flat'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 font-bold'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Flat Currency (₹)
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="promo-value" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {promoFormType === 'percentage' ? 'Deduction Percent Value (%)' : 'Deduction Flat Amount (₹)'}
                </label>
                <input
                  id="promo-value"
                  type="number"
                  required
                  placeholder={promoFormType === 'percentage' ? 'e.g., 10 (for 10% off)' : 'e.g., 5000 (for ₹5,000 off)'}
                  value={promoFormValue}
                  onChange={(e) => setPromoFormValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label htmlFor="promo-min-order" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Minimum Basket Order Required (Optional)
                </label>
                <input
                  id="promo-min-order"
                  type="number"
                  placeholder="e.g., 20000 (0 for no limit)"
                  value={promoFormMinOrder}
                  onChange={(e) => setPromoFormMinOrder(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="promo-active"
                  type="checkbox"
                  checked={promoFormActive}
                  onChange={(e) => setPromoFormActive(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <label htmlFor="promo-active" className="text-xs text-slate-705 font-medium select-none cursor-pointer">
                  Activate Code Immediately
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl text-xs sm:text-xs shadow-sm hover:shadow active:scale-95 transition-all text-center cursor-pointer"
              >
                Publish Coupon Code
              </button>
            </form>
          </div>

          {/* Right: Codes lists */}
          <div className="lg:col-span-8 bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm tracking-tight">
                  📋 Active Promotional Discount Coupons
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Control client discount margins by configuring codes database entries logs.</p>
              </div>
              <span className="font-mono text-xs text-slate-500 font-semibold bg-white border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                {promoCodes.length} active coupons
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50/50 text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase">
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Benefit Cash value</th>
                    <th className="py-3 px-4">Threshold</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-705 font-medium">
                  {loadingPromos ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-light font-mono scale-95">
                        Reading active server codes indexes...
                      </td>
                    </tr>
                  ) : promoCodes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-light text-xs">
                        No promotional discount codes registered in the system. Create one on the left!
                      </td>
                    </tr>
                  ) : (
                    promoCodes.map((p) => (
                      <tr key={p.code} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0f172a] select-all bg-slate-50/30">
                          🎫 {p.code}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {p.type === 'percentage' ? 'Percentage %' : 'Flat ₹ Amount'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                          {p.type === 'percentage' ? `${p.value}% Off` : `₹${new Intl.NumberFormat('en-IN').format(p.value)} Off`}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {p.minOrder > 0 ? `Min: ₹${new Intl.NumberFormat('en-IN').format(p.minOrder)}` : 'No limits'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                            p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {p.active ? '● LIVE' : '○ SHUT'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDeletePromo(p.code)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </main>
  );
}
