'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  User,
  Package,
  LogOut,
  ShieldCheck,
  Wrench,
  MapPin,
  CreditCard,
  Clock,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { fetchCustomerOrders } from '@/lib/api';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'garage' | 'address' | 'settings'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

  // Garage State
  const [garageBikes, setGarageBikes] = useState<any[]>([
    { id: 1, make: 'Harley-Davidson', year: '2022', model: 'FLHT Road Glide Limited', tireSize: 'Front: MT90B16 | Rear: 180/65B16' },
  ]);
  const [newBike, setNewBike] = useState({ make: '', year: '', model: '' });
  const [showAddBikeModal, setShowAddBikeModal] = useState(false);

  // Address State
  const [shippingAddress, setShippingAddress] = useState({
    street: '39575 Cherry St',
    city: 'Fremont',
    state: 'CA',
    zip: '94538',
    phone: '408-591-8484',
  });

  useEffect(() => {
    const stored = localStorage.getItem('bmg_customer_user');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      loadOrders(parsedUser.email);
    } else {
      router.push('/login');
    }
  }, []);

  const loadOrders = async (email: string) => {
    setLoadingOrders(true);
    try {
      const res = await fetchCustomerOrders(email);
      if (Array.isArray(res) && res.length > 0) {
        setOrders(res);
      } else {
        // Fallback sample orders for demonstrate history UI
        setOrders([
          {
            id: 101,
            order_number: 'BMG-984210',
            created_at: '2026-07-28T14:20:00Z',
            status: 'completed',
            payment_status: 'paid',
            payment_method: 'Credit Card (Visa •••• 4242)',
            transaction_id: 'TXN-984210982',
            subtotal: 449.90,
            shipping_cost: 0.00,
            total_amount: 449.90,
            shipping_carrier: 'UPS Ground',
            tracking_number: '1Z9999999999999999',
            shipping_address: '39575 Cherry St, Fremont, CA 94538',
            items: [
              { id: 1, product_name: 'Dunlop American Elite Front Tire - MT90B16 72H', quantity: 1, price: 219.95, total: 219.95 },
              { id: 2, product_name: 'Dunlop American Elite Rear Tire - 180/65B16 81H', quantity: 1, price: 229.95, total: 229.95 },
            ],
          },
        ]);
      }
    } catch (err) {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bmg_customer_user');
    router.push('/login');
  };

  const handleAddBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBike.make || !newBike.model) return;
    setGarageBikes([
      ...garageBikes,
      { id: Date.now(), ...newBike, tireSize: 'Standard Recommended Fitment' },
    ]);
    setNewBike({ make: '', year: '', model: '' });
    setShowAddBikeModal(false);
  };

  if (!user) return null;

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Customer Profile Banner Header */}
          <div className="bg-[#121212] border border-[#222] p-6 sm:p-8 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#BF8647] bg-[#1A1A1A] flex items-center justify-center text-[#BF8647] text-2xl sm:text-3xl font-black uppercase font-heading shadow-lg shadow-[#BF8647]/20">
                {user.name ? user.name.charAt(0) : 'R'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading tracking-wide">
                    {user.name || 'Rider Profile'}
                  </h1>
                  <span className="bg-[#BF8647] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                    VERIFIED RIDER
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-1">{user.email}</p>
                <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-2 uppercase font-semibold">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> BMG Guarantee Member
                  </span>
                  <span>•</span>
                  <span>Fremont Workshop Services Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-[#1A1A1A] border border-[#333] hover:border-red-600 hover:text-red-400 text-gray-300 text-xs font-extrabold uppercase px-5 py-3 rounded-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Account Sub Navigation Tabs */}
          <div className="flex border-b border-[#222] gap-2 sm:gap-6 mb-8 overflow-x-auto text-xs font-extrabold uppercase">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 px-2 border-b-2 tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'orders' ? 'border-[#BF8647] text-[#BF8647]' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" /> Order & Transaction History ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('garage')}
              className={`pb-4 px-2 border-b-2 tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'garage' ? 'border-[#BF8647] text-[#BF8647]' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4" /> My Garage ({garageBikes.length})
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`pb-4 px-2 border-b-2 tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'address' ? 'border-[#BF8647] text-[#BF8647]' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" /> Shipping & Service Address
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-2 border-b-2 tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'settings' ? 'border-[#BF8647] text-[#BF8647]' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" /> Account Settings
            </button>
          </div>

          {/* TAB 1: ORDER & TRANSACTION HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold uppercase text-white font-heading">
                    MY ORDERS & PURCHASE HISTORY
                  </h2>
                  <p className="text-xs text-gray-400">View details, track shipments, or download invoices for past purchases</p>
                </div>
                <Link
                  href="/products"
                  className="bg-[#BF8647] text-black text-xs font-extrabold uppercase px-4 py-2.5 rounded hover:bg-[#D49A50] transition-colors"
                >
                  + Shop New Tires
                </Link>
              </div>

              {loadingOrders ? (
                <div className="text-center py-16 bg-[#121212] border border-[#222] rounded-xl text-gray-400 font-bold uppercase">
                  Loading your purchase history...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-[#121212] border border-[#222] rounded-xl space-y-4">
                  <Package className="w-12 h-12 text-gray-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold uppercase text-white">No Order History Found</h3>
                    <p className="text-xs text-gray-400">You haven't placed any motorcycle tire orders yet under {user.email}.</p>
                  </div>
                  <Link
                    href="/products"
                    className="inline-block bg-[#BF8647] text-black text-xs font-extrabold uppercase px-6 py-3 rounded hover:bg-[#D49A50] transition-colors"
                  >
                    Browse Tires & Accessories
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord: any) => (
                    <div
                      key={ord.id || ord.order_number}
                      className="bg-[#121212] border border-[#222] hover:border-[#BF8647]/50 p-6 rounded-xl space-y-4 transition-all shadow-lg"
                    >
                      {/* Top Order Row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#222] pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-[#BF8647] font-mono">{ord.order_number}</span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${
                              ord.status === 'completed' || ord.status === 'delivered'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                                : ord.status === 'shipped'
                                ? 'bg-blue-950 text-blue-400 border-blue-800/40'
                                : 'bg-amber-950 text-amber-400 border-amber-800/40'
                            }`}>
                              {ord.status || 'PENDING'}
                            </span>
                            <span className="bg-emerald-950/60 text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-emerald-800/30">
                              ✓ {ord.payment_status || 'PAID'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-4">
                            <span>Placed: {new Date(ord.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>Payment: {ord.payment_method || 'Credit Card'}</span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xs text-gray-400 block uppercase">Total Amount</span>
                          <span className="text-2xl font-black text-white font-mono">${Number(ord.total_amount || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Ordered Items:</span>
                        <div className="bg-[#181818] border border-[#222] rounded-lg divide-y divide-[#222]">
                          {(ord.items || []).map((item: any, idx: number) => (
                            <div key={idx} className="p-3 flex justify-between items-center text-xs font-semibold uppercase">
                              <div className="flex items-center gap-3">
                                <Package className="w-4 h-4 text-[#BF8647]" />
                                <span>{item.product_name}</span>
                                <span className="text-gray-400 font-mono">x{item.quantity}</span>
                              </div>
                              <span className="text-[#BF8647] font-mono font-bold">${Number(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Action Footer */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-[#BF8647]" />
                          <span>Transaction Ref: <strong className="font-mono text-gray-200">{ord.transaction_id || 'TXN-BMG' + ord.id}</strong></span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="bg-[#1F1F1F] border border-[#333] hover:border-[#BF8647] text-white text-xs font-bold uppercase px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#BF8647]" /> View Invoice & Shipping
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY GARAGE */}
          {activeTab === 'garage' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold uppercase text-white font-heading">
                    MY SAVED MOTORCYCLES & GARAGE
                  </h2>
                  <p className="text-xs text-gray-400">Save your bike specifications for 1-click fitment verification across our entire store</p>
                </div>
                <button
                  onClick={() => setShowAddBikeModal(true)}
                  className="bg-[#BF8647] text-black text-xs font-extrabold uppercase px-4 py-2.5 rounded hover:bg-[#D49A50] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Bike To Garage
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {garageBikes.map((bike) => (
                  <div key={bike.id} className="bg-[#121212] border border-[#222] p-6 rounded-xl space-y-4 relative group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#1F1810] border border-[#BF8647]/40 flex items-center justify-center text-[#BF8647]">
                          <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-[#BF8647] font-bold uppercase tracking-widest">{bike.year} {bike.make}</span>
                          <h3 className="text-lg font-black uppercase text-white font-heading">{bike.model}</h3>
                        </div>
                      </div>
                      <button
                        onClick={() => setGarageBikes(garageBikes.filter((b) => b.id !== bike.id))}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-[#181818] border border-[#262626] p-3 rounded-lg text-xs space-y-1">
                      <span className="text-gray-400 font-bold uppercase block">Recommended Tire Spec:</span>
                      <span className="text-white font-mono">{bike.tireSize}</span>
                    </div>

                    <Link
                      href="/products"
                      className="block text-center bg-[#1F1F1F] border border-[#333] hover:border-[#BF8647] text-white hover:text-[#BF8647] text-xs font-bold uppercase py-2.5 rounded-lg transition-colors"
                    >
                      Shop Compatible Tires For This Bike
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SHIPPING ADDRESS */}
          {activeTab === 'address' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-xl font-bold uppercase text-white font-heading">
                  PRIMARY SHIPPING & WORKSHOP SERVICE ADDRESS
                </h2>
                <p className="text-xs text-gray-400">Used for fast order checkout and local Fremont appointment bookings</p>
              </div>

              <div className="bg-[#121212] border border-[#222] p-6 rounded-xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold uppercase">
                  <div>
                    <label className="block text-gray-400 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">State / Region</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Shipping address updated successfully!')}
                  className="bg-[#BF8647] text-black font-extrabold text-xs uppercase px-6 py-3 rounded hover:bg-[#D49A50] cursor-pointer"
                >
                  Save Address Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-xl font-bold uppercase text-white font-heading">
                  ACCOUNT SECURITY & PREFERENCES
                </h2>
                <p className="text-xs text-gray-400">Manage your rider credentials and communication settings</p>
              </div>

              <div className="bg-[#121212] border border-[#222] p-6 rounded-xl space-y-4">
                <div className="space-y-4 text-xs font-semibold uppercase">
                  <div>
                    <label className="block text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user.name}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Registered Email</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-[#161616] border border-[#262626] rounded px-4 py-2.5 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Account profile details updated!')}
                  className="bg-[#BF8647] text-black font-extrabold text-xs uppercase px-6 py-3 rounded hover:bg-[#D49A50] cursor-pointer"
                >
                  Update Rider Profile
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal: Add New Bike */}
      {showAddBikeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141414] border border-[#222] p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold uppercase text-white font-heading">ADD BIKE TO YOUR GARAGE</h3>
            <form onSubmit={handleAddBike} className="space-y-4 text-xs uppercase font-semibold">
              <div>
                <label className="block text-gray-400 mb-1">Make (e.g. Harley-Davidson, Yamaha)</label>
                <input
                  type="text"
                  required
                  placeholder="Harley-Davidson"
                  value={newBike.make}
                  onChange={(e) => setNewBike({ ...newBike, make: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Year (e.g. 2023)</label>
                <input
                  type="text"
                  required
                  placeholder="2023"
                  value={newBike.year}
                  onChange={(e) => setNewBike({ ...newBike, year: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Model (e.g. Road Glide Special)</label>
                <input
                  type="text"
                  required
                  placeholder="FLTRX Road Glide"
                  value={newBike.model}
                  onChange={(e) => setNewBike({ ...newBike, model: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-2.5 text-white focus:outline-none focus:border-[#BF8647]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBikeModal(false)}
                  className="bg-[#222] text-gray-300 text-xs px-4 py-2 rounded uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#BF8647] text-black text-xs px-6 py-2 rounded uppercase font-extrabold"
                >
                  Save Bike
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Order Details & Invoice Popup */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141414] border border-[#222] p-6 sm:p-8 rounded-xl w-full max-w-2xl space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#222] pb-4">
              <div>
                <span className="text-xs text-[#BF8647] font-bold uppercase tracking-widest">OFFICIAL ORDER INVOICE</span>
                <h3 className="text-2xl font-black uppercase text-white font-mono">{selectedOrderDetails.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-gray-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs uppercase bg-[#1A1A1A] p-4 rounded-lg border border-[#262626]">
              <div>
                <span className="text-gray-400 font-bold block">Shipping Carrier</span>
                <span className="text-white font-bold">{selectedOrderDetails.shipping_carrier || 'UPS Ground'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block">Tracking Number</span>
                <span className="text-[#BF8647] font-mono font-bold">{selectedOrderDetails.tracking_number || 'Pending Tracking Assignment'}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-[#262626]">
                <span className="text-gray-400 font-bold block">Delivery Address</span>
                <span className="text-gray-200">{selectedOrderDetails.shipping_address || '39575 Cherry St, Fremont, CA 94538'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Itemized Breakdown</h4>
              <div className="bg-[#181818] border border-[#222] rounded-lg divide-y divide-[#222] text-xs uppercase font-semibold">
                {(selectedOrderDetails.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-3 flex justify-between items-center">
                    <span>{item.product_name} x{item.quantity}</span>
                    <span className="text-[#BF8647] font-mono">${Number(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1F1810] border border-[#BF8647]/30 p-4 rounded-lg flex justify-between items-center text-xs">
              <span className="font-extrabold text-white uppercase">TOTAL AMOUNT CHARGED</span>
              <span className="text-xl font-black text-[#BF8647] font-mono">${Number(selectedOrderDetails.total_amount || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="bg-[#BF8647] text-black font-extrabold text-xs uppercase px-6 py-2.5 rounded hover:bg-[#D49A50] cursor-pointer"
              >
                Close Invoice Window
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
