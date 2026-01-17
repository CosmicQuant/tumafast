import React, { useState, useEffect } from 'react';
import { X, Upload, AlertTriangle, CheckCircle, MapPin, Calculator, FileText, Loader2, Save } from 'lucide-react';
import { VehicleType } from '../types';
import { mapService } from '../services/mapService';

interface BulkOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (orders: any[]) => Promise<void>;
    vehicleType: VehicleType;
}

interface ParsedRow {
    id: number;
    pickupLocation: string;
    dropoffLocation: string;
    itemDescription: string;
    recipientName: string;
    recipientPhone: string;
    recipientId: string;
    vehicleType: string;
    serviceType: string;
    status: 'VALID' | 'ERROR' | 'GEOCODING' | 'GEOCODED_SUCCESS' | 'GEOCODED_FAILED';
    errorMsg?: string;
    coordinates?: { lat: number; lng: number };
}

export default function BulkOrderModal({ isOpen, onClose, onSubmit, vehicleType }: BulkOrderModalProps) {
    const [step, setStep] = useState<'INPUT' | 'PREVIEW' | 'CONFIRM'>('INPUT');
    const [rawText, setRawText] = useState('');
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationStats, setValidationStats] = useState({ valid: 0, errors: 0 });

    // Mock pricing for estimation
    const BASE_PRICE = 150;
    const PRICE_PER_KM = 30; // Mock

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep('INPUT');
            setRawText('');
            setParsedRows([]);
        }
    }, [isOpen]);

    const parseText = () => {
        if (!rawText || !rawText.trim()) {
            alert("Please enter some text to process.");
            return;
        }

        console.log("Starting parsing of length:", rawText.length);
        setIsProcessing(true);

        // Allow UI to update to 'Processing' state before blocking with logic
        setTimeout(() => {
            try {
                const rows = rawText.split('\n').filter(line => line.trim().length > 0);
                if (rows.length === 0) {
                    throw new Error("No valid lines found.");
                }

                const parsed: ParsedRow[] = rows.map((line, index) => {
                    // Support CSV (comma) or Pipe (|)
                    const delimiter = line.includes('|') ? '|' : ',';
                    const parts = line.split(delimiter).map(p => p.trim());

                    // Expected Format: Pickup, Dropoff, Item, Recipient, Phone, ID, Vehicle, Service
                    const [pickup, dropoff, item, name, phone, idNo, vehicle, service] = parts;

                    let status: ParsedRow['status'] = 'VALID';
                    let error = '';

                    // Strict Validation
                    if (!pickup) { status = 'ERROR'; error += 'Missing Pickup. '; }
                    if (!dropoff) { status = 'ERROR'; error += 'Missing Dropoff. '; }
                    if (!item) { status = 'ERROR'; error += 'Missing Item Desc. '; }

                    // Basic validation for other fields without being too strict to crash

                    return {
                        id: index,
                        pickupLocation: pickup || '',
                        dropoffLocation: dropoff || '',
                        itemDescription: item || '',
                        recipientName: name || '',
                        recipientPhone: phone || '',
                        recipientId: idNo || '',
                        vehicleType: vehicle || 'Boda Boda',
                        serviceType: service || 'Standard',
                        status: status,
                        errorMsg: error
                    };
                });

                setParsedRows(parsed);

                const validCount = parsed.filter(r => r.status === 'VALID').length;
                setValidationStats({
                    valid: validCount,
                    errors: parsed.length - validCount
                });

                setStep('PREVIEW');

                // Trigger Real geocoding safely
                geocodeRows(parsed).catch(console.error);

            } catch (error: any) {
                console.error("Parsing failed", error);
                alert("Error processing text: " + error.message);
            } finally {
                setIsProcessing(false);
            }
        }, 100);
    };

    const geocodeRows = async (rows: ParsedRow[]) => {
        const processingRows = [...rows];

        // Sequential execution for safety and API limits
        for (let i = 0; i < processingRows.length; i++) {
            const row = processingRows[i];

            if (row.status === 'VALID') {
                setParsedRows(current => {
                    const updated = [...current];
                    updated[i].status = 'GEOCODING';
                    return updated;
                });

                try {
                    const result = await mapService.geocodeAddress(row.dropoffLocation);

                    setParsedRows(current => {
                        const updated = [...current];
                        if (result) {
                            updated[i].status = 'GEOCODED_SUCCESS';
                            updated[i].coordinates = { lat: result.lat, lng: result.lng };
                            // Optional: updated[i].dropoffLocation = result.formattedAddress;
                        } else {
                            updated[i].status = 'GEOCODED_FAILED';
                            updated[i].errorMsg = 'Address not found on map.';
                        }
                        return updated;
                    });
                } catch (error) {
                    console.error("Geocoding failed", error);
                    setParsedRows(current => {
                        const updated = [...current];
                        updated[i].status = 'GEOCODED_FAILED';
                        updated[i].errorMsg = 'Map service unavailable.';
                        return updated;
                    });
                }

                // Small delay to be polite to the API
                await new Promise(r => setTimeout(r, 200));
            }
        }
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        // Filter only valid orders (allow Geocoding Failed orders to pass through as unverified)
        const validOrders = parsedRows.filter(r =>
            r.status === 'GEOCODED_SUCCESS' ||
            r.status === 'VALID' ||
            r.status === 'GEOCODED_FAILED'
        );

        if (validOrders.length === 0) {
            alert("No valid orders to create.");
            setIsProcessing(false);
            return;
        }

        await onSubmit(validOrders);
        setIsProcessing(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-brand-600" />
                            Bulk Order Import
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {step === 'INPUT' ? 'Paste your delivery list below.' : 'Review and validate your orders.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">

                    {step === 'INPUT' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-700">
                                <p className="font-bold mb-1">Formatting Guide:</p>
                                <p>Paste data in <strong>CSV</strong> or <strong>Pipe-Separated</strong> format. <span className="text-red-600 font-bold">All 8 columns are required.</span></p>
                                <code className="block bg-white p-2 rounded border border-blue-100 mt-2 text-xs font-mono">
                                    Pickup, Dropoff, Item Desc, Recipient Name, Phone, ID No, Vehicle, Service
                                </code>
                                <p className="mt-2 text-xs opacity-80">Example: Westlands, CBD, Documents, John Doe, 0712345678, 12345678, Boda Boda, Express</p>
                            </div>

                            <textarea
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                placeholder={`Pickup, Dropoff, Item, Name, Phone, ID, Vehicle, Service
Example:
HQs, Westlands, Documents, Alice, 0722000000, 123456, Boda Boda, Standard`}
                                className="w-full h-80 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono text-sm leading-relaxed"
                            />
                        </div>
                    )}

                    {step === 'PREVIEW' && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                                    <div className="text-sm text-green-600 font-medium">Valid Orders</div>
                                    <div className="text-2xl font-bold text-green-800">{parsedRows.filter(r => r.status === 'GEOCODED_SUCCESS' || r.status === 'VALID').length}</div>
                                </div>
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                    <div className="text-sm text-red-600 font-medium">Errors</div>
                                    <div className="text-2xl font-bold text-red-800">{parsedRows.filter(r => r.status === 'ERROR' || r.status === 'GEOCODED_FAILED').length}</div>
                                </div>
                                <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl">
                                    <div className="text-sm text-brand-600 font-medium">Est. Total Cost</div>
                                    <div className="text-2xl font-bold text-brand-800">KES {(parsedRows.filter(r => r.status !== 'ERROR').length * BASE_PRICE).toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden max-w-full overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="p-3">#</th>
                                            <th className="p-3">Recipient</th>
                                            <th className="p-3">Route (Pick → Drop)</th>
                                            <th className="p-3">Details</th>
                                            <th className="p-3">Est. Price</th>
                                            <th className="p-3">Validation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {parsedRows.map((row) => (
                                            <tr key={row.id} className={row.status === 'ERROR' || row.status === 'GEOCODED_FAILED' ? 'bg-red-50/50' : 'hover:bg-gray-50'}>
                                                <td className="p-3 text-gray-500 font-mono">{row.id + 1}</td>
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900">{row.recipientName || '-'}</div>
                                                    <div className="text-xs text-gray-500">{row.recipientPhone} • ID: {row.recipientId || '-'}</div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-xs text-gray-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {row.pickupLocation || 'Missing'}</div>
                                                        <div className="text-xs text-gray-900 font-medium flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500" /> {row.dropoffLocation || 'Missing'}</div>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-xs text-gray-600">
                                                    <div>{row.itemDescription}</div>
                                                    <div className="opacity-75">{row.vehicleType} • {row.serviceType}</div>
                                                </td>
                                                <td className="p-3 text-sm font-bold text-gray-900">
                                                    KES {BASE_PRICE}
                                                </td>
                                                <td className="p-3">
                                                    {row.status === 'VALID' && <span className="text-yellow-600 text-xs flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Checking...</span>}
                                                    {row.status === 'GEOCODED_SUCCESS' && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ready</span>}
                                                    {(row.status === 'ERROR' || row.status === 'GEOCODED_FAILED') && (
                                                        <span className="text-red-600 text-xs font-bold flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            {row.errorMsg || 'Error'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    {step === 'INPUT' ? (
                        <button
                            onClick={parseText}
                            disabled={!rawText.trim() || isProcessing}
                            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                            Process Fulfillments
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('INPUT')}
                                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-white transition-colors"
                            >
                                Back to Edit
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={parsedRows.filter(r => r.status !== 'ERROR').length === 0 || isProcessing}
                                className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Create {parsedRows.filter(r => r.status !== 'ERROR').length} Orders
                                (KES {(parsedRows.filter(r => r.status !== 'ERROR').length * BASE_PRICE).toLocaleString()})
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
