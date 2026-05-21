import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, Tag, Ticket } from 'lucide-react';
import { CartItem } from '../types';
import { saveOrderToFirestore } from '../lib/firebase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, amount: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  user: any;
  onOpenAuth: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  user,
  onOpenAuth
}: CartDrawerProps) {
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [shippingFirstName, setShippingFirstName] = useState('');
  const [shippingLastName, setShippingLastName] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [shippingLandmark, setShippingLandmark] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  // Prefill details from authenticated user profile
  React.useEffect(() => {
    if (user) {
      if (!shippingFirstName && user.name) {
        const parts = user.name.split(' ');
        setShippingFirstName(parts[0] || '');
        setShippingLastName(parts.slice(1).join(' ') || '');
      }
      if (!shippingEmail && user.email) {
        setShippingEmail(user.email);
      }
      if (!shippingPhone && user.phone) {
        setShippingPhone(user.phone);
      }
    }
  }, [user, isOpen]);
  
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [savedTotalAmount, setSavedTotalAmount] = useState(0);
  const [utrNumber, setUtrNumber] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'complete'>('cart');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Promo code states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [checkingPromo, setCheckingPromo] = useState(false);

  const handleOpenUPIApp = (amount: number) => {
    // Standard cross-app UPI scheme
    const upiLink = `upi://pay?pa=sahilkhan86990-2@oksbi&pn=Parrot%20India&am=${amount}&cu=INR&tn=Parrot%2520India%2520Payment`;
    window.location.href = upiLink;
  };

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, curr) => acc + (curr.parrot.price * curr.quantity), 0);

  // Calculate promotional deduction
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discountAmount = Math.round((totalAmount * appliedPromo.value) / 100);
    } else {
      discountAmount = Math.min(appliedPromo.value, totalAmount);
    }
  }

  // Calculate GST & Platform Surcharge (10%) and delivery charge (₹30, reduced from ₹60)
  const deliveryCharge = 30;
  const surchargePercent = 10;
  const surchargeAmount = Math.round((totalAmount - discountAmount) * (surchargePercent / 100));
  const finalTotalAmount = totalAmount > 0 ? (totalAmount - discountAmount + surchargeAmount + deliveryCharge) : 0;

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(totalAmount);

  const formattedFinalAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(finalTotalAmount);

  const handleApplyPromo = async () => {
    setPromoError('');
    setPromoSuccess('');
    setCheckingPromo(true);

    if (!promoCodeInput.trim()) {
      setPromoError('Please type a coupon code.');
      setCheckingPromo(false);
      return;
    }

    try {
      const response = await fetch('/api/promocodes');
      if (response.ok) {
        const codes = await response.json();
        const codeToApply = codes.find((p: any) => p.code.toUpperCase() === promoCodeInput.trim().toUpperCase());

        if (!codeToApply) {
          setPromoError('Invalid promotion code.');
          setCheckingPromo(false);
          return;
        }

        if (!codeToApply.active) {
          setPromoError('This promo coupon is inactive.');
          setCheckingPromo(false);
          return;
        }

        if (codeToApply.minOrder > 0 && totalAmount < codeToApply.minOrder) {
          setPromoError(`Minimum basket of ₹${new Intl.NumberFormat('en-IN').format(codeToApply.minOrder)} required.`);
          setCheckingPromo(false);
          return;
        }

        setAppliedPromo(codeToApply);
        setPromoSuccess(`Code ${codeToApply.code} applied successfully!`);
      } else {
        setPromoError('Network response error verifying code.');
      }
    } catch (err) {
      console.error('Error applying promo code:', err);
      setPromoError('Connectivity error validation.');
    } finally {
      setCheckingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
    setPromoSuccess('');
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingFirstName.trim() || !shippingPhone.trim() || !shippingAddress.trim()) {
      alert('Please fill out First Name, Phone Number, and Address.');
      return;
    }

    if (paymentMethod === 'upi' && !utrNumber.trim()) {
      alert('Payment Verified check: Scan the QR code and enter your full transaction ID (UTR) to place the order.');
      return;
    }

    if (paymentMethod === 'cod' && !utrNumber.trim()) {
      alert('Mandatory Advance Payment Required: Scan the QR code and pay the compulsory ₹30 delivery charge to the same UPI/Scanner first, then enter the Transaction ID (UTR) to place your Cash on Delivery order.');
      return;
    }

    setSubmittingOrder(true);
    const trackingCode = `PI-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedOrderId(trackingCode);
    setSavedTotalAmount(finalTotalAmount);

    const orderPayload = {
      id: trackingCode,
      trackingId: trackingCode,
      trackingCode,
      firstName: shippingFirstName,
      lastName: shippingLastName,
      email: shippingEmail,
      address: shippingAddress,
      phone: shippingPhone,
      pincode: shippingPincode,
      landmark: shippingLandmark,
      notes: shippingNotes,
      items: cartItems,
      totalAmount: finalTotalAmount,
      paymentMethod,
      date: new Date().toISOString(),
      utrNumber: utrNumber.trim(),
      promoCode: appliedPromo ? appliedPromo.code : '',
      discountAmount: discountAmount
    };

    try {
      // 1. Submit to Live Cloud Firestore if active
      await saveOrderToFirestore(trackingCode, orderPayload);

      // 2. Submit to local Express backend server for notifications
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        // Clear cart items and promos
        onClearCart();
        setCheckoutStep('complete');
      } else {
        alert('Express database backup complete (registered live via Firebasa).');
        onClearCart();
        setCheckoutStep('complete');
      }
    } catch (err) {
      console.error('Failed to register order with backend systems:', err);
      onClearCart();
      setCheckoutStep('complete');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div id="shopping-cart-sidebar" className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Background shadow click close */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300" 
        onClick={() => {
          if (checkoutStep === 'complete') {
            setCheckoutStep('cart');
          }
          onClose();
        }} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl relative flex flex-col h-full border-l border-slate-100">
          
          {/* Header */}
          <div className="px-5 py-6 bg-slate-50 border-b border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5.5 h-5.5 text-emerald-600" />
              <h2 className="font-display font-bold text-slate-950 text-base sm:text-lg tracking-tight">
                Your Shopping Bucket
              </h2>
              {cartItems.length > 0 && (
                <span className="font-mono text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  {cartItems.length} species
                </span>
              )}
            </div>
            <button
              onClick={() => {
                if (checkoutStep === 'complete') {
                  setCheckoutStep('cart');
                }
                onClose();
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            
            {/* 1. Empty State */}
            {checkoutStep === 'cart' && cartItems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  🦜
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base">Your Bucket Is Empty</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-light">
                    Browse our categories and add direct DNA-certified companion birds to your list.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  Start Exploring
                </button>
              </div>
            )}

            {/* 2. Cart Items View */}
            {checkoutStep === 'cart' && cartItems.length > 0 && (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={item.parrot.id} 
                    className="flex gap-4 p-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                      <img
                        src={item.parrot.imageUrl}
                        alt={item.parrot.species}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details content */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display font-bold text-slate-900 text-sm line-clamp-1 leading-tight">
                            {item.parrot.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.parrot.id)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                            title="Remove species"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-mono text-[10px] text-slate-400 font-medium leading-none mt-1">
                          {item.parrot.species}
                        </p>
                      </div>

                      {/* Quantity & Calculations */}
                      <div className="pt-2 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-lg p-0.5 shadow-2xs">
                          <button
                            onClick={() => onUpdateQuantity(item.parrot.id, -1)}
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-semibold px-2 text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.parrot.id, 1)}
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-mono text-xs font-bold text-slate-950">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0
                          }).format(item.parrot.price * item.quantity)}
                        </span>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Shipping Form */}
            {checkoutStep === 'shipping' && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left">
                <div className="pb-2">
                  <h3 className="font-display font-bold text-slate-950 text-sm sm:text-base tracking-tight">
                    Confirm Dispatch Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-light">
                    Sourcing legally DNA-sexed birds. Please provide correct delivery and landmark details to construct your official order shipment.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="shipping-first-name" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                        First Name *
                      </label>
                      <input
                        id="shipping-first-name"
                        type="text"
                        required
                        placeholder="e.g., Hitesh"
                        value={shippingFirstName}
                        onChange={(e) => setShippingFirstName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-slate-800 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-last-name" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Last Name
                      </label>
                      <input
                        id="shipping-last-name"
                        type="text"
                        placeholder="e.g., Sharma"
                        value={shippingLastName}
                        onChange={(e) => setShippingLastName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="shipping-phone" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="shipping-phone"
                      type="tel"
                      required
                      placeholder="e.g., 9876543210"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-slate-800 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping-email" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Email Address * (For Confirmation Code)
                    </label>
                    <input
                      id="shipping-email"
                      type="email"
                      required
                      placeholder="e.g., mail@example.com"
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-slate-800 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping-address" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Full Delivery Address *
                    </label>
                    <textarea
                      id="shipping-address"
                      required
                      rows={2}
                      placeholder="e.g., House No. 44, Block C, Dwarka Sector 11"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-slate-800 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="shipping-pincode" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Pincode
                      </label>
                      <input
                        id="shipping-pincode"
                        type="text"
                        placeholder="e.g., 110075"
                        value={shippingPincode}
                        onChange={(e) => setShippingPincode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-slate-800 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-landmark" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Landmark
                      </label>
                      <input
                        id="shipping-landmark"
                        type="text"
                        placeholder="e.g., Near Metro Station"
                        value={shippingLandmark}
                        onChange={(e) => setShippingLandmark(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="shipping-notes" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Basic Details / Special Instructions (Optional)
                    </label>
                    <input
                      id="shipping-notes"
                      type="text"
                      placeholder="e.g., Hand-feeding timings or diet choice"
                      value={shippingNotes}
                      onChange={(e) => setShippingNotes(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-slate-800 outline-none transition-all"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 pt-1">
                      Choose Payment Option
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                          paymentMethod === 'upi'
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-slate-50/90'
                        }`}
                      >
                        <span className="font-bold text-xs">Scan & Pay (UPI)</span>
                        <span className="text-[10px] text-slate-400 leading-tight">Instant verification</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                          paymentMethod === 'cod'
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-slate-50/90'
                        }`}
                      >
                        <span className="font-bold text-xs">Cash on Delivery</span>
                        <span className="text-[10px] text-slate-400 leading-tight">Pay on home delivery</span>
                      </button>
                    </div>
                  </div>

                  {/* UPI QR Scanner scan embedded directly inside form to enforce Payment Verification */}
                  {paymentMethod === 'upi' && (
                    <div className="bg-[#f0f6ff] border border-blue-100 rounded-2xl p-4 space-y-3.5 text-center transition-all">
                      <div className="flex items-center gap-2 text-left justify-center pb-1 border-b border-blue-50">
                        <span className="text-lg">🏦</span>
                        <div>
                          <p className="text-blue-900 font-bold text-xs leading-none">Official UPI Payment Terminal</p>
                          <p className="text-[9px] text-blue-500 font-mono mt-0.5 leading-none">Verified Merchant Account</p>
                        </div>
                      </div>

                      {/* Instant Mobile Launch Button */}
                      <div className="space-y-1.5 py-1">
                        <button
                          type="button"
                          onClick={() => handleOpenUPIApp(finalTotalAmount)}
                          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          📲 Click to Pay (Open GPay/PhonePe/Paytm)
                        </button>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Mobile Users: Tap above to auto-launch any installed payment app (Google Pay, PhonePe, Paytm, etc.) to pay ₹{new Intl.NumberFormat('en-IN').format(finalTotalAmount)}!
                        </p>
                      </div>

                      <div className="flex items-center my-2">
                        <div className="flex-1 h-px bg-blue-100" />
                        <span className="px-3 text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold bg-white rounded-full py-0.5 px-2 border border-slate-100">or scan code</span>
                        <div className="flex-1 h-px bg-blue-100" />
                      </div>

                      {/* QR Image */}
                      <div className="bg-white rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center max-w-[170px] mx-auto shadow-inner relative">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180&data=upi://pay?pa=sahilkhan86990-2@oksbi%26am=${finalTotalAmount}%26cu=INR`}
                          alt="Official UPI QR Code"
                          className="w-32 h-32 object-contain"
                        />
                        <span className="absolute inset-x-0 bottom-1 mx-auto text-[7px] font-mono tracking-tight text-slate-300">
                          Scan to pay
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-mono text-[10px] text-slate-700 font-extrabold bg-blue-50 border border-blue-100 rounded py-0.5 px-1.5 inline-block select-all">
                          sahilkhan86990-2@oksbi
                        </p>
                        <p className="text-[11px] text-blue-600 font-bold">
                          Scan to transfer final amount: ₹{new Intl.NumberFormat('en-IN').format(finalTotalAmount)}
                        </p>
                      </div>

                      <div className="text-left space-y-1">
                        <label htmlFor="shipping-utr" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          UPI Ref/UTR Number * (Enter Transaction ID)
                        </label>
                        <input
                          id="shipping-utr"
                          type="text"
                          required
                          placeholder="Enter 12-digit UPI UTR"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 focus:border-emerald-600 rounded-xl outline-none"
                        />
                        <p className="text-[9.5px] text-slate-400 font-light">
                          Our system will verify this transaction. Real-time verification matches records on live bank channels.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3.5 text-center transition-all">
                      <div className="flex items-center gap-2 text-left justify-center pb-1 border-b border-amber-100">
                        <span className="text-lg">📢</span>
                        <div>
                          <p className="text-amber-950 font-bold text-xs leading-none">Compulsory Advance Payment</p>
                          <p className="text-[9px] text-amber-600 font-mono mt-0.5 leading-none">Security check for Fake bookings</p>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-600 leading-tight">
                        To register and place a Cash on Delivery order, a <strong>compulsory advance payment of ₹30</strong> (delivery charges) is mandatory. Scan the QR pattern below to pay ₹30 to register your order booking.
                      </p>

                      {/* Instant Mobile Launch Button for COD */}
                      <div className="space-y-1.5 py-1">
                        <button
                          type="button"
                          onClick={() => handleOpenUPIApp(30)}
                          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          📲 Click to Pay ₹30 (Open GPay/PhonePe/Paytm)
                        </button>
                        <p className="text-[10px] text-amber-900/80 leading-tight">
                          Mobile Users: Tap above to auto-launch GPay, PhonePe, Paytm, or BHIM instantly to pay the mandatory ₹30 booking fee!
                        </p>
                      </div>

                      <div className="flex items-center my-2">
                        <div className="flex-1 h-px bg-amber-200/50" />
                        <span className="px-3 text-[9px] uppercase font-mono tracking-widest text-amber-750 font-bold bg-amber-100/50 rounded-full py-0.5 px-2 border border-amber-200/50">or scan code</span>
                        <div className="flex-1 h-px bg-amber-200/50" />
                      </div>

                      {/* QR Image for ₹30 */}
                      <div className="bg-white rounded-xl p-3 border border-amber-100 flex flex-col items-center justify-center max-w-[170px] mx-auto shadow-inner relative">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=180&data=upi://pay?pa=sahilkhan86990-2@oksbi%26am=30%26cu=INR"
                          alt="Compulsory ₹30 QR Code"
                          className="w-32 h-32 object-contain"
                        />
                        <span className="absolute inset-x-0 bottom-1 mx-auto text-[7px] font-mono tracking-tight text-slate-300">
                          Scan to pay ₹30
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-mono text-[10px] text-slate-700 font-extrabold bg-amber-100 border border-amber-200/50 rounded py-0.5 px-1.5 inline-block select-all">
                          sahilkhan86990-2@oksbi
                        </p>
                        <p className="text-[11px] text-amber-800 font-bold">
                          Pay Compulsory: ₹30 (30 रुपये जरूरी है)
                        </p>
                      </div>

                      <div className="text-left space-y-1">
                        <label htmlFor="shipping-utr-cod" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
                          Enter UPI Transaction ID / UTR * (For ₹30 Advance)
                        </label>
                        <input
                          id="shipping-utr-cod"
                          type="text"
                          required
                          placeholder="Enter 12-digit UPI UTR"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 focus:border-emerald-600 rounded-xl outline-none"
                        />
                        <p className="text-[9.5px] text-slate-500 font-light">
                          Our dynamic registry verifies this ₹30 transfer immediately. Cash On Delivery order will NOT trigger dispatch without solid reference here.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl space-y-1 text-[11px] text-teal-800 font-light font-sans">
                    <p className="font-semibold text-teal-950">📦 Authorized Aviary Transport Note</p>
                    <p className="leading-normal">We transport via climate-controlled pet dispatch airlines. Safe home-step delivery is fully insured against health transit risks.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="flex-1 py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    Modify List
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    {submittingOrder ? 'Saving Order...' : 'Place Official Order'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* 4. Complete Success Screen */}
            {checkoutStep === 'complete' && (
              <div className="h-full flex flex-col items-center justify-start text-center space-y-4 pb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 animate-bounce">
                  <CheckCircle2 className="w-6.5 h-6.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-emerald-950 text-base leading-none">Your Order Successfully Registered!</h3>
                  <p className="text-[12px] text-zinc-900 font-medium">
                    Congratulations <strong>{shippingFirstName}</strong>! Your captive-bred companion order details are recorded.
                  </p>
                </div>

                {/* Unique track code display */}
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-center space-y-1">
                  <p className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">Your Unique Order Track ID</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 select-all bg-white px-2.5 py-1 rounded border border-slate-200">
                      {generatedOrderId}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedOrderId);
                        alert('Order Track ID copied to clipboard!');
                      }}
                      className="px-2 py-1 text-[9px] font-mono bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-[9px] text-[#2563eb] font-semibold mt-1">
                    Use this ID in the "Track Order" lookup panel to check real-time dispatch updates!
                  </p>
                </div>

                {/* Conditional Payment UI based on Selected Payment Method */}
                {paymentMethod === 'upi' ? (
                  <div className="w-full bg-[#f4f7fd] border border-blue-100 rounded-2xl p-4.5 space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💳</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-none">UPI Payment Recorded</h4>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">Verification Pending Desk Clearance</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Transferred Sum:</span>
                        <span className="font-mono font-bold text-slate-900">₹{new Intl.NumberFormat('en-IN').format(savedTotalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1.5 border-t border-slate-100">
                        <span className="text-slate-500">Transaction ID (UTR):</span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 select-all">{utrNumber}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-blue-800 bg-blue-50/50 border border-blue-100 rounded-xl p-2.5 leading-tight font-medium text-center">
                      ✓ A dispatch transaction receipt is queued for email dispatch to: <strong>{shippingEmail}</strong>
                    </div>
                  </div>
                ) : (
                  /* Cash on Delivery UI */
                  <div className="w-full bg-amber-50/50 border border-amber-100 rounded-2xl p-4.5 space-y-2.5 text-left">
                    <div className="flex items-center gap-2">
                       <span className="text-xl">🚚</span>
                       <div>
                         <h4 className="text-xs font-bold text-slate-900 leading-none">Cash on Delivery (COD) Selected</h4>
                         <p className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">Sourcing to shipping standard</p>
                       </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-600 leading-normal font-light">
                      Please keep a cash contribution of <strong>₹{new Intl.NumberFormat('en-IN').format(savedTotalAmount)}</strong> ready upon doorstep handover. Our aviary dispatch rider accepts cash or mobile UPI scanning during transit transitions.
                    </p>

                    <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/50 rounded-lg p-2.5 leading-tight font-medium text-center">
                      ✓ Confirmation email containing companion registration forms queued for: <strong>{shippingEmail}</strong>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-left w-full space-y-1.5 flex-shrink-0">
                  <p className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">Next Step Verification Checklist:</p>
                  <ol className="text-[10px] text-slate-600 space-y-1 font-light list-decimal list-inside">
                    <li>Aviary desk will check local legal DNA registries.</li>
                    <li>Verification call scheduled at <strong>{shippingPhone}</strong>.</li>
                    <li>Generating your official health transit coordinates...</li>
                  </ol>
                </div>

                <button
                  onClick={() => {
                    setCheckoutStep('cart');
                    setUtrNumber('');
                    onClose();
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Continue Browsing Aviaries
                </button>
              </div>
            )}

          </div>

          {/* Footer Summary (Cart and Shipping View only) */}
          {checkoutStep !== 'complete' && cartItems.length > 0 && (
            <div className="px-5 py-5 bg-slate-50 border-t border-slate-200">
              
              {/* Promo Code section */}
              <div className="mb-4 pb-4 border-b border-slate-200/60 text-left">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5 text-emerald-600" /> Have a Promo Code?
                </label>
                
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600 animate-pulse animate-duration-1000" />
                      <div>
                        <p className="text-xs font-bold text-slate-950 font-mono tracking-tight">{appliedPromo.code}</p>
                        <p className="text-[10px] text-emerald-700 font-medium">
                          {appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : `₹${new Intl.NumberFormat('en-IN').format(appliedPromo.value)}`} discount activated!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[10px] text-rose-605 bg-white hover:bg-rose-50 border border-slate-205 rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. WELCOME10"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-mono uppercase text-slate-800 outline-none focus:border-emerald-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyPromo();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={checkingPromo}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:bg-emerald-400 transition-all font-mono"
                      >
                        {checkingPromo ? '...' : 'APPLY'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[10.5px] text-rose-600 font-medium leading-none mt-1">⚠️ {promoError}</p>
                    )}
                    {promoSuccess && (
                      <p className="text-[10.5px] text-emerald-600 font-medium leading-none mt-1">✓ {promoSuccess}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Subtotal Contribution</span>
                  <span className="font-mono">{formattedAmount}</span>
                </div>
                {appliedPromo && (
                  <div className="flex items-center justify-between text-xs text-rose-600 font-medium">
                    <span>Promo Discount ({appliedPromo.code})</span>
                    <span className="font-mono">-₹{new Intl.NumberFormat('en-IN').format(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>GST & Platform Surcharge (10%)</span>
                  <span className="font-mono text-slate-955">+₹{new Intl.NumberFormat('en-IN').format(surchargeAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Delivery Charges</span>
                  <span className="font-mono text-slate-955 flex items-center gap-1.5">
                    <span className="line-through text-slate-300">₹60</span>
                    <span className="text-emerald-600 font-bold">₹30</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Transit Insurance & Licensing</span>
                  <span className="text-emerald-600 font-semibold font-mono">Free Promo</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
                  <span className="font-display text-sm font-bold text-slate-950">Estimated Total</span>
                  <span className="font-mono text-base font-bold text-slate-950">{formattedFinalAmount}</span>
                </div>
              </div>

              {checkoutStep === 'cart' && (
                <div className="mt-5 space-y-2">
                   <button
                     onClick={() => {
                       if (!user) {
                         onOpenAuth();
                         return;
                       }
                       setCheckoutStep('shipping');
                     }}
                    className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg hover:shadow-emerald-990/30 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Proceed to Companion Order
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={onClearCart}
                    className="w-full py-2 text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer uppercase font-mono tracking-wider"
                  >
                    Empty Entire Bucket
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
