<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
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
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 8px;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
            margin: 20px 0;
        }
        .details {
            margin: 20px 0;
            padding: 20px;
            background: white;
            border-radius: 6px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            @if($business->logo_url)
                <img src="{{ $business->logo_url }}" alt="{{ $business->business_name }}" class="logo">
            @endif
            <h1>Payment Received</h1>
        </div>

        <div class="content">
            <p>Dear {{ $customer->name }},</p>

            <p>We have received a payment for Invoice #{{ $invoice->invoice_number }}.</p>

            <div class="amount">
                {{ number_format($payment->amount, 2) }} {{ config('app.currency', 'USD') }}
            </div>

            <div class="details">
                <p><strong>Payment Details:</strong></p>
                <p>Date: {{ \Carbon\Carbon::parse($payment->date)->format('F j, Y') }}</p>
                @if($payment->notes)
                    <p>Notes: {{ $payment->notes }}</p>
                @endif
                <p>Remaining Balance: {{ number_format($invoice->amount - $invoice->paid_amount, 2) }} {{ config('app.currency', 'USD') }}</p>
            </div>

            <p>
                @if($invoice->status === 'paid')
                    Your invoice has been fully paid. Thank you for your business!
                @else
                    Your payment has been recorded. The remaining balance will be due by {{ \Carbon\Carbon::parse($invoice->due_date)->format('F j, Y') }}.
                @endif
            </p>

            <p>From: {{ $business->business_name }}</p>
        </div>

        <div class="footer">
            <p>If you have any questions, please contact us at {{ $business->email }}</p>
            <p>{{ $business->address }}</p>
        </div>
    </div>
</body>
</html> 