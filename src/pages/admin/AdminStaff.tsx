import React from "react";
import { Plus, Shield, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { staffMembers } from "@/data/mock-data";

const roleColors: Record<string, string> = {
  server: "bg-pos-reserved/15 text-pos-reserved",
  cashier: "bg-pos-occupied/15 text-pos-occupied",
  manager: "bg-primary/15 text-primary",
  kitchen: "bg-pos-available/15 text-pos-available",
};

const AdminStaff: React.FC = () => (
  <div className="p-8">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Staff & Permissions</h1>
        <p className="text-sm text-muted-foreground">{staffMembers.length} team members</p>
      </div>
      <Button><Plus className="h-4 w-4 mr-1" />Add Staff</Button>
    </div>

    <div className="bg-card rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="text-left p-4 font-medium">Name</th>
            <th className="text-left p-4 font-medium">Role</th>
            <th className="text-left p-4 font-medium">Permissions</th>
            <th className="text-left p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffMembers.map(s => (
            <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="p-4 text-sm font-medium text-foreground">{s.name}</td>
              <td className="p-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${roleColors[s.role]}`}>{s.role}</span>
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                {s.role === "manager" ? "Full access" : s.role === "cashier" ? "POS, refunds" : s.role === "kitchen" ? "KDS only" : "POS, tables"}
              </td>
              <td className="p-4">
                <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminStaff;
