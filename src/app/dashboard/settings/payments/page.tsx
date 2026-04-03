"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSettingsPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [mpesaEnabled, setMpesaEnabled] = useState(false);
  const [mpesaPaybill, setMpesaPaybill] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        const p = data.profile;
        setProfile(p);
        setMpesaEnabled(p?.mpesaEnabled || false);
        setMpesaPaybill(p?.mpesaPaybillNumber || "");
        setPaymentRequired(p?.paymentRequired || false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          paymentRequired,
          mpesaEnabled,
          mpesaPaybillNumber: mpesaPaybill || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Payment settings saved");
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment Settings</h1>
        <p className="text-gray-600">Configure how you accept payments</p>
      </div>

      {/* Payment Required Toggle */}
      <Card>
        <CardContent className="p-6">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Require Payment for Bookings</p>
              <p className="text-sm text-gray-500">
                When enabled, clients must pay when booking services with a price
              </p>
            </div>
            <input
              type="checkbox"
              checked={paymentRequired}
              onChange={(e) => setPaymentRequired(e.target.checked)}
              className="w-5 h-5"
            />
          </label>
        </CardContent>
      </Card>

      {/* Stripe */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5" />
            <CardTitle>Stripe</CardTitle>
            <Badge variant="secondary">Card / Google Pay / Apple Pay</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Connect your Stripe account to accept credit card, Google Pay, and
            Apple Pay payments.
          </p>
          {(profile as Record<string, unknown>)?.stripeAccountId ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
              <span className="text-sm text-gray-500">
                Account: {String((profile as Record<string, unknown>).stripeAccountId).slice(0, 12)}...
              </span>
            </div>
          ) : (
            <Button variant="outline" disabled>
              Connect Stripe Account (Coming Soon)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* M-Pesa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5" />
            <CardTitle>M-Pesa</CardTitle>
            <Badge variant="secondary">Mobile Money</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mpesaEnabled}
              onChange={(e) => setMpesaEnabled(e.target.checked)}
              className="w-5 h-5"
            />
            <span>Enable M-Pesa payments</span>
          </label>
          {mpesaEnabled && (
            <div>
              <Label htmlFor="paybill">Paybill / Till Number</Label>
              <Input
                id="paybill"
                value={mpesaPaybill}
                onChange={(e) => setMpesaPaybill(e.target.value)}
                placeholder="e.g., 174379"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Payment Settings"
        )}
      </Button>
    </div>
  );
}
