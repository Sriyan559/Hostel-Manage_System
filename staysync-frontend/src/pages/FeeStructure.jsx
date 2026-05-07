import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Building, Search, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_DATA = [
    { id: 1, feeType: 'Hostel Rent', amount: 5000, description: 'Monthly rent for double sharing', frequency: 'Monthly', applicableMonth: 'January', isActive: true, createdDate: '2026-01-01' },
    { id: 2, feeType: 'Mess Fee', amount: 3500, description: '3 meals per day', frequency: 'Monthly', applicableMonth: 'January', isActive: true, createdDate: '2026-01-01' },
    { id: 3, feeType: 'Security Deposit', amount: 15000, description: 'Refundable deposit', frequency: 'One-time', applicableMonth: 'Joining', isActive: true, createdDate: '2026-01-01' }
];

const FeeStructure = () => {
    const [fees, setFees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Faking API Load
        const saved = localStorage.getItem('staySync_fees');
        if (saved) {
            setFees(JSON.parse(saved));
        } else {
            setFees(MOCK_DATA);
            localStorage.setItem('staySync_fees', JSON.stringify(MOCK_DATA));
        }
    }, []);

    const saveFees = (newFees) => {
        setFees(newFees);
        localStorage.setItem('staySync_fees', JSON.stringify(newFees));
    };

    const [formData, setFormData] = useState({
        feeType: '', amount: '', description: '', frequency: 'Monthly', applicableMonth: '', isActive: true
    });

    const handleOpenModal = (fee = null) => {
        if (fee) {
            setEditingFee(fee);
            setFormData(fee);
        } else {
            setEditingFee(null);
            setFormData({ feeType: '', amount: '', description: '', frequency: 'Monthly', applicableMonth: '', isActive: true });
        }
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingFee) {
            const updated = fees.map(f => f.id === editingFee.id ? { ...formData, id: f.id } : f);
            saveFees(updated);
            toast.success('Fee structure updated successfully');
        } else {
            const newFee = { ...formData, id: Date.now(), createdDate: new Date().toISOString().split('T')[0] };
            saveFees([...fees, newFee]);
            toast.success('Fee structure added successfully');
        }
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this fee structure?')) {
            saveFees(fees.filter(f => f.id !== id));
            toast.success('Deleted successfully');
        }
    };

    const toggleStatus = (id) => {
        const updated = fees.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f);
        saveFees(updated);
        toast.success('Status toggled');
    };

    const filteredFees = fees.filter(f => f.feeType.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Fee Structures</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and configure all applicable hostel and mess fees.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Fee Structure
                </button>
            </div>

            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search fee structures..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Fee Type</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Frequency</th>
                                <th className="px-6 py-4">Month/Role</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFees.map(fee => (
                                <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{fee.feeType}</span>
                                            <span className="text-xs text-gray-500 truncate max-w-[200px]">{fee.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">Rs. {parseFloat(fee.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${fee.frequency === 'Monthly' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                            {fee.frequency}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{fee.applicableMonth}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleStatus(fee.id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${fee.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                }`}
                                        >
                                            {fee.isActive ? <Check size={14} /> : <X size={14} />}
                                            {fee.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(fee)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(fee.id)} className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredFees.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <Building className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-base font-medium text-gray-900">No fee structures found</p>
                                        <p className="text-sm">Get started by creating a new fee structure.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">{editingFee ? 'Edit ' : 'New '} Fee Structure</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                                <input required type="text" value={formData.feeType} onChange={e => setFormData({ ...formData, feeType: e.target.value })} className="input-field" placeholder="e.g. Hostel Rent" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
                                    <input required type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="input-field" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                                    <select value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} className="input-field bg-white">
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Semesterly">Semesterly</option>
                                        <option value="Annual">Annual</option>
                                        <option value="One-time">One-time</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Month/Event</label>
                                <input required type="text" value={formData.applicableMonth} onChange={e => setFormData({ ...formData, applicableMonth: e.target.value })} className="input-field" placeholder="e.g. January 2026, At Joining" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-field resize-none h-20" placeholder="Brief description of the fee..." />
                            </div>

                            <div className="pt-4 flex gap-3 justify-end border-t mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">{editingFee ? 'Save Changes' : 'Create Fee'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeStructure;
