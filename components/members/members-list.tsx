"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Loader2,
  ShieldQuestionMark,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePaginatedQuery } from "convex-helpers/react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import RoleAction from "@/components/common/RoleAction";

export function MembersList() {
  const { data: session } = useSession();
  const [query, setQuery] = useState({ search: "", limit: 10 });
  const { results, loadMore, isLoading, status } = usePaginatedQuery(
    api.users.getUsers,
    { userEmail: session?.user.email ?? "", ...query },
    {
      initialNumItems: 10,
    },
  );

  const getMemberStats = useQuery(api.users.getMemberStats);

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
        <RoleAction roles={["admin"]}>
          <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
            <Link href="/members/create">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Link>
          </Button>
        </RoleAction>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Users,
            label: "Total Members",
            value: getMemberStats?.totalMembers ?? "0",
            color: "bg-blue-500",
          },
          {
            icon: UserCheck,
            label: "Active",
            value: getMemberStats?.activeMembers ?? "0",
            color: "bg-green-500",
          },
          {
            icon: ShieldQuestionMark,
            label: "Inactive",
            value: getMemberStats?.inactiveMembers ?? "0",
            color: "bg-orange-500",
          },
          {
            icon: UserX,
            label: "Suspended",
            value: getMemberStats?.suspendedMembers ?? "0",
            color: "bg-red-500",
          },
        ].map((stat) => (
          <Card key={stat.label}>
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
      {isLoading && status !== "LoadingMore" && (
        <div className="flex justify-center items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin justify-center" />
        </div>
      )}
      <div className="grid gap-4">
        {results.map((member, index) => (
          <motion.div
            key={member._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                    className="grayscale"
                  />
                  <AvatarFallback className="bg-orange-500 text-white font-semibold">
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">
                    {member.firstName} {member.lastName}{" "}
                    {session?.user?.id === member._id ? "(You)" : ""}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {member.phone}
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
                <RoleAction roles={["admin"]}>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/members/${member._id}`}>View</Link>
                  </Button>
                </RoleAction>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {status === "CanLoadMore" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadMore(query.limit)}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin justify-center" />
            )}
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}
