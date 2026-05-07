import React, { useState, useEffect, useMemo } from 'react';
import { Download, Search, Filter, Eye, Printer, AlertTriangle, FileText, FileSpreadsheet, Coins, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('staySync_payments');
        if (saved) {
            setPayments(JSON.parse(saved).reverse());
        } else {
            const mockPayments = [
                { id: 1, studentName: 'Sriyan Chanuka', roomNo: 'A-101', feeType: 'Hostel Rent', amountPaid: 5000, totalAmount: 5000, remainingBalance: 0, paymentDate: new Date().toISOString(), paymentMode: 'UPI', receiptNo: 'RCP-20260101-5231', status: 'PAID' },
                { id: 2, studentName: 'Imesh Tharaka', roomNo: 'B-205', feeType: 'Mess Fee', amountPaid: 1500, totalAmount: 3500, remainingBalance: 2000, paymentDate: new Date(Date.now() - 86400000).toISOString(), paymentMode: 'Cash', receiptNo: 'RCP-20251231-1044', status: 'PARTIAL' }
            ];
            setPayments(mockPayments);
            localStorage.setItem('staySync_payments', JSON.stringify(mockPayments));
        }
    }, []);

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch = (p.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.receiptNo || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [payments, searchTerm, statusFilter]);

    const totalCollected = filteredPayments.reduce((acc, curr) => acc + curr.amountPaid, 0);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('StaySync - Payment History', 14, 15);
        doc.autoTable({
            head: [['Receipt No', 'Date', 'Student', 'Fee Type', 'Mode', 'Status', 'Amount (Rs)']],
            body: filteredPayments.map(p => [
                p.receiptNo,
                format(new Date(p.paymentDate), 'dd MMM yyyy'),
                `${p.studentName} (${p.roomNo})`,
                p.feeType,
                p.paymentMode,
                p.status,
                p.amountPaid
            ]),
            startY: 20,
        });
        doc.save('payment_history.pdf');
        toast.success('PDF Exported Successfully');
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredPayments.map(p => ({
            'Receipt No': p.receiptNo,
            'Date': format(new Date(p.paymentDate), 'dd MMM yyyy HH:mm'),
            'Student Name': p.studentName,
            'Room': p.roomNo,
            'Fee Category': p.feeType,
            'Payment Mode': p.paymentMode,
            'Status': p.status,
            'Amount Paid': p.amountPaid,
            'Balance': p.remainingBalance
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
        XLSX.writeFile(workbook, "payment_history.xlsx");
        toast.success('Excel Exported Successfully');
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            'PAID': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'PARTIAL': 'bg-amber-50 text-amber-700 border-amber-200',
            'VOID': 'bg-red-50 text-red-700 border-red-200'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${colors[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    const printReceipt = (payment) => {
        toast.success(`Printing Receipt: ${payment.receiptNo}`);
    };

    const voidPayment = (id) => {
        if (confirm('Are you sure you want to VOID this payment? This action cannot be reversed.')) {
            const updated = payments.map(p => p.id === id ? { ...p, status: 'VOID' } : p);
            setPayments(updated);
            localStorage.setItem('staySync_payments', JSON.stringify(updated.reverse()));
            setSelectedPayment(null);
            toast.success('Payment has been voided.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payment History</h1>
                    <p className="text-sm text-gray-500 mt-1">View, filter, and manage all student fee payments.</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={exportExcel} className="btn-secondary flex items-center gap-2 hover:bg-green-50 text-green-700 border-green-200">
                        <FileSpreadsheet size={16} /> Excel
                    </button>
                    <button onClick={exportPDF} className="btn-secondary flex items-center gap-2 hover:bg-red-50 text-red-700 border-red-200">
                        <FileText size={16} /> PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-5 border-l-4 border-l-primary flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Collections</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">Rs. {totalCollected.toLocaleString()}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full text-primary"><Coins size={24} /></div>
                </div>
                <div className="card p-5 border-l-4 border-l-success flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Fully Paid</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{filteredPayments.filter(p => p.status === 'PAID').length}</h3>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-full text-success"><CheckCircle size={24} /></div>
                </div>
                <div className="col-span-2 card p-5 flex items-center flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by student or receipt no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2 outline-none font-medium text-gray-700 focus:ring-2 focus:ring-primary/20">
                        <option value="ALL">All Status</option>
                        <option value="PAID">Paid fully</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="VOID">Voided</option>
                    </select>
                </div>
            </div>

            <div className="card overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Receipt Info</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Fee Category</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPayments.map(payment => (
                                <tr key={payment.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-3">
                                        <p className="font-bold text-gray-900">{payment.receiptNo}</p>
                                        <p className="text-xs text-gray-500">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
                                    </td>
                                    <td className="px-6 py-3">
                                        <p className="font-semibold text-gray-800">{payment.studentName}</p>
                                        <p className="text-xs text-gray-500">Room {payment.roomNo}</p>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                                            {payment.feeType}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">{payment.paymentMode}</p>
                                    </td>
                                    <td className="px-6 py-3">
                                        <p className="font-bold text-gray-900">Rs. {parseFloat(payment.amountPaid || 0).toLocaleString()}</p>
                                        {payment.remainingBalance > 0 && <p className="text-xs text-danger font-medium">Bal: Rs. {payment.remainingBalance}</p>}
                                    </td>
                                    <td className="px-6 py-3">
                                        <StatusBadge status={payment.status} />
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button onClick={() => setSelectedPayment(payment)} className="p-2 text-primary hover:bg-blue-100 rounded-lg transition-colors inline-block">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => printReceipt(payment)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-block ml-1">
                                            <Printer size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPayments.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-500">
                                        <AlertTriangle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                        <p>No payments found matching criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Details Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Payment Details</h2>
                                <p className="text-sm text-gray-500">{selectedPayment.receiptNo}</p>
                            </div>
                            <StatusBadge status={selectedPayment.status} />
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <p className="text-gray-500">Student Name</p>
                                    <p className="font-semibold text-gray-900">{selectedPayment.studentName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Room No.</p>
                                    <p className="font-semibold text-gray-900">{selectedPayment.roomNo}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Fee Category</p>
                                    <p className="font-semibold text-gray-900">{selectedPayment.feeType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Payment Date</p>
                                    <p className="font-semibold text-gray-900">{selectedPayment.paymentDate ? format(new Date(selectedPayment.paymentDate), 'dd MMM yyyy, HH:mm') : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Payment Mode</p>
                                    <p className="font-semibold text-gray-900">{selectedPayment.paymentMode}</p>
                                </div>
                                <div className="col-span-2 border-t pt-3 mt-1">
                                    <div className="flex justify-between font-medium">
                                        <span className="text-gray-600">Total Fee Amount:</span>
                                        <span>Rs. {selectedPayment.totalAmount?.toLocaleString() || selectedPayment.amountPaid}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg mt-1 text-primary">
                                        <span>Amount Paid:</span>
                                        <span>Rs. {(selectedPayment.amountPaid || 0).toLocaleString()}</span>
                                    </div>
                                    {selectedPayment.remainingBalance > 0 && (
                                        <div className="flex justify-between font-bold text-danger mt-1">
                                            <span>Remaining Balance:</span>
                                            <span>Rs. {selectedPayment.remainingBalance.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                {selectedPayment.remarks && (
                                    <div className="col-span-2 bg-gray-50 p-3 rounded-lg mt-2">
                                        <p className="text-xs text-gray-500 font-semibold mb-1">Remarks / Reference</p>
                                        <p className="text-sm text-gray-800">{selectedPayment.remarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-between gap-3">
                            {selectedPayment.status !== 'VOID' ? (
                                <button onClick={() => voidPayment(selectedPayment.id)} className="text-danger text-sm font-semibold hover:underline px-2">Cancel/Void Payment</button>
                            ) : <div></div>}
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedPayment(null)} className="btn-secondary px-6">Close</button>
                                <button onClick={() => printReceipt(selectedPayment)} className="btn-primary flex items-center gap-2"><Printer size={16} /> Print</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
