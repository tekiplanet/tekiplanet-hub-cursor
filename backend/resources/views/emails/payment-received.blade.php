<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: {{ $invoice->theme_color ?? '#2563eb' }};
            color: white;
            padding: 32px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 32px;
        }
        .amount-box {
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
        }
        .amount {
            font-size: 32px;
            font-weight: 700;
            color: {{ $invoice->theme_color ?? '#2563eb' }};
            margin: 8px 0;
        }
        .details {
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 24px;
            margin: 24px 0;
        }
        .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
        .details-item {
            padding: 8px 0;
        }
        .label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        .value {
            font-weight: 600;
            color: #374151;
        }
        .status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 500;
            background-color: {{ $invoice->status === 'paid' ? '#dcfce7' : '#fee2e2' }};
            color: {{ $invoice->status === 'paid' ? '#166534' : '#991b1b' }};
        }
        .business-info {
            border-top: 1px solid #e5e7eb;
            margin-top: 32px;
            padding-top: 24px;
            text-align: center;
            color: #6b7280;
        }
        .footer {
            text-align: center;
            padding: 24px;
            background-color: #f8fafc;
            font-size: 14px;
            color: #6b7280;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .details-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Receipt</h1>
        </div>
        
        <div class="content">
            <p>Dear {{ $customer->name }},</p>
            
            <p>Thank you for your payment on Invoice #{{ $invoice->invoice_number }}.</p>
            
            <div class="amount-box">
                <div class="label">Amount Paid</div>
                <div class="amount">{{ $invoice->currency }} {{ number_format($payment->amount, 2) }}</div>
                <div class="status">
                    {{ $invoice->status === 'paid' ? 'Fully Paid' : 'Partially Paid' }}
                </div>
            </div>
            
            <div class="details">
                <div class="details-grid">
                    <div class="details-item">
                        <div class="label">Payment Date</div>
                        <div class="value">{{ $payment->payment_date->format('M d, Y') }}</div>
                    </div>
                    <div class="details-item">
                        <div class="label">Invoice Total</div>
                        <div class="value">{{ $invoice->currency }} {{ number_format($invoice->amount, 2) }}</div>
                    </div>
                    <div class="details-item">
                        <div class="label">Paid Amount</div>
                        <div class="value">{{ $invoice->currency }} {{ number_format($invoice->paid_amount, 2) }}</div>
                    </div>
                    <div class="details-item">
                        <div class="label">Remaining Balance</div>
                        <div class="value">{{ $invoice->currency }} {{ number_format($invoice->amount - $invoice->paid_amount, 2) }}</div>
                    </div>
                </div>
            </div>

            @if($payment->notes)
            <div class="details">
                <div class="label">Payment Notes</div>
                <div class="value">{{ $payment->notes }}</div>
            </div>
            @endif
            
            <div class="business-info">
                <strong>{{ $business->business_name }}</strong><br>
                {{ $business->email }}<br>
                {{ $business->phone }}<br>
                @if($business->address)
                {{ $business->address }}
                @endif
            </div>
        </div>
        
        <div class="footer">
            <p>If you have any questions about this receipt, please contact us.</p>
        </div>
    </div>
</body>
</html> 