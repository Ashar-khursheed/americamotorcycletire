<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'message' => 'required|string',
        ]);

        $inquiry = ContactInquiry::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'message' => $validated['message'],
            'status' => 'new',
        ]);

        // Attempt SMTP mail dispatch to tennis2016@yahoo.com
        try {
            $toEmail = 'tennis2016@yahoo.com';
            $subject = "NEW SERVICE INQUIRY: " . $validated['name'] . " - BMG CYCLES";
            $bodyText = "New contact service schedule inquiry received from BMG CYCLES website:\n\n" .
                "Customer Name: " . $validated['name'] . "\n" .
                "Email: " . $validated['email'] . "\n" .
                "Phone: " . ($validated['phone'] ?? 'N/A') . "\n\n" .
                "Message/Requested Service:\n" . $validated['message'] . "\n\n" .
                "Submitted at: " . now()->toDateTimeString();

            @Mail::raw($bodyText, function ($mail) use ($toEmail, $subject, $validated) {
                $mail->to($toEmail)
                    ->replyTo($validated['email'], $validated['name'])
                    ->subject($subject);
            });
        } catch (\Throwable $e) {
            Log::info("Mail notification logged (configure SMTP in .env for live sending): " . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Your service schedule inquiry has been submitted successfully! BMG Cycles will contact you shortly.',
            'data' => $inquiry,
        ], 201);
    }

    public function index()
    {
        $inquiries = ContactInquiry::orderBy('id', 'desc')->paginate(30);

        return response()->json([
            'status' => 'success',
            'data' => $inquiries,
        ]);
    }
}
