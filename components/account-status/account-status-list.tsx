"use client";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const mockAccounts = [
  {
    id: "1",
    name: "Chioma Okoro",
    borrowed: 50000,
    paid: 50000,
    due: "2026-12-01",
    fine: 0,
    status: "overdue",
  },
  {
    id: "2",
    name: "Funke Olawale",
    borrowed: 30000,
    paid: 20000,
    due: "2026-11-15",
    fine: 5000,
    status: "goodStanding",
  },
  {
    id: "3",
    name: "Tunde Adeyemi",
    borrowed: 20000,
    paid: 10000,
    due: "2026-11-30",
    fine: 0,
    status: "owing",
  },
];

export function AccountStatusList() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Account Status</h1>
        <p className="text-muted-foreground">Financial tracking and payments</p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Outstanding",
            value: "₦246,000",
            color: "text-orange-600",
          },
          { label: "Good Standing", value: "186", color: "text-green-600" },
          { label: "Pending Payments", value: "44", color: "text-yellow-600" },
          { label: "Overdue", value: "18", color: "text-red-600" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {mockAccounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-orange-500 text-white font-semibold">
                    {account.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{account.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Borrowed: ₦{account.borrowed.toLocaleString()}
                  </p>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-muted-foreground">
                    Due: {account.due}
                  </p>
                </div>
                <Badge
                  variant={
                    account.status === "goodStanding"
                      ? "default"
                      : account.status === "overdue"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {account.status === "goodStanding"
                    ? "Good Standing"
                    : account.status === "overdue"
                      ? "Overdue"
                      : "Owing"}
                </Badge>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/account-status/${account.id}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
