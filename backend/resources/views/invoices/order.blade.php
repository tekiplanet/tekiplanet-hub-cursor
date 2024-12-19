<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .invoice-details {
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
        }
        .totals {
            float: right;
            width: 300px;
        }
        .total-row {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <p>Invoice #: {{ $invoice_number }}</p>
        <p>Date: {{ $date }}</p>
    </div>

    <div class="invoice-details">
        <div style="float: left">
            <strong>Bill To:</strong><br>
            {{ $order->shippingAddress->first_name }} {{ $order->shippingAddress->last_name }}<br>
            {{ $order->shippingAddress->address }}<br>
            {{ $order->shippingAddress->city }}, {{ $order->shippingAddress->state->name }}<br>
            Phone: {{ $order->shippingAddress->phone }}
        </div>
        <div style="float: right">
            <strong>Shipping Method:</strong><br>
            {{ $order->shippingMethod->name }}<br>
            {{ $order->shippingMethod->description }}
        </div>
        <div style="clear: both"></div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>{{ $item->quantity }}</td>
                <td>{{ $currency }}{{ $formatter($item->price) }}</td>
                <td>{{ $currency }}{{ $formatter($item->price * $item->quantity) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td>{{ $currency }}{{ $formatter($order->subtotal) }}</td>
            </tr>
            <tr>
                <td>Shipping:</td>
                <td>{{ $currency }}{{ $formatter($order->shipping_cost) }}</td>
            </tr>
            <tr class="total-row">
                <td>Total:</td>
                <td>{{ $currency }}{{ $formatter($order->total) }}</td>
            </tr>
        </table>
    </div>
</body>
</html> 