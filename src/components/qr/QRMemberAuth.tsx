import React, { useState } from "react";
import { User, Phone, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { findCustomerByPhone, registerCustomer, type Customer } from "@/state/customer-store";

type AuthStep = "choice" | "phone" | "phone-otp" | "email" | "email-otp" | "nickname" | "done";

interface Props {
  onComplete: (customer: Customer | null) => void;
}

export const QRMemberAuth: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<AuthStep>("choice");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [otp, setOtp] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneSubmit = () => {
    if (phone.replace(/\s/g, "").length < 8) { setError("Please enter a valid phone number"); return; }
    setError("");
    // Simulate OTP sent
    setStep("phone-otp");
  };

  const handlePhoneOTP = () => {
    if (otp.length < 6) { setError("Please enter the 6-digit code"); return; }
    setError("");
    // Check if existing customer
    const existing = findCustomerByPhone(phone);
    if (existing) {
      setIsLogin(true);
      onComplete(existing);
      return;
    }
    // New registration
    setOtp("");
    setStep("email");
  };

  const handleEmailSubmit = () => {
    if (!email.includes("@")) { setError("Please enter a valid email"); return; }
    setError("");
    setStep("email-otp");
  };

  const handleEmailOTP = () => {
    if (otp.length < 6) { setError("Please enter the 6-digit code"); return; }
    setError("");
    setOtp("");
    setStep("nickname");
  };

  const handleRegister = () => {
    if (!nickname.trim()) { setError("Please enter a nickname"); return; }
    const customer = registerCustomer(phone, email, nickname.trim());
    onComplete(customer);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {step === "choice" && (
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Member Login</h2>
            <p className="text-sm text-muted-foreground mt-1">Earn points on every order</p>
          </div>
          <button onClick={() => setStep("phone")}
            className="w-full p-4 rounded-2xl border border-border hover:border-primary/40 flex items-center gap-4 transition-colors">
            <Phone className="w-5 h-5 text-primary" />
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground text-sm">Login / Register</p>
              <p className="text-xs text-muted-foreground">With phone number</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => onComplete(null)}
            className="w-full p-4 rounded-2xl bg-muted text-muted-foreground font-medium text-sm hover:bg-accent transition-colors">
            Continue as Guest
          </button>
        </div>
      )}

      {step === "phone" && (
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-xl font-bold text-foreground text-center">Enter Phone Number</h2>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+65</span>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9\s]/g, ""))}
              placeholder="9123 4567" maxLength={12}
              className="w-full pl-14 pr-4 py-4 rounded-2xl border border-border bg-card text-lg text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <button onClick={handlePhoneSubmit}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base">
            Send OTP
          </button>
          <button onClick={() => { setStep("choice"); setError(""); }} className="w-full text-sm text-muted-foreground text-center">Back</button>
        </div>
      )}

      {step === "phone-otp" && (
        <div className="w-full max-w-sm space-y-6 text-center">
          <h2 className="text-xl font-bold text-foreground">Verify Phone</h2>
          <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to +65 {phone}</p>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button onClick={handlePhoneOTP}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base">
            Verify
          </button>
          <button onClick={() => { setStep("phone"); setOtp(""); setError(""); }} className="w-full text-sm text-muted-foreground">Back</button>
        </div>
      )}

      {step === "email" && (
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-xl font-bold text-foreground text-center">Enter Email</h2>
          <p className="text-sm text-muted-foreground text-center">For order receipts & promotions</p>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              placeholder="you@email.com"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-card text-base focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <button onClick={handleEmailSubmit}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base">
            Send Verification
          </button>
        </div>
      )}

      {step === "email-otp" && (
        <div className="w-full max-w-sm space-y-6 text-center">
          <h2 className="text-xl font-bold text-foreground">Verify Email</h2>
          <p className="text-sm text-muted-foreground">Enter the code sent to {email}</p>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button onClick={handleEmailOTP}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base">
            Verify
          </button>
        </div>
      )}

      {step === "nickname" && (
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-xl font-bold text-foreground text-center">Almost Done!</h2>
          <p className="text-sm text-muted-foreground text-center">What should we call you?</p>
          <input value={nickname} onChange={e => setNickname(e.target.value)}
            placeholder="Your nickname" maxLength={30}
            className="w-full px-4 py-4 rounded-2xl border border-border bg-card text-lg text-center focus:outline-none focus:ring-2 focus:ring-ring" />
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <button onClick={handleRegister}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base">
            Complete Registration
          </button>
        </div>
      )}
    </div>
  );
};
