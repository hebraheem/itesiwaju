"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Users, UserCheck, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { usePaginatedQuery } from "convex-helpers/react";
import { api } from "@/convex/_generated/api";

const mockMembers = [
  {
    id: "1",
    firstName: "Adebayo",
    lastName: "Okon",
    email: "adebayo@email.com",
    phone: "+234 123 456 7890",
    role: "admin",
    status: "active",
  },
  {
    id: "2",
    firstName: "Chioma",
    lastName: "Okoro",
    email: "chioma@email.com",
    phone: "+234 123 456 7891",
    role: "member",
    status: "active",
  },
  {
    id: "3",
    firstName: "Tunde",
    lastName: "Adeyemi",
    email: "tunde@email.com",
    phone: "+234 123 456 7892",
    role: "executive",
    status: "active",
  },
];

export function MembersList() {
  const { data: session } = useSession();
  const [query, setQuery] = useState({ search: "", limit: 10 });
  const { results } = usePaginatedQuery(
    api.users.getUsers,
    session?.user?.email ? { userEmail: session.user.email } : "skip",
    {
      initialNumItems: 10,
    },
  );
  console.log("getUsers", results);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage club members</p>
        </div>
        <Button asChild className="bg-blue-500 hover:bg-blue-600">
          <Link href="/members/create">
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Link>
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Users,
            label: "Total Members",
            value: "248",
            color: "bg-blue-500",
          },
          {
            icon: UserCheck,
            label: "Active",
            value: "230",
            color: "bg-green-500",
          },
          { icon: UserX, label: "Suspended", value: "18", color: "bg-red-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 ${stat.color} rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={query.search}
          onChange={(e) =>
            setQuery((prev) => ({ ...prev, search: e.target.value }))
          }
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {mockMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-orange-500 text-white font-semibold">
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-muted-foreground">
                    {member.phone}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {member.role}
                </Badge>
                <Badge
                  variant={
                    member.status === "active" ? "default" : "destructive"
                  }
                >
                  {member.status}
                </Badge>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/members/${member.id}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
