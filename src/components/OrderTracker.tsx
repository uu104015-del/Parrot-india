import { useState, useEffect } from 'react';
import { Search, Package, MapPin, Calendar, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ClientOrder } from '../types';

export default function OrderTracker() {
  const [searchId, setSearchId] = useState('');
  const [currentOrder, setCurrentOrder] = useState<ClientOrder | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);

  // We can automatically fetch demo items or look up orders from localStorage or API
  const handleTrackSubmit = async (targetId: string) => {
    if (!targetId.trim()) return;
    setSearching(true);
    setSearchError('');
    setCurrentOrder(null);

    const normalId = targetId.trim().toLowerCase();

    // 1. First check if it's a demo order
    if (DEMO_ORDERS[normalId]) {
      setTimeout(() => {
        setCurrentOrder(DEMO_ORDERS[normalId]);
        setSearching(false);
      }, 300);
      return;
    }

    // 2. Query our API server for registered orders
    try {
      const res = await fetch(`/api/orders/${normalId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentOrder(data);
      } else {
        // Fallback: Check localStorage
        let storedOrders = [];
        try {
          const storedOrdersString = localStorage.getItem('parrot_india_orders');
          storedOrders = storedOrdersString ? JSON.parse(storedOrdersString) : [];
        } catch (err) {
          console.warn("Storage security boundary reached: ", err);
        }
        const localMatch = storedOrders.find((o: any) => o.id.toLowerCase() === normalId);
        
        if (localMatch) {
          setCurrentOrder(localMatch);
        } else {
          setSearchError('No official companion order found with this Track ID. Please verify the code or test one of our simulation options below.');
        }
      }
    } catch (err) {
      console.error(err);
      setSearchError('Error contacting aviary lookup system. Showing offline fallback.');
    } finally {
      setSearching(false);
    }
  };

  // Helper helper to calculate times and status
  const getCalculatedStatus = (dateString: string): {
    code: 'Pending' | 'Unpaid' | 'Cancelled';
    label: string;
    color: string;
    desc: string;
    bgColor: string;
    borderColor: string;
  } => {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays <= 2) {
      return {
        code: 'Pending',
        label: 'Order Verification & DNA Registry (Pending)',
        color: 'text-amber-700 bg-amber-50',
        bgColor: 'bg-amber-500',
        borderColor: 'border-amber-200',
        desc: 'Status (Day 1-2): We are currently registering forestry dispatch coordinates, finishing genetic blood-DNA sex identification, and obtaining authorized safety travel rings. A verification call is scheduled shortly.'
      };
    } else if (diffInDays <= 7) {
      return {
        code: 'Unpaid',
        label: 'Awaiting Payment Verification (Unpaid Hold)',
        color: 'text-blue-700 bg-blue-50',
        bgColor: 'bg-blue-500',
        borderColor: 'border-blue-200',
        desc: 'Status (Day 3-7): Your companion dispatch route is verified but held waiting for payment verification clearance. Please ensure UPI payment reference UTR is uploaded or await video-call dispatch clearance.'
      };
    } else {
      return {
        code: 'Cancelled',
        label: 'Automated Retention Expiry (Cancelled)',
        color: 'text-rose-700 bg-rose-50',
        bgColor: 'bg-rose-500',
        borderColor: 'border-rose-200',
        desc: 'Status (Over 1-2 Weeks): This order was not finalized or verified within our 7-14 day legal aviary nursery limits. For avian safety, companion nursery birds have been returned to open standard aviary rosters.'
      };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in">
      
      {/* Header section */}
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-emerald-800 bg-emerald-100 rounded-full inline-block uppercase">
          Real-time Handover Logistics
        </span>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
          Companion Dispatch Tracker
        </h2>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-500 font-light leading-relaxed">
          Monitor DNA certification statuses, forestry clearance certificates, and flight-dispatch times for your new companion aviary birds.
        </p>
      </div>

      {/* Tracker search widget */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-md relative overflow-hidden">
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
          Track Companion Shipment
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g., PI-ORD-109283"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-slate-800 font-mono outline-none transition-all placeholder:text-slate-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTrackSubmit(searchId);
              }}
            />
          </div>
          <button
            onClick={() => handleTrackSubmit(searchId)}
            disabled={searching}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-2xl text-xs sm:text-sm transition-all focus:scale-98 shadow-sm hover:shadow active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {searching ? 'Looking up...' : 'Search Details'}
            <Package className="w-4 h-4" />
          </button>
        </div>

        {searchError && (
          <p className="text-rose-600 text-xs mt-3 bg-rose-50 border border-rose-100 p-3 rounded-xl leading-normal font-medium">
            ⚠️ {searchError}
          </p>
        )}

        {/* Simulator Area for immediate review */}
        <div className="mt-6 pt-6 border-t border-slate-150 space-y-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
            <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Verify Timed Statuses (Instant Simulations)
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-light leading-snug">
            To easily review our order progression states (Pending for 1-2 days, Unpaid for 3-7 days, Cancelled after 1-2 weeks), click any of these prepared test links:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => {
                setSearchId('PI-SIM-PENDING');
                handleTrackSubmit('PI-SIM-PENDING');
              }}
              className="px-3 py-2 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-xl text-left text-[11px] transition-all cursor-pointer font-medium flex items-center justify-between"
            >
              <span>1. Pending (Just Now)</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>
            <button
              onClick={() => {
                setSearchId('PI-SIM-UNPAID');
                handleTrackSubmit('PI-SIM-UNPAID');
              }}
              className="px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 hover:border-blue-300 rounded-xl text-left text-[11px] transition-all cursor-pointer font-medium flex items-center justify-between"
            >
              <span>2. Unpaid (4 Days Ago)</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </button>
            <button
              onClick={() => {
                setSearchId('PI-SIM-CANCELLED');
                handleTrackSubmit('PI-SIM-CANCELLED');
              }}
              className="px-3 py-2 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200 hover:border-rose-300 rounded-xl text-left text-[11px] transition-all cursor-pointer font-medium flex items-center justify-between"
            >
              <span>3. Cancelled (12 Days Ago)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Track Result Display */}
      {currentOrder && (() => {
        const stats = getCalculatedStatus(currentOrder.date);
        return (
          <div className="space-y-6 animate-scale-in">
            {/* Meta status bar */}
            <div className={`border rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs ${stats.borderColor} ${stats.color.split(' ')[1]}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                <div className="space-y-1 text-left">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Order Identifiers</p>
                  <p className="font-mono text-sm font-bold text-slate-900">Track ID: {currentOrder.id}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Date Registered</p>
                  <p className="font-mono text-[11px] text-slate-800 font-medium">
                    {new Date(currentOrder.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Status explanation card */}
              <div className="flex items-start gap-3.5 text-left pt-1">
                <div className="mt-1 flex-shrink-0">
                  {stats.code === 'Pending' && <Clock className="w-6 h-6 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />}
                  {stats.code === 'Unpaid' && <AlertTriangle className="w-6 h-6 text-blue-600 animate-pulse" />}
                  {stats.code === 'Cancelled' && <XCircle className="w-6 h-6 text-rose-600" />}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight uppercase font-mono tracking-tight">
                    {stats.label}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    {stats.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Timeline graphics */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-xs">
              <h3 className="font-mono font-bold text-[10px] text-slate-400 uppercase tracking-widest">
                Transit Logistics Pipeline Timeline
              </h3>
              
              <div className="relative">
                {/* Horizontal line for timeline alignment */}
                <div className="absolute left-[15px] sm:left-auto sm:inset-x-0 top-6 bottom-6 sm:bottom-auto sm:h-0.5 bg-slate-150" />

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
                  
                  {/* Step 1: Confirmed */}
                  <div className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-2 text-left sm:text-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 border-4 border-emerald-100 flex items-center justify-center text-white text-xs z-10 flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">1. Order Logged</p>
                      <p className="text-[10px] text-emerald-600 font-mono">Confirmed</p>
                    </div>
                  </div>

                  {/* Step 2: DNA sexing */}
                  <div className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-2 text-left sm:text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 z-10 flex-shrink-0 text-xs font-mono font-bold ${
                      stats.code === 'Pending' ? 'bg-amber-500 border-amber-100 text-white' :
                      stats.code === 'Unpaid' ? 'bg-emerald-600 border-emerald-100 text-white' :
                      'bg-rose-500 border-rose-100 text-white'
                    }`}>
                      {stats.code === 'Pending' ? '...' : stats.code === 'Unpaid' ? '✓' : 'X'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">2. Genetic DNA Registry</p>
                      <p className={`text-[10px] font-mono ${
                        stats.code === 'Pending' ? 'text-amber-600' :
                        stats.code === 'Unpaid' ? 'text-emerald-600 font-medium' : 'text-rose-600'
                      }`}>
                        {stats.code === 'Pending' ? 'In Progress' : stats.code === 'Unpaid' ? 'Completed' : 'Cancelled'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Transit verified/paid status */}
                  <div className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-2 text-left sm:text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 z-10 flex-shrink-0 text-xs font-mono font-bold ${
                      stats.code === 'Pending' ? 'bg-slate-200 border-slate-100 text-slate-400' :
                      stats.code === 'Unpaid' ? 'bg-amber-500 border-amber-100 text-white' :
                      'bg-rose-500 border-rose-100 text-white'
                    }`}>
                      {stats.code === 'Pending' ? '3' : stats.code === 'Unpaid' ? '!' : 'X'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">3. Transit Fee Check</p>
                      <p className={`text-[10px] font-mono ${
                        stats.code === 'Pending' ? 'text-slate-400' :
                        stats.code === 'Unpaid' ? 'text-blue-600 font-bold' : 'text-rose-600'
                      }`}>
                        {stats.code === 'Pending' ? 'Queued' : stats.code === 'Unpaid' ? 'Verification Hold' : 'Expired'}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Dispatch Flight */}
                  <div className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-2 text-left sm:text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 z-10 flex-shrink-0 text-xs font-mono font-bold ${
                      stats.code === 'Cancelled' ? 'bg-rose-500 border-rose-100 text-white' : 'bg-slate-200 border-slate-100 text-slate-400'
                    }`}>
                      ✈
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#334155]">4. Flight Departure</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {stats.code === 'Cancelled' ? 'Terminated' : 'Standby Verification'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Buyer Snapshot Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              
              <div className="bg-white border border-slate-150 rounded-3xl p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-display font-bold text-slate-900 text-sm">Customer Delivery Destination</h3>
                </div>
                <div className="space-y-2.5 text-xs">
                  <p className="text-slate-500">
                    <strong className="text-slate-800">Customer Legal Name:</strong> {currentOrder.firstName} {currentOrder.lastName}
                  </p>
                  <p className="text-slate-500">
                    <strong className="text-slate-800">Destination Address:</strong> {currentOrder.address}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-slate-500">
                      <strong className="text-slate-800">Pincode:</strong> {currentOrder.pincode || 'N/A'}
                    </p>
                    <p className="text-slate-500">
                      <strong className="text-slate-800">Landmark:</strong> {currentOrder.landmark || 'N/A'}
                    </p>
                  </div>
                  <p className="text-slate-500">
                    <strong className="text-slate-800">Courier Contact Phone:</strong> {currentOrder.phone}
                  </p>
                  {currentOrder.notes && (
                    <p className="text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-150/50">
                      <strong className="text-slate-800">Dietary/Care Hand-over Instructions:</strong> {currentOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-150 rounded-3xl p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-display font-bold text-slate-900 text-sm">Consignment Species Details</h3>
                </div>
                
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                  {currentOrder.items && currentOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-b-0">
                      <div>
                        <p className="font-bold text-slate-800">{item.parrot?.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono leading-none">{item.parrot?.species}</p>
                      </div>
                      <div className="font-mono text-slate-700 font-bold">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase font-bold text-slate-400">Total Account Due:</span>
                  <span className="font-mono font-black text-slate-950 text-sm">
                    ₹{new Intl.NumberFormat('en-IN').format(currentOrder.totalAmount)}
                  </span>
                </div>
              </div>

            </div>

          </div>
        );
      })()}

    </div>
  );
}

// 4. Precompiled demonstration simulated orders so statuses are fully testable immediately
const DEMO_ORDERS: Record<string, ClientOrder> = {
  'pi-sim-pending': {
    id: 'PI-SIM-PENDING',
    trackingCode: 'PI-SIM-PENDING',
    firstName: 'Hitesh',
    lastName: 'Sharma',
    address: 'Block E-42, Sector 18, Rohini, New Delhi',
    phone: '9812345678',
    pincode: '110085',
    landmark: 'Behind Metro Pillar 322',
    notes: 'Please feed high-vitamin seed mix, requested video confirmation call.',
    items: [
      {
        parrot: {
          id: 'p1',
          name: 'Scarlet Macaw',
          species: 'Ara macao',
          price: 185000,
          category: 'macaws',
          imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&q=80&w=300',
          description: 'Vibrant companion. Hand-tamed and DNA Sexed.',
          age: '10 Months',
          healthStatus: 'Excellent, Vaccinated',
          talkativeLevel: 'High',
          available: true
        },
        quantity: 1
      }
    ],
    totalAmount: 185000,
    paymentMethod: 'upi',
    date: new Date().toISOString() // Brand new -> computed as Pending
  },
  'pi-sim-unpaid': {
    id: 'PI-SIM-UNPAID',
    trackingCode: 'PI-SIM-UNPAID',
    firstName: 'Sunil',
    lastName: 'Verma',
    address: 'Apt 205, Silver Oak Heights, HSR Layout, Bengaluru',
    phone: '9885432101',
    pincode: '560102',
    landmark: 'Opposite Shell Petrol Pump',
    notes: 'Pre-flight health checkup required, DNA certificate copy requested.',
    items: [
      {
        parrot: {
          id: 'p2',
          name: 'African Grey Parrot',
          species: 'Psittacus erithacus',
          price: 155000,
          category: 'african-grey',
          imageUrl: 'https://images.unsplash.com/photo-1522856283749-626237ba516e?auto=format&fit=crop&q=80&w=300',
          description: 'Highly intelligent speaker. Great mimicking capability.',
          age: '12 Months',
          healthStatus: 'Certified Healthy',
          talkativeLevel: 'Very High',
          available: true
        },
        quantity: 1
      }
    ],
    totalAmount: 155000,
    paymentMethod: 'upi',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago -> computed as Unpaid Hold
  },
  'pi-sim-cancelled': {
    id: 'PI-SIM-CANCELLED',
    trackingCode: 'PI-SIM-CANCELLED',
    firstName: 'Rakesh',
    lastName: 'Pandey',
    address: 'House 9A, Sector F, Aliganj, Lucknow',
    phone: '9411223344',
    pincode: '226024',
    landmark: 'Near Hanuman Temple',
    notes: 'Please pack in solid wooden air travel box.',
    items: [
      {
        parrot: {
          id: 'p3',
          name: 'Hyacinth Macaw',
          species: 'Anodorhynchus hyacinthinus',
          price: 490000,
          category: 'macaws',
          imageUrl: 'https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?auto=format&fit=crop&q=80&w=300',
          description: 'Majestic blue macaw. Rare gentle giant.',
          age: '18 Months',
          healthStatus: 'Veterinary Checked',
          talkativeLevel: 'Excellent',
          available: true
        },
        quantity: 1
      }
    ],
    totalAmount: 490000,
    paymentMethod: 'cod',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12 days ago -> computed as Cancelled
  }
};
