import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { mapService } from '../services/mapService';
import { VehicleType, ServiceType } from '../types';

const DebugSimulation: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILURE'>('IDLE');

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const runSimulation = async () => {
        setStatus('RUNNING');
        setLogs([]);
        addLog("🚀 Starting End-to-End Simulation...");

        try {
            // 1. Geocoding
            addLog("📍 Step 1: Testing Map Service (Geocoding)...");
            const coords = await mapService.geocodeAddress("Westlands, Nairobi");
            if (!coords) throw new Error("Geocoding failed");
            addLog(`✅ Geocoding Success: Westlands is at ${coords.lat}, ${coords.lng}`);

            // 2. Pricing
            addLog("💰 Step 2: Testing Pricing Logic...");
            const quote = await orderService.calculatePrice({
                vehicleType: VehicleType.BODA,
                estimatedBasePrice: 300,
                isFragile: true
            });
            if (quote <= 0) throw new Error("Invalid price calculated");
            addLog(`✅ Pricing Success: Quote received for KES ${quote}`);

            // 3. Payment
            addLog("💳 Step 3: Testing M-PESA Payment...");
            const payment = await paymentService.initiateMpesaPayment("0712345678", quote, "TEST-ORDER-1");
            if (!payment.success) throw new Error("Payment initiation failed");
            addLog(`✅ Payment Initiated: Request ID ${payment.checkoutRequestId}`);

            addLog("⏳ Waiting for Payment Confirmation...");
            const payStatus = await paymentService.checkPaymentStatus(payment.checkoutRequestId!);
            addLog(`✅ Payment Status: ${payStatus.status}`);

            // 4. Order Creation
            addLog("📦 Step 4: Creating Order...");
            const newOrder = await orderService.createOrder({
                pickup: "Westlands",
                dropoff: "CBD",
                vehicle: VehicleType.BODA,
                items: { description: "Test Package", weightKg: 1, fragile: true, value: 1000 },
                price: quote, // quote is now a number from calculatePrice
                status: 'pending',
                estimatedDuration: "20 mins",
                date: new Date().toISOString(),
                sender: { name: "Test User", phone: "0712345678" },
                recipient: { name: "Test Receiver", phone: "0722000000" },
                paymentMethod: 'MPESA',
                serviceType: ServiceType.EXPRESS
            });
            addLog(`✅ Order Created: ${newOrder.id} [${newOrder.status}]`);

            // 5. Driver Dispatch
            addLog("🚚 Step 5: Driver Marketplace...");
            const marketOrders = await orderService.getMarketplaceOrders();
            const foundOrder = marketOrders.find(o => o.id === newOrder.id);
            if (!foundOrder) throw new Error("Order not found in marketplace");
            addLog(`✅ Order visible in Marketplace`);

            // 6. Driver Acceptance
            addLog("🤝 Step 6: Driver Accepting Order...");
            await orderService.updateOrderStatus(newOrder.id, 'driver_assigned', {
                driver: {
                    name: "Simulated Driver",
                    phone: "0700000000",
                    plate: "KAA 123A",
                    rating: 5.0
                }
            });
            addLog(`✅ Order Accepted. Status: driver_assigned`);

            // 7. Delivery Flow
            addLog("🏁 Step 7: Completing Delivery...");
            await orderService.updateOrderStatus(newOrder.id, 'delivered');
            addLog(`✅ Order Delivered!`);

            setStatus('SUCCESS');
            addLog("🎉 SIMULATION COMPLETE: All systems operational.");

        } catch (error: any) {
            console.error(error);
            addLog(`❌ ERROR: ${error.message}`);
            setStatus('FAILURE');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">System Diagnostics</h1>
            <button
                onClick={runSimulation}
                disabled={status === 'RUNNING'}
                className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold mb-6 disabled:opacity-50"
            >
                {status === 'RUNNING' ? 'Running Tests...' : 'Run System Check'}
            </button>

            <div className="bg-black text-green-400 p-4 rounded-xl font-mono text-sm min-h-[400px] overflow-y-auto">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1">{log}</div>
                ))}
                {logs.length === 0 && <span className="text-gray-500">Ready to start...</span>}
            </div>
        </div>
    );
};

export default DebugSimulation;
