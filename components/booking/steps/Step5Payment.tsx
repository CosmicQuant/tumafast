import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Check, ReceiptText, Shield, Truck, MapPin, ArrowLeft } from 'lucide-react';
import { useBooking } from '../BookingContext';
import { VEHICLES } from '../constants';
import mpesaLogo from '../../../assets/mpesa.png';

interface Step5Props {
    submit: () => void;
}

export const Step5Payment: React.FC<Step5Props> = ({ submit }) => {
    const { data, updateData, prevStep, setStep } = useBooking();
    const routeStops = [data.pickup, ...data.waypoints, data.dropoff].filter(Boolean);
    const weightVal = parseFloat(data.dimensions.weight) || 0;
    const eligibleVehicles = VEHICLES.filter(v => {
        if (data.distanceKm > v.maxDist) return false;
        if (!v.allowedCats.includes(data.category)) return false;
        if (data.category === 'A' && weightVal > v.maxWeight) return false;
        return true;
    });
    const activeVehicle = VEHICLES.find(v => v.id === data.vehicle) || eligibleVehicles[0];
    const liveBasePrice = activeVehicle ? activeVehicle.pricePerKm * data.distanceKm : 0;
    const fallbackPrice = Math.round(Math.max(150, data.serviceType === 'Express' ? liveBasePrice * 1.5 : liveBasePrice) / 10) * 10;
    const displayPrice = data.price || fallbackPrice;
    const packageSummary = [
        data.category === 'A' ? 'Standard parcel' : 'Bulky / heavy cargo',
        data.subCategory || 'Not selected',
        data.dimensions.weight ? `${data.dimensions.weight} kg` : null
    ].filter(Boolean).join(' • ');

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-600">Final Review</p>
                    <h3 className="text-lg font-black text-gray-900">Check the delivery before payment</h3>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Stops</div>
                    <div className="text-sm font-black text-gray-900">{routeStops.length}</div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[1.25rem] p-4 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Truck size={14} className="text-brand-400" />
                            <span className="text-sm font-bold">{data.vehicle || 'Standard'} <span className="text-slate-400 text-[10px] font-normal ml-0.5">({data.serviceType})</span></span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 block mb-1">
                            {data.price ? 'Final price' : 'Estimated price'}
                        </span>
                        <span className="text-xl font-black text-white">
                            KES {displayPrice.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-800 pt-2.5 relative z-10 text-[11px] font-semibold text-slate-300 flex-wrap">
                    <span>{data.distanceKm > 0 ? `${data.distanceKm.toFixed(1)} km` : 'Route pending'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                    <span>{data.etaTime || 'ETA pending'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                    <span>{routeStops.length} stops</span>
                </div>

                {/* Badges */}
                {(data.isReturnTrip || data.helpersCount > 0 || data.isFragile) && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 relative z-10">
                        {data.isReturnTrip && (
                            <div className="px-2 py-[2px] rounded border border-brand-500/30 bg-brand-500/10 text-brand-400 text-[9px] font-black uppercase">
                                Return Leg
                            </div>
                        )}
                        {data.helpersCount > 0 && (
                            <div className="px-2 py-[2px] rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase">
                                {data.helpersCount} Loaders
                            </div>
                        )}
                        {data.isFragile && (
                            <div className="px-2 py-[2px] rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase">
                                Fragile
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid gap-2">
                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-brand-600" />
                            <span className="text-xs font-black uppercase tracking-[0.14em] text-gray-700">Route</span>
                        </div>
                        <button onClick={() => setStep(0)} className="text-[11px] font-bold text-brand-600 hover:text-brand-700">Edit</button>
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                            <span className="font-semibold leading-snug">{data.pickup || 'Pickup not set'}</span>
                        </div>
                        {data.waypoints.map((stop, index) => (
                            <div key={`${stop}-${index}`} className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
                                <span className="leading-snug">Stop {index + 1}: {stop}</span>
                            </div>
                        ))}
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                            <span className="font-semibold leading-snug">{data.dropoff || 'Destination not set'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ReceiptText size={14} className="text-brand-600" />
                            <span className="text-xs font-black uppercase tracking-[0.14em] text-gray-700">Package</span>
                        </div>
                        <button onClick={() => setStep(1)} className="text-[11px] font-bold text-brand-600 hover:text-brand-700">Edit</button>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 leading-snug">{packageSummary}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {data.itemValue ? <div className="px-2 py-1 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">KES {data.itemValue.toLocaleString()} declared</div> : null}
                        {data.isFragile ? <div className="px-2 py-1 rounded-full bg-amber-50 text-[10px] font-bold text-amber-700 border border-amber-200">Fragile handling</div> : null}
                        {data.handlingNotes ? <div className="px-2 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-700 border border-blue-200">Special notes added</div> : null}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Truck size={14} className="text-brand-600" />
                            <span className="text-xs font-black uppercase tracking-[0.14em] text-gray-700">Delivery Mode</span>
                        </div>
                        <button onClick={() => setStep(2)} className="text-[11px] font-bold text-brand-600 hover:text-brand-700">Edit</button>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{data.serviceType} • {data.vehicle || 'Auto-assigned vehicle'}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {data.helpersCount ? <div className="px-2 py-1 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">{data.helpersCount} helper{data.helpersCount > 1 ? 's' : ''}</div> : null}
                        {data.isScheduled && data.pickupTime ? <div className="px-2 py-1 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">Scheduled: {data.pickupTime}</div> : <div className="px-2 py-1 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">Pickup now</div>}
                        {data.isReturnTrip ? <div className="px-2 py-1 rounded-full bg-brand-50 text-[10px] font-bold text-brand-700 border border-brand-200">Return trip on</div> : null}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="text-brand-600" />
                            <span className="text-xs font-black uppercase tracking-[0.14em] text-gray-700">Receiver</span>
                        </div>
                        <button onClick={() => setStep(3)} className="text-[11px] font-bold text-brand-600 hover:text-brand-700">Edit</button>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{data.receiverName || 'Receiver not set'}</div>
                    <div className="text-xs text-gray-500 mt-1">{data.receiverPhone || 'No phone'}{data.receiverId ? ` • ID ${data.receiverId}` : ''}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 pb-1 px-1">
                <button
                    onClick={() => updateData({ paymentMethod: 'M-Pesa' })}
                    className={`p-0 rounded-xl border overflow-hidden relative flex flex-col items-center justify-center transition-all min-h-[4rem] ${data.paymentMethod === 'M-Pesa' ? 'border-green-500 bg-green-50/50 ring-1 ring-green-500 scale-[1.02] shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden rounded-xl p-1">
                        <img
                            src={mpesaLogo}
                            alt="M-Pesa"
                            className={`h-10 object-contain mix-blend-multiply ${data.paymentMethod === 'M-Pesa' ? '' : 'grayscale opacity-60 hover:opacity-80'}`}
                        />
                    </div>
                </button>
                <button
                    onClick={() => updateData({ paymentMethod: 'Cash' })}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all min-h-[4rem] ${data.paymentMethod === 'Cash' ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500 scale-[1.02] shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    <Banknote size={20} className={data.paymentMethod === 'Cash' ? 'text-brand-600' : ''} />
                    <span className="font-bold text-xs">Cash on Delivery</span>
                </button>
            </div>

            <AnimatePresence mode="wait">
                {data.paymentMethod === 'M-Pesa' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 ml-1">M-Pesa Phone Number</label>
                        <input
                            type="tel"
                            className="w-full px-3.5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-500 text-sm font-bold transition-all text-gray-900"
                            value={data.paymentPhone} onChange={e => updateData({ paymentPhone: e.target.value })}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-2 pt-1 sticky bottom-0 bg-white z-10 pb-2">
                <button onClick={() => prevStep()} className="w-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200"><ArrowLeft size={16} /></button>
                <button onClick={submit} className="flex-1 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 justify-center shadow-lg shadow-brand-600/30 hover:bg-brand-500 transition-colors">
                    Confirm Booking & Pay <Check size={16} />
                </button>
            </div>
        </div>
    );
};
