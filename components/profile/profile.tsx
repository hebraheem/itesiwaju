"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Edit, Loader2, Save } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { parseDate } from "@/lib/utils";
import { updateUserAction } from "@/app/actions/update-user.action";
import PasswordUpdateComponent from "@/components/profile/PasswordUpdateComponent";

export function Profile() {
  const t = useTranslations("profile");
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateUserAction, {});

  useEffect(
    () => {
      if (state.success) {
        toast.success(state.message || t("updateSuccess"));
        setIsEditing(false);
      }
      if (String(state.success) === "false") {
        toast.error(state.message || t("updateError"));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.success],
  );

  if (!user) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </motion.div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("personalInfo")}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? t("cancel") : t("edit")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-orange-500 text-white text-3xl font-bold">
                {user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {user?.role}
                </Badge>
                <Badge>{user?.status}</Badge>
              </div>
              <div className="mt-2">
                {t("joined")}: <Badge>{parseDate(user?.joinedAt)}</Badge>
              </div>
            </div>
          </div>
          <form action={action}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t("firstName")}</Label>
                <Input
                  name="firstName"
                  type="text"
                  defaultValue={user?.firstName || ""}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("lastName")}</Label>
                <Input
                  name="lastName"
                  type="text"
                  defaultValue={user?.lastName || ""}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("otherName")}</Label>
                <Input
                  name="otherName"
                  type="text"
                  defaultValue={user?.otherName || ""}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t("email")}</Label>
                <Input
                  type="email"
                  name="email"
                  defaultValue={user?.email || ""}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t("phone")}</Label>
                <Input
                  type="text"
                  name="phone"
                  defaultValue={user?.phone || ""}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="mb-6">
              <h3 className="py-6 font-bold">{t("addressData")}</h3>
              <hr className="border-gray-5 mb-6" />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {t("street")}
                  </Label>
                  <Input
                    type="text"
                    name="street"
                    defaultValue={user?.address?.street || ""}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">{t("city")}</Label>
                  <Input
                    type="text"
                    name="city"
                    defaultValue={user?.address?.city || ""}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">{t("state")}</Label>
                  <Input
                    type="text"
                    name="state"
                    defaultValue={user?.address?.state || ""}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">{t("country")}</Label>
                  <Input
                    type="text"
                    name="country"
                    defaultValue={user?.address?.country || ""}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <input hidden name="id" defaultValue={user?._id ?? ""} />
              <input hidden name="authEmail" defaultValue={user?.email ?? ""} />
            </div>
            {isEditing && (
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t("saveChanges")}
              </Button>
            )}
          </form>
          <PasswordUpdateComponent email={user.email} />
        </CardContent>
      </Card>
    </div>
  );
}
