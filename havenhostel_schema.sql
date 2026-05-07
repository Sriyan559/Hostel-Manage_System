-- Database: HavenHostel

-- Create FeeStructure Table
CREATE TABLE FeeStructure (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    feeType VARCHAR(100) NOT NULL, -- e.g., 'Hostel Rent', 'Mess Fee', 'Laundry'
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    applicableMonth VARCHAR(50) NOT NULL, -- e.g., 'January 2024'
    createdDate DATETIME DEFAULT GETDATE()
);

-- Create Student Table
CREATE TABLE Student (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    roomNo VARCHAR(20) NOT NULL,
    contact VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    admissionDate DATE DEFAULT GETDATE()
);

-- Create Payment Table
CREATE TABLE Payment (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    studentId BIGINT NOT NULL,
    feeStructureId BIGINT NOT NULL,
    amountPaid DECIMAL(10, 2) NOT NULL,
    paymentDate DATETIME DEFAULT GETDATE(),
    paymentMode VARCHAR(50) NOT NULL, -- e.g., 'Cash', 'Credit Card', 'UPI', 'Bank Transfer'
    receiptNo VARCHAR(100) UNIQUE NOT NULL,
    remarks VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- e.g., 'COMPLETED', 'PENDING', 'FAILED'
    CONSTRAINT FK_Payment_Student FOREIGN KEY (studentId) REFERENCES Student(id) ON DELETE CASCADE,
    CONSTRAINT FK_Payment_FeeStructure FOREIGN KEY (feeStructureId) REFERENCES FeeStructure(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IX_Payment_StudentId ON Payment(studentId);
CREATE INDEX IX_Payment_FeeStructureId ON Payment(feeStructureId);
CREATE INDEX IX_Payment_ReceiptNo ON Payment(receiptNo);
