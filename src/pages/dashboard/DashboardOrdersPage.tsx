import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Eye,
  X,
  AlertCircle,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import {
  getOrders,
  updateOrderStatus,
  createOrder,
  getProducts,
} from '../../lib/database-service';
import { DatabaseOrder, DatabaseProduct } from '../../lib/supabase';

export const DashboardOrdersPage: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const { isBangla } = useLanguage();

  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Order for View/Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState<DatabaseOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Manual Order Form Fields
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [orderQty, setOrderQty] = useState('1');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workspaceId = currentWorkspace?.id || 'default-ws';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [ordersData, prodsData] = await Promise.all([
      getOrders(workspaceId),
      getProducts(workspaceId),
    ]);
    setOrders(ordersData);
    setProducts(prodsData);
    if (prodsData.length > 0 && !selectedProductId) {
      setSelectedProductId(prodsData[0].id);
    }
    setIsLoading(false);
  }, [workspaceId, selectedProductId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (orderId: string, newStatus: DatabaseOrder['status']) => {
    const { error } = await updateOrderStatus(orderId, newStatus);
    if (error) {
      alert(error);
    } else {
      setActionSuccess(isBangla ? 'অর্ডারের স্থিতি পরিবর্তিত হয়েছে!' : 'Order status updated!');
      await loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleManualOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim() || !custAddress.trim()) {
      alert(isBangla ? 'গ্রাহকের নাম, মোবাইল ও ঠিকানা পূরণ করুন।' : 'Please fill all required fields.');
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId) || products[0];
    const qty = parseInt(orderQty, 10) || 1;
    const unitPrice = prod ? prod.price : 1000;
    const subtotal = unitPrice * qty;
    const deliveryCharge = deliveryArea === 'inside_dhaka' ? 70 : 130;
    const totalAmount = subtotal + deliveryCharge;
    const orderNum = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    setIsSubmitting(true);
    const { error } = await createOrder(
      workspaceId,
      {
        conversation_id: null,
        order_number: orderNum,
        customer_name: custName.trim(),
        customer_phone: custPhone.trim(),
        delivery_address: custAddress.trim(),
        delivery_area: deliveryArea,
        status: 'confirmed',
        subtotal,
        discount_amount: 0,
        delivery_charge: deliveryCharge,
        total_amount: totalAmount,
        payment_method: 'Cash on Delivery (COD)',
        payment_status: 'unpaid',
        notes: orderNotes.trim() || null,
      },
      [
        {
          product_id: prod ? prod.id : null,
          product_name_snapshot: prod ? prod.name : 'Custom Item',
          unit_price: unitPrice,
          quantity: qty,
          line_total: subtotal,
        },
      ]
    );

    setIsSubmitting(false);

    if (error) {
      alert(error);
    } else {
      setShowCreateModal(false);
      setCustName('');
      setCustPhone('');
      setCustAddress('');
      setOrderNotes('');
      setActionSuccess(isBangla ? 'নতুন অর্ডার সফলভাবে তৈরি হয়েছে!' : 'Order recorded successfully!');
      await loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.delivery_address.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DatabaseOrder['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80',
          labelBn: 'কনফার্মড',
          labelEn: 'Confirmed',
        };
      case 'shipped':
        return {
          bg: 'bg-blue-950/60 text-blue-300 border border-blue-800/80',
          labelBn: 'কুরিয়ারে পাঠানো',
          labelEn: 'Shipped',
        };
      case 'delivered':
        return {
          bg: 'bg-teal-950/60 text-teal-300 border border-teal-800/80',
          labelBn: 'ডেলিভার্ড',
          labelEn: 'Delivered',
        };
      case 'processing':
        return {
          bg: 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/80',
          labelBn: 'প্রসেসিং',
          labelEn: 'Processing',
        };
      case 'cancelled':
        return {
          bg: 'bg-red-950/60 text-red-300 border border-red-800/80',
          labelBn: 'বাতিল',
          labelEn: 'Cancelled',
        };
      case 'pending_confirmation':
      default:
        return {
          bg: 'bg-amber-950/60 text-amber-300 border border-amber-800/80',
          labelBn: 'অপেক্ষমাণ',
          labelEn: 'Pending',
        };
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isBangla ? 'স্বয়ংক্রিয় অর্ডার কালেকশন' : 'Captured Orders & Deliveries'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'মেসেঞ্জারে এআই কর্তৃক সংগৃহীত ও সংরক্ষিত ক্যাশ অন ডেলিভারি (COD) অর্ডারের তালিকা'
              : 'Structured cash-on-delivery orders stored in multi-tenant PostgreSQL database'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isBangla ? 'ম্যানুয়াল অর্ডার যোগ করুন' : 'Record Order'}</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBangla ? 'অর্ডার নম্বর, নাম বা মোবাইল...' : 'Search order #, customer, phone...'}
            className="w-full bg-[#131B26] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs overflow-x-auto">
          {[
            { id: 'all', labelBn: 'সকল', labelEn: 'All' },
            { id: 'pending_confirmation', labelBn: 'অপেক্ষমাণ', labelEn: 'Pending' },
            { id: 'confirmed', labelBn: 'কনফার্মড', labelEn: 'Confirmed' },
            { id: 'shipped', labelBn: 'কুরিয়ারে', labelEn: 'Shipped' },
            { id: 'delivered', labelBn: 'ডেলিভার্ড', labelEn: 'Delivered' },
            { id: 'cancelled', labelBn: 'বাতিল', labelEn: 'Cancelled' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isBangla ? st.labelBn : st.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs sm:text-sm">
            {isBangla ? 'অর্ডার লোড হচ্ছে...' : 'Loading orders from database...'}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300 font-semibold">
              {isBangla ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isBangla
                ? 'মেসেঞ্জারে গ্রাহকদের সাথে কথোপকথন সম্পন্ন হলে স্বয়ংক্রিয়ভাবে এখানে অর্ডার তৈরি হবে।'
                : 'Orders captured by BongoSell AI during customer conversations will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-[#162130]">
                  <th className="py-3 px-4">{isBangla ? 'অর্ডার নম্বর' : 'Order #'}</th>
                  <th className="py-3 px-4">{isBangla ? 'গ্রাহক ও মোবাইল' : 'Customer & Contact'}</th>
                  <th className="py-3 px-4">{isBangla ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}</th>
                  <th className="py-3 px-4">{isBangla ? 'পণ্য ও পরিমাণ' : 'Items'}</th>
                  <th className="py-3 px-4">{isBangla ? 'মোট বিল (COD)' : 'Total Amount'}</th>
                  <th className="py-3 px-4">{isBangla ? 'স্থিতি' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{isBangla ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((ord) => {
                  const statusInfo = getStatusBadge(ord.status);
                  const firstItem = ord.order_items?.[0];
                  return (
                    <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 text-xs">
                        {ord.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{ord.customer_name}</p>
                        <a
                          href={`tel:${ord.customer_phone}`}
                          className="text-[11px] text-slate-400 hover:text-emerald-400 font-mono flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          {ord.customer_phone}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-xs text-slate-300">
                        <p className="truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                          {ord.delivery_address}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {ord.delivery_area === 'inside_dhaka'
                            ? isBangla
                              ? 'ঢাকার ভেতরে (৳৭০)'
                              : 'Inside Dhaka (৳70)'
                            : isBangla
                            ? 'ঢাকার বাইরে (৳১৩০)'
                            : 'Outside Dhaka (৳130)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {firstItem ? (
                          <span>
                            {firstItem.product_name_snapshot}{' '}
                            <strong className="text-indigo-400 font-mono">x{firstItem.quantity}</strong>
                          </span>
                        ) : (
                          <span>General Product</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white font-mono">
                        ৳{Number(ord.total_amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${statusInfo.bg}`}>
                          {isBangla ? statusInfo.labelBn : statusInfo.labelEn}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-indigo-400" />
                          <span>{isBangla ? 'বিস্তারিত' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order Details & Status Changer Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[#131B26] border border-slate-700 max-w-lg w-full rounded-2xl p-6 space-y-5 text-left relative my-8 shadow-2xl text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-base">
                  {selectedOrder.order_number}
                </span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                    getStatusBadge(selectedOrder.status).bg
                  }`}
                >
                  {isBangla
                    ? getStatusBadge(selectedOrder.status).labelBn
                    : getStatusBadge(selectedOrder.status).labelEn}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Block */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isBangla ? 'গ্রাহক:' : 'Customer:'}</span>
                <span className="font-semibold text-white">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isBangla ? 'মোবাইল নম্বর:' : 'Phone Number:'}</span>
                <a
                  href={`tel:${selectedOrder.customer_phone}`}
                  className="font-mono text-emerald-400 font-semibold hover:underline"
                >
                  {selectedOrder.customer_phone}
                </a>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-400 shrink-0 mr-2">{isBangla ? 'ঠিকানা:' : 'Address:'}</span>
                <span className="text-slate-200 text-right">{selectedOrder.delivery_address}</span>
              </div>
              {selectedOrder.notes && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong>{isBangla ? 'নোট:' : 'Notes:'}</strong> {selectedOrder.notes}
                </div>
              )}
            </div>

            {/* Line Items & Total Billing */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-white">{isBangla ? 'অর্ডারকৃত আইটেম' : 'Order Line Items'}</h4>
              <div className="divide-y divide-slate-800 bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                  selectedOrder.order_items.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{item.product_name_snapshot}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          ৳{Number(item.unit_price).toLocaleString()} x {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-white">
                        ৳{Number(item.line_total).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-1 text-slate-400">Standard Product</div>
                )}

                <div className="pt-2 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{isBangla ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                    <span>৳{Number(selectedOrder.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isBangla ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}</span>
                    <span>৳{Number(selectedOrder.delivery_charge).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-emerald-400 pt-1 border-t border-slate-800">
                    <span>{isBangla ? 'ক্যাশ অন ডেলিভারি মোট:' : 'Total COD:'}</span>
                    <span>৳{Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Status Control */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">
                {isBangla ? 'অর্ডারের বর্তমান স্থিতি পরিবর্তন করুন:' : 'Update Order Status:'}
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(
                  [
                    { id: 'pending_confirmation', labelBn: 'অপেক্ষমাণ', labelEn: 'Pending' },
                    { id: 'confirmed', labelBn: 'কনফার্মড', labelEn: 'Confirm' },
                    { id: 'shipped', labelBn: 'কুরিয়ারে পাঠান', labelEn: 'Ship' },
                    { id: 'delivered', labelBn: 'ডেলিভার্ড', labelEn: 'Delivered' },
                    { id: 'cancelled', labelBn: 'বাতিল করুন', labelEn: 'Cancel' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, opt.id)}
                    className={`py-2 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      selectedOrder.status === opt.id
                        ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isBangla ? opt.labelBn : opt.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {isBangla ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order Creation Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-[#131B26] border border-slate-700 max-w-lg w-full rounded-2xl p-6 space-y-4 text-left relative my-8 shadow-2xl text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {isBangla ? 'ম্যানুয়াল ক্যাশ অন ডেলিভারি অর্ডার এন্ট্রি' : 'Record Manual COD Order'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualOrderSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'গ্রাহকের নাম' : 'Customer Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="যেমন: নুসরাত জাহান"
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'মোবাইল নম্বর' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  {isBangla ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="বাড়ি নং, রোড নং, এলাকা, থানা, জেলা..."
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'ডেলিভারি এলাকা' : 'Delivery Area'}
                  </label>
                  <select
                    value={deliveryArea}
                    onChange={(e) => setDeliveryArea(e.target.value as any)}
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="inside_dhaka">{isBangla ? 'ঢাকার ভেতরে (৳৭০)' : 'Inside Dhaka (৳70)'}</option>
                    <option value="outside_dhaka">{isBangla ? 'ঢাকার বাইরে (৳১৩০)' : 'Outside Dhaka (৳130)'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'পণ্য নির্বাচন' : 'Product'}
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (৳{Number(p.price).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'পরিমাণ (Qty)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderQty}
                    onChange={(e) => setOrderQty(e.target.value)}
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    {isBangla ? 'অতিরিক্ত নোট' : 'Notes'}
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder={isBangla ? 'যেমন: সাইজ L' : 'e.g. Size M, Red border'}
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? isBangla
                      ? 'রেকর্ড হচ্ছে...'
                      : 'Saving...'
                    : isBangla
                    ? 'অর্ডার নিশ্চিত করুন'
                    : 'Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
