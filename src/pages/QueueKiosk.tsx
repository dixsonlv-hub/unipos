import React, { useState } from "react";
import { Users, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueue, addToQueue, getEstimatedWait } from "@/state/queue-store";

const QueueKiosk: React.FC = () => {
  const queue = useQueue();
  const waiting = queue.filter(e => e.status === "waiting" || e.status === "called");
  const [step, setStep] = useState<"join" | "done">("join");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pax, setPax] = useState(2);
  const [queueNumber, setQueueNumber] = useState(0);
  const [estWait, setEstWait] = useState(0);

  const handleJoin = () => {
    if (!name.trim()) return;
    const entry = addToQueue(name.trim(), phone, pax, "");
    setQueueNumber(entry.queueNumber);
    setEstWait(entry.estimatedWait);
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-status-green-light flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-status-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">You're in the Queue!</h1>
            <p className="text-muted-foreground mt-2 text-[15px]">We'll call your name when your table is ready</p>
          </div>
          <div className="uniweb-card p-8 space-y-4">
            <div>
              <p className="section-label mb-1">Your Queue Number</p>
              <p className="text-6xl font-bold text-primary font-mono">#{queueNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="section-label mb-1">Party Size</p>
                <p className="text-xl font-bold text-foreground">{pax} pax</p>
              </div>
              <div>
                <p className="section-label mb-1">Est. Wait</p>
                <p className="text-xl font-bold text-foreground">{estWait} min</p>
              </div>
            </div>
          </div>
          <div className="text-[13px] text-muted-foreground">
            {waiting.filter(e => e.status === "waiting").length} groups waiting ahead of you
          </div>
          <Button size="xl" className="w-full rounded-xl" onClick={() => { setStep("join"); setName(""); setPhone(""); setPax(2); }}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Join the Waitlist</h1>
          <p className="text-muted-foreground mt-2 text-[15px]">Enter your details and we'll seat you when ready</p>
          {waiting.length > 0 && (
            <div className="mt-3 flex items-center justify-center gap-3 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{waiting.length} groups waiting</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />~{getEstimatedWait(pax)} min</span>
            </div>
          )}
        </div>

        <div className="uniweb-card p-6 space-y-4">
          <div>
            <label className="section-label mb-1.5 block">Your Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name"
              className="w-full h-12 px-4 rounded-xl bg-background border-1.5 border-border text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10" />
          </div>
          <div>
            <label className="section-label mb-1.5 block">Phone (optional)</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+65 XXXX XXXX"
              className="w-full h-12 px-4 rounded-xl bg-background border-1.5 border-border text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10" />
          </div>
          <div>
            <label className="section-label mb-1.5 block">Party Size</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                <button key={n} onClick={() => setPax(n)}
                  className={cn("h-12 rounded-xl text-[15px] font-semibold transition-colors",
                    pax === n ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-secondary"
                  )}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-[13px] text-muted-foreground">
          Estimated wait: <span className="font-semibold text-foreground">{getEstimatedWait(pax)} min</span>
        </div>

        <Button size="xl" className="w-full rounded-xl text-lg" onClick={handleJoin} disabled={!name.trim()}>
          Join Queue
        </Button>
      </div>
    </div>
  );
};

export default QueueKiosk;
