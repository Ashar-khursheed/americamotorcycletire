<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string',
            'shipping_address' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string',
        ]);

        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }

        $shippingCost = $subtotal > 99 ? 0.00 : 15.00;
        $transactionId = 'TXN-' . strtoupper(Str::random(10));

        $order = Order::create([
            'order_number' => 'BMG-' . strtoupper(Str::random(8)),
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'] ?? null,
            'shipping_address' => $validated['shipping_address'],
            'subtotal' => $subtotal,
            'shipping_cost' => $shippingCost,
            'total_amount' => $subtotal + $shippingCost,
            'status' => 'pending',
            'payment_status' => 'paid',
            'payment_method' => $validated['payment_method'] ?? 'card',
            'transaction_id' => $transactionId,
        ]);

        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'product_name' => $item['product_name'],
                'price' => $item['price'],
                'quantity' => $item['quantity'],
                'total' => $item['price'] * $item['quantity'],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Order placed successfully!',
            'data' => $order->load('items'),
        ], 201);
    }

    public function index(Request $request)
    {
        $query = Order::with('items')->orderBy('id', 'desc');
        if ($request->has('email')) {
            $query->where('customer_email', $request->email);
        }
        $orders = $query->paginate(50);
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with('items')->where('id', $id)->orWhere('order_number', $id)->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        if ($request->has('status')) {
            $order->status = $request->status;
        }
        if ($request->has('payment_status')) {
            $order->payment_status = $request->payment_status;
        }
        if ($request->has('tracking_number')) {
            $order->tracking_number = $request->tracking_number;
        }
        if ($request->has('shipping_carrier')) {
            $order->shipping_carrier = $request->shipping_carrier;
        }
        if ($request->has('transaction_id')) {
            $order->transaction_id = $request->transaction_id;
        }

        $order->save();

        return response()->json(['message' => 'Order updated successfully', 'order' => $order]);
    }
}
