import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Printer, Send, Search, CheckCircle, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_STUDENTS = [
    { id: 101, name: 'Sriyan Chanuka', roomNo: 'A-101', contact: '+91 9876543210' },
    { id: 102, name: 'Imesh Tharaka', roomNo: 'B-205', contact: '+91 9876543211' },
    { id: 103, name: 'Thasuri Sehansa', roomNo: 'C-302', contact: '+91 9876543212' }
];

const MOCK_FEES = [
    { id: 1, feeType: 'Hostel Rent', amount: 5000 },
    { id: 2, feeType: 'Mess Fee', amount: 3500 },
    { id: 3, feeType: 'Security Deposit', amount: 15000 }
];

const RecordPayment = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [fees, setFees] = useState(MOCK_FEES);

    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedFee, setSelectedFee] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [remarks, setRemarks] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const savedFees = localStorage.getItem('staySync_fees');
        if (savedFees) setFees(JSON.parse(savedFees).filter(f => f.isActive));
    }, []);

    const feeDetails = useMemo(() => {
        return fees.find(f => f.id === Number(selectedFee));
    }, [selectedFee, fees]);

    useEffect(() => {
        if (feeDetails) setAmountPaid(feeDetails.amount);
    }, [feeDetails]);

    const generateReceiptNo = () => {
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `RCP-${dateStr}-${randomNum}`;
    };

    const remainingBalance = feeDetails ? feeDetails.amount - Number(amountPaid) : 0;
    const status = remainingBalance <= 0 ? (remainingBalance < 0 ? 'OVERPAID' : 'PAID') : 'PARTIAL';

    const handleProcessPayment = (e) => {
        e.preventDefault();
        if (!selectedStudent || !selectedFee || !amountPaid) {
            toast.error('Please fill required fields');
            return;
        }

        const studentDetails = students.find(s => s.id === Number(selectedStudent));
        const newPayment = {
            id: Date.now(),
            studentId: studentDetails.id,
            studentName: studentDetails.name,
            roomNo: studentDetails.roomNo,
            feeStructureId: feeDetails.id,
            feeType: feeDetails.feeType,
            totalAmount: feeDetails.amount,
            amountPaid: Number(amountPaid),
            remainingBalance: remainingBalance,
            paymentDate: new Date().toISOString(),
            paymentMode,
            receiptNo: generateReceiptNo(),
            remarks,
            status: status
        };

        const existingPaymentsStr = localStorage.getItem('staySync_payments');
        const existingPayments = existingPaymentsStr ? JSON.parse(existingPaymentsStr) : [];

        existingPayments.push(newPayment);
        localStorage.setItem('staySync_payments', JSON.stringify(existingPayments));

        toast.success('Payment recorded successfully! Receipt generated.', { duration: 4000 });
        navigate('/payments/history');
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.roomNo.toLowerCase().includes(studentSearch.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                    <Receipt size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Record Fee Payment</h1>
                    <p className="text-sm text-gray-500 mt-1">Process a new payment request and generate receipt.</p>
                </div>
            </div>

            <div className="card grid grid-cols-1 md:grid-cols-3 gap-8 p-8 relative">
                <form onSubmit={handleProcessPayment} className="col-span-2 space-y-6">

                    <div className="space-y-1 relative">
                        <label className="block text-sm font-medium text-gray-700">Student Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={studentSearch}
                                onFocus={() => setShowDropdown(true)}
                                onChange={e => {
                                    setStudentSearch(e.target.value);
                                    setShowDropdown(true);
                                    if (!e.target.value) setSelectedStudent('');
                                }}
                                placeholder="Search by name or room..."
                                className="input-field pl-10 bg-white"
                            />
                        </div>
                        {showDropdown && filteredStudents.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                                {filteredStudents.map(student => (
                                    <li
                                        key={student.id}
                                        onClick={() => {
                                            setSelectedStudent(student.id);
                                            setStudentSearch(`${student.name} (${student.roomNo})`);
                                            setShowDropdown(false);
                                        }}
                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between group transition-colors"
                                    >
                                        <span className="font-medium text-gray-800">{student.name}</span>
                                        <span className="text-xs font-semibold text-gray-400 group-hover:text-primary bg-gray-100 px-2 py-0.5 rounded-md">Room {student.roomNo}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Fee Structure</label>
                            <select required value={selectedFee} onChange={(e) => setSelectedFee(e.target.value)} className="input-field bg-white">
                                <option value="" disabled>Select Fee Structure...</option>
                                {fees.map(f => (
                                    <option key={f.id} value={f.id}>{f.feeType} - Rs. {f.amount}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                            <select required value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="input-field bg-white">
                                <option value="Cash">Cash</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Debit Card">Debit Card</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Amount Paid (Rs.)</label>
                        <div className="relative">
                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                required
                                type="number"
                                min="1"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                className="input-field pl-10 text-lg font-bold text-gray-900 focus:ring-primary focus:border-primary"
                                placeholder="0.00"
                            />
                        </div>
                        {feeDetails && (
                            <div className="flex justify-between items-center text-xs mt-2 px-1">
                                <span className="text-gray-500 font-medium">Total: <span className="text-gray-900">Rs. {feeDetails.amount.toLocaleString()}</span></span>
                                <span className={`font-semibold ${remainingBalance <= 0 ? 'text-success' : 'text-danger'}`}>
                                    Balance: Rs. {remainingBalance > 0 ? remainingBalance.toLocaleString() : '0.00'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Remarks / Reference No. (Optional)</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="input-field resize-none h-20"
                            placeholder="Cheque number, transaction ID, or notes..."
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-4">
                        <button type="button" onClick={() => {
                            setStudentSearch('');
                            setSelectedStudent('');
                            setSelectedFee('');
                            setAmountPaid('');
                            setRemarks('');
                        }} className="btn-secondary px-8">Clear Form</button>
                        <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2 text-lg shadow-primary/30">
                            <CheckCircle size={20} /> Complete Payment
                        </button>
                    </div>
                </form>

                {/* Status Panel */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit space-y-6 sticky top-6">
                    <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4">Payment Summary</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-gray-200 pb-3">
                            <p className="text-gray-500 text-sm">Target Status</p>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${status === 'PAID' ? 'bg-success/10 text-success' :
                                status === 'PARTIAL' ? 'bg-warning/10 text-warning' :
                                    'bg-blue-100 text-blue-700'
                                }`}>{status}</span>
                        </div>

                        <div className="flex justify-between items-end pb-3">
                            <p className="text-gray-500 text-sm">Amount</p>
                            <p className="text-xl font-bold text-gray-900 tracking-tight">
                                Rs. {amountPaid ? Number(amountPaid).toLocaleString() : '0'}
                            </p>
                        </div>

                        {selectedStudent && (
                            <div className="bg-white p-3 rounded-lg border border-gray-100 text-sm mt-4">
                                <p className="font-semibold text-gray-800">{students.find(s => s.id === Number(selectedStudent))?.name}</p>
                                <p className="text-gray-500">Room: {students.find(s => s.id === Number(selectedStudent))?.roomNo}</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 mt-6 flex gap-2 w-full text-gray-400">
                        <Printer size={16} title="Will Auto-Print" className="cursor-not-allowed" />
                        <Send size={16} title="Will Email Receipt" className="cursor-not-allowed" />
                        <span className="text-xs ml-auto font-medium">Auto-receipt ON</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordPayment;
