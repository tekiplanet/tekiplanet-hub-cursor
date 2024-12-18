<!DOCTYPE html>
<html>
<head>
    <style>
        .receipt-container { padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .details { margin-bottom: 20px; }
        .amount { font-size: 24px; color: #000; }
        .status { color: #16a34a; }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1>Payment Receipt</h1>
            <p>Receipt #: {{ $receipt_number }}</p>
        </div>

        <div class="details">
            <h3>Payment Details</h3>
            <p>Invoice Number: {{ $invoice->invoice_number }}</p>
            <p>Payment Date: {{ $invoice->paid_at->format('M d, Y H:i:s') }}</p>
            <p>Payment Method: {{ ucfirst($invoice->payment_method) }}</p>
            <p>Transaction Reference: {{ $transaction->reference_number }}</p>
        </div>

        <div class="details">
            <h3>Project Details</h3>
            <p>Project: {{ $invoice->project->name }}</p>
            <p>Client: {{ $invoice->project->businessProfile->business_name }}</p>
        </div>

        <div class="amount">
            <h3>Amount Paid</h3>
            <p>₦{{ number_format($invoice->amount, 2) }}</p>
        </div>

        <div class="status">
            <h3>Payment Status</h3>
            <p>PAID</p>
        </div>
    </div>
</body>
</html> 