"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Mail, Phone, Calendar, Locate } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/common/Loader";
import Link from "next/link";
import { buildAddress, parseDate } from "@/lib/utils";
import { UserModel } from "@/types/userModel";
import { useAuth } from "@/lib/hooks/use-auth";
import { Id } from "@/convex/_generated/dataModel";

export function MemberDetail({ memberId }: { memberId: string }) {
  const t = useTranslations("members");
  const tc = useTranslations("common");
  const router = useRouter();
  const { user } = useAuth();

  const member = useQuery(api.users.getUserById, {
    id: memberId as Id<"users">,
    email: user?.email ?? "",
  }) as UserModel;

  if (!member) {
    return <Loader />;
  }
  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {tc("back")}
        </Button>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-orange-500 text-white text-2xl font-bold">
                {member.firstName[0]}
                {member.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                {member.firstName} {member.lastName}
              </h1>
              <div className="flex gap-2 mt-2">
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
              </div>
              <div></div>
            </div>
          </div>
          <Link href={`/members/update/${memberId}`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              {tc("edit")}
            </Button>
          </Link>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span>{member.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <span>{member.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Locate className="w-5 h-5 text-muted-foreground" />
              <span>{buildAddress(member.address)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span>Joined: {parseDate(member.joinedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
