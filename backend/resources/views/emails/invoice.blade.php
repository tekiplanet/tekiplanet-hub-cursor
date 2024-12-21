<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .business-name {
            font-size: 24px;
            color: {{ $invoice->theme_color ?? '#0000FF' }};
            margin-bottom: 10px;
        }
        .invoice-details {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: {{ $invoice->theme_color ?? '#0000FF' }};
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: {{ $invoice->theme_color ?? '#0000FF' }};
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="business-name">{{ $invoice->business->business_name }}</div>
            <h2>Invoice #{{ $invoice->invoice_number }}</h2>
        </div>

        <p>Dear {{ $invoice->customer->name }},</p>

        <p>Please find attached the invoice from {{ $invoice->business->business_name }}.</p>

        <div class="invoice-details">
            <p><strong>Invoice Number:</strong> #{{ $invoice->invoice_number }}</p>
            <p><strong>Due Date:</strong> {{ $invoice->due_date->format('M d, Y') }}</p>
            <p><strong>Amount:</strong> <span class="amount">{{ $invoice->currency ?? 'USD' }} {{ number_format($invoice->amount, 2) }}</span></p>
        </div>

        @if($invoice->notes)
            <div class="notes">
                <p><strong>Notes:</strong></p>
                <p>{{ $invoice->notes }}</p>
            </div>
        @endif

        <p>For any questions or concerns, please contact us:</p>
        <ul>
            <li>Email: {{ $invoice->business->email }}</li>
            <li>Phone: {{ $invoice->business->phone }}</li>
        </ul>

        <div class="footer">
            <p>This is an automated email from {{ $invoice->business->business_name }}</p>
        </div>
    </div>
</body>
</html> 