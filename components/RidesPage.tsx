import React from 'react';
import HistoryList from './HistoryList';
import { useNavigate } from 'react-router-dom';

const RidesPage: React.FC = () => {
    const navigate = useNavigate();

    const handleTrackOrder = (orderId: string) => {
        navigate(`/tracking/${orderId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 pt-20 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Rides</h1>
                <HistoryList onTrackOrder={handleTrackOrder} />
            </div>
        </div>
    );
};

export default RidesPage;
