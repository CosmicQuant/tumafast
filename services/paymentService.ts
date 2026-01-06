import { APP_CONFIG, simulateLatency } from '../config';

export interface MpesaResponse {
    success: boolean;
    checkoutRequestId?: string;
    message: string;
    responseCode?: string;
}

export interface PaymentStatusResponse {
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    receiptNumber?: string;
    message?: string;
}

export const paymentService = {
    /**
     * Initiates an M-PESA STK Push to the user's phone
     */
    initiateMpesaPayment: async (phoneNumber: string, amount: number, orderId: string): Promise<MpesaResponse> => {
        if (APP_CONFIG.USE_MOCK_BACKEND) {
            await simulateLatency(2000);
            return {
                success: true,
                checkoutRequestId: `ws_CO_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                message: "Success. Request accepted for processing"
            };
        } else {
            try {
                const response = await fetch(`${APP_CONFIG.API_BASE_URL}/initiateMpesaPayment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber, amount, orderId })
                });

                if (!response.ok) {
                    let errorMessage = 'Payment initiation failed';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (e) {
                        const text = await response.text();
                        errorMessage = text || errorMessage;
                    }
                    throw new Error(errorMessage);
                }
                return response.json();
            } catch (error) {
                console.error("M-PESA Error:", error);
                throw error;
            }
        }
    },

    /**
     * Checks the status of an M-PESA transaction
     */
    checkPaymentStatus: async (checkoutRequestId: string): Promise<PaymentStatusResponse> => {
        if (APP_CONFIG.USE_MOCK_BACKEND) {
            await simulateLatency(1000);
            const isComplete = Math.random() > 0.3;

            if (isComplete) {
                return {
                    status: 'COMPLETED',
                    receiptNumber: `Q${Math.random().toString(36).substring(2, 10).toUpperCase()}`
                };
            } else {
                return { status: 'PENDING' };
            }
        } else {
            try {
                const response = await fetch(`${APP_CONFIG.API_BASE_URL}/queryPaymentStatus`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ checkoutRequestId })
                });
                if (!response.ok) throw new Error('Failed to check status');
                return response.json();
            } catch (error) {
                console.error("Payment status error:", error);
                throw error;
            }
        }
    }
};
