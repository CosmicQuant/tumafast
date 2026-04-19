import React, { useState, useMemo } from 'react';
import { ArrowLeft, Truck, Bike, TrendingUp, Clock, MapPin, DollarSign, BarChart3, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Pricing tables mirrored from orderService.ts ── */
const vehicleOptions = [
    { key: 'boda', label: 'Boda Boda (Motorcycle)', icon: '🏍️', baseRate: 180, perKm: 20, perMin: 4, stopFee: 10, minFare: 150, avgSpeedKmh: 30, fuelCostPerKm: 4, wearPerKm: 2 },
    { key: 'tuktuk', label: 'Tuk-Tuk', icon: '🛺', baseRate: 300, perKm: 30, perMin: 8, stopFee: 20, minFare: 300, avgSpeedKmh: 25, fuelCostPerKm: 6, wearPerKm: 3 },
    { key: 'pickup', label: 'Pickup Truck', icon: '🚙', baseRate: 1000, perKm: 70, perMin: 15, stopFee: 100, minFare: 1000, avgSpeedKmh: 40, fuelCostPerKm: 12, wearPerKm: 5 },
    { key: 'van', label: 'Cargo Van', icon: '🚐', baseRate: 1500, perKm: 90, perMin: 20, stopFee: 150, minFare: 2000, avgSpeedKmh: 40, fuelCostPerKm: 15, wearPerKm: 7 },
    { key: 'lorry', label: 'Truck / Lorry', icon: '🚛', baseRate: 4000, perKm: 150, perMin: 30, stopFee: 500, minFare: 5000, avgSpeedKmh: 35, fuelCostPerKm: 25, wearPerKm: 12 },
    { key: 'trailer', label: 'Container Trailer', icon: '🚚', baseRate: 15000, perKm: 300, perMin: 50, stopFee: 1000, minFare: 15000, avgSpeedKmh: 30, fuelCostPerKm: 40, wearPerKm: 20 },
];

const DRIVER_SHARE = 0.80; // 80% of fare goes to driver/partner

const EarningsCalculator: React.FC = () => {
    const navigate = useNavigate();
    const [vehicleIdx, setVehicleIdx] = useState(0);
    const [tripsPerDay, setTripsPerDay] = useState(8);
    const [avgDistanceKm, setAvgDistanceKm] = useState(10);
    const [hoursPerDay, setHoursPerDay] = useState(8);
    const [daysPerWeek, setDaysPerWeek] = useState(6);

    const vehicle = vehicleOptions[vehicleIdx];

    const earnings = useMemo(() => {
        const billableKm = Math.max(0, avgDistanceKm - 2); // first 2 km in base
        const tripMinutes = (avgDistanceKm / vehicle.avgSpeedKmh) * 60;
        const farePerTrip = Math.max(
            vehicle.minFare,
            vehicle.baseRate + (billableKm * vehicle.perKm) + (tripMinutes * vehicle.perMin)
        );
        const grossPerTrip = farePerTrip;
        const driverPerTrip = Math.floor(grossPerTrip * DRIVER_SHARE);

        // Operating costs per trip
        const fuelPerTrip = avgDistanceKm * vehicle.fuelCostPerKm;
        const wearPerTrip = avgDistanceKm * vehicle.wearPerKm;
        const costPerTrip = fuelPerTrip + wearPerTrip;

        const netPerTrip = driverPerTrip - costPerTrip;
        const dailyGross = driverPerTrip * tripsPerDay;
        const dailyCost = costPerTrip * tripsPerDay;
        const dailyNet = netPerTrip * tripsPerDay;
        const weeklyNet = dailyNet * daysPerWeek;
        const monthlyNet = weeklyNet * 4.33; // avg weeks per month

        return {
            farePerTrip: Math.round(farePerTrip),
            driverPerTrip: Math.round(driverPerTrip),
            costPerTrip: Math.round(costPerTrip),
            netPerTrip: Math.round(netPerTrip),
            dailyGross: Math.round(dailyGross),
            dailyCost: Math.round(dailyCost),
            dailyNet: Math.round(dailyNet),
            weeklyNet: Math.round(weeklyNet),
            monthlyNet: Math.round(monthlyNet),
            tripMinutes: Math.round(tripMinutes),
        };
    }, [vehicleIdx, tripsPerDay, avgDistanceKm, hoursPerDay, daysPerWeek]);

    const formatKES = (n: number) => `KES ${n.toLocaleString()}`;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="bg-slate-900 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Earnings Calculator</h1>
                        <p className="text-sm text-slate-400">Estimate your potential income on the Axon network</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* Left: Controls */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Vehicle Selection */}
                        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
                            <label className="block text-sm font-bold text-slate-300 mb-3">
                                <Truck className="w-4 h-4 inline mr-2" />Vehicle Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {vehicleOptions.map((v, i) => (
                                    <button
                                        key={v.key}
                                        onClick={() => setVehicleIdx(i)}
                                        className={`p-3 rounded-xl border text-left transition-all text-sm font-medium ${i === vehicleIdx
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                                : 'border-white/10 bg-slate-800/50 text-slate-300 hover:border-white/20'
                                            }`}
                                    >
                                        <span className="text-lg mr-1">{v.icon}</span>
                                        <span className="block mt-1 text-xs leading-tight">{v.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sliders */}
                        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10 space-y-6">
                            {/* Trips per day */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-slate-300">
                                        <MapPin className="w-4 h-4 inline mr-1" /> Trips per day
                                    </label>
                                    <span className="text-emerald-400 font-black text-lg">{tripsPerDay}</span>
                                </div>
                                <input
                                    type="range" min={1} max={25} value={tripsPerDay}
                                    onChange={(e) => setTripsPerDay(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>1</span><span>25</span></div>
                            </div>

                            {/* Avg distance */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-slate-300">
                                        <TrendingUp className="w-4 h-4 inline mr-1" /> Avg trip distance (km)
                                    </label>
                                    <span className="text-emerald-400 font-black text-lg">{avgDistanceKm} km</span>
                                </div>
                                <input
                                    type="range" min={2} max={100} value={avgDistanceKm}
                                    onChange={(e) => setAvgDistanceKm(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>2 km</span><span>100 km</span></div>
                            </div>

                            {/* Hours per day */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-slate-300">
                                        <Clock className="w-4 h-4 inline mr-1" /> Hours online per day
                                    </label>
                                    <span className="text-emerald-400 font-black text-lg">{hoursPerDay}h</span>
                                </div>
                                <input
                                    type="range" min={2} max={14} value={hoursPerDay}
                                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>2h</span><span>14h</span></div>
                            </div>

                            {/* Days per week */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-slate-300">
                                        Days per week
                                    </label>
                                    <span className="text-emerald-400 font-black text-lg">{daysPerWeek}</span>
                                </div>
                                <input
                                    type="range" min={1} max={7} value={daysPerWeek}
                                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>1</span><span>7</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Hero stat */}
                        <div className="bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-slate-900 rounded-2xl p-8 border border-emerald-500/30 text-center">
                            <p className="text-sm text-emerald-300 font-bold uppercase tracking-wider mb-2">Estimated Monthly Net Earnings</p>
                            <p className="text-5xl md:text-6xl font-black text-white tracking-tight">
                                {formatKES(earnings.monthlyNet)}
                            </p>
                            <p className="text-slate-400 text-sm mt-3">After fuel &amp; vehicle wear costs &bull; {vehicle.label}</p>
                        </div>

                        {/* Per-trip breakdown */}
                        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-emerald-400" /> Per-Trip Breakdown
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Customer pays</p>
                                    <p className="text-xl font-black text-white">{formatKES(earnings.farePerTrip)}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Your share (80%)</p>
                                    <p className="text-xl font-black text-emerald-400">{formatKES(earnings.driverPerTrip)}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Fuel + wear cost</p>
                                    <p className="text-xl font-black text-red-400">-{formatKES(earnings.costPerTrip)}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Net per trip</p>
                                    <p className="text-xl font-black text-white">{formatKES(earnings.netPerTrip)}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">Avg trip time: ~{earnings.tripMinutes} min &bull; Distance: {avgDistanceKm} km</p>
                        </div>

                        {/* Daily / Weekly / Monthly */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-900 rounded-2xl p-5 border border-white/10 text-center">
                                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-bold">Daily Net</p>
                                <p className="text-2xl font-black text-white">{formatKES(earnings.dailyNet)}</p>
                                <p className="text-xs text-slate-500 mt-1">{tripsPerDay} trips</p>
                            </div>
                            <div className="bg-slate-900 rounded-2xl p-5 border border-white/10 text-center">
                                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-bold">Weekly Net</p>
                                <p className="text-2xl font-black text-white">{formatKES(earnings.weeklyNet)}</p>
                                <p className="text-xs text-slate-500 mt-1">{daysPerWeek} days/week</p>
                            </div>
                            <div className="bg-slate-900 rounded-2xl p-5 border border-emerald-500/30 text-center bg-gradient-to-b from-emerald-500/10 to-slate-900">
                                <p className="text-xs text-emerald-300 mb-1 uppercase tracking-wider font-bold">Monthly Net</p>
                                <p className="text-2xl font-black text-emerald-400">{formatKES(earnings.monthlyNet)}</p>
                                <p className="text-xs text-slate-500 mt-1">~{Math.round(daysPerWeek * 4.33)} days/month</p>
                            </div>
                        </div>

                        {/* How it's calculated */}
                        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">How We Calculate</h3>
                            <div className="space-y-3 text-sm text-slate-400">
                                <div className="flex items-start gap-3">
                                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                                    <p><strong className="text-white">Fare per trip</strong> = Base fare ({formatKES(vehicle.baseRate)}) + distance beyond 2 km × {formatKES(vehicle.perKm)}/km + estimated travel time × {formatKES(vehicle.perMin)}/min</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                                    <p><strong className="text-white">Your share</strong> = 80% of the customer fare. Axon retains 20% as a platform fee.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                                    <p><strong className="text-white">Operating costs</strong> = Fuel (KES {vehicle.fuelCostPerKm}/km) + vehicle wear (KES {vehicle.wearPerKm}/km). Actual costs vary by vehicle condition and fuel prices.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                                    <p><strong className="text-white">Net earnings</strong> = Your share minus operating costs. Tips and bonuses not included.</p>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <p className="text-xs text-slate-500 text-center leading-relaxed px-4">
                            These estimates are based on Axon's current pricing model and average operating conditions in Kenya.
                            Actual earnings depend on demand, route efficiency, vehicle condition, fuel prices, and other factors.
                            Performance bonuses and tips are not included and could increase your total income.
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EarningsCalculator;
