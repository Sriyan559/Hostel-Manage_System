import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import FeeStructure from './pages/FeeStructure';
import RecordPayment from './pages/RecordPayment';
import PaymentHistory from './pages/PaymentHistory';

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/payments/history" replace />} />
                    <Route path="fee-structures" element={<FeeStructure />} />
                    <Route path="payments/record" element={<RecordPayment />} />
                    <Route path="payments/history" element={<PaymentHistory />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
