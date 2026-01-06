const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });

// In a real app, these constants would be shared or defined here
const VEHICLE_RATES = {
    'Boda Boda': 50,
    'Tuk-Tuk': 100,
    'Pickup Truck': 500,
    'Cargo Van': 800,
    '3T Lorry': 1500
};

exports.calculateOrderPrice = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const { vehicleType, recommendedVehicle, estimatedBasePrice, isFragile } = req.body;

        try {
            let finalPrice = 0;

            // If we have an AI estimate, use it as the base and adjust for the selected vehicle
            if (estimatedBasePrice && recommendedVehicle) {
                const baseRate = VEHICLE_RATES[recommendedVehicle] || 50;
                const selectedRate = VEHICLE_RATES[vehicleType] || 50;

                const ratio = selectedRate / baseRate;
                finalPrice = Math.round(estimatedBasePrice * ratio);
            } else {
                // Fallback calculation
                const rate = VEHICLE_RATES[vehicleType] || 50;
                finalPrice = rate * 5; // Base distance multiplier (simplified)
            }

            // Add Fragile handling fee
            if (isFragile) {
                finalPrice += 100;
            }

            // Add Service Fee
            finalPrice += 50;

            res.status(200).json({
                price: finalPrice,
                breakdown: {
                    base: finalPrice - (isFragile ? 150 : 50),
                    fragileFee: isFragile ? 100 : 0,
                    serviceFee: 50
                }
            });
        } catch (error) {
            console.error("Pricing error", error);
            res.status(500).send("Internal Server Error");
        }
    });
});

exports.initiateMpesaPayment = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

        const { phoneNumber, amount, orderId } = req.body;
        console.log(`Initiating M-Pesa push for ${phoneNumber}, KES ${amount}, Order ${orderId}`);

        try {
            // 1. Get Access Token (Mocking the fetch to Safaricom Daraja API)
            // In a real app, you would fetch: https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials

            // 2. Perform STK Push
            // Real endpoint: https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest

            // For now, we simulate the success response from Safaricom
            const checkoutRequestId = `ws_CO_${Date.now()}`;

            res.status(200).json({
                success: true,
                checkoutRequestId: checkoutRequestId,
                message: "Success. Request accepted for processing. Please check your phone for the PIN prompt."
            });
        } catch (error) {
            console.error("M-PESA Error:", error);
            res.status(500).json({ success: false, message: "Internal Server Error during payment initiation" });
        }
    });
});

exports.queryPaymentStatus = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

        const { checkoutRequestId } = req.body;

        try {
            // Mocking the query to Safaricom API
            // After 5 seconds, let's say it's completed
            const status = Math.random() > 0.3 ? 'COMPLETED' : 'PENDING';

            res.status(200).json({
                status: status,
                receiptNumber: status === 'COMPLETED' ? `R${Math.random().toString(36).substring(7).toUpperCase()}` : null,
                message: status === 'COMPLETED' ? "Payment received successfully" : "Waiting for customer to enter PIN"
            });
        } catch (error) {
            console.error("M-PESA Status Error:", error);
            res.status(500).json({ status: 'FAILED', message: "Internal Error checking status" });
        }
    });
});
