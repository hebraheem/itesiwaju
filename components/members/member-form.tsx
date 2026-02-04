"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  adminUpdateAction,
  registerAction,
} from "@/app/actions/register.action";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { UserModel } from "@/types/userModel";

export function MemberForm({ user }: { user: UserModel | null }) {
  const router = useRouter();
  const t = useTranslations("auth.register");
  const session = useSession();

  const [state, action, isPending] = useActionState(
    user ? adminUpdateAction : registerAction,
    {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      role: user?.role ?? "member",
      status: user?.status ?? "active",
    },
  );

  useEffect(
    () => {
      if (String(state?.success) === "false") {
        console.error("state.error", state.message);
        toast.error(t("errorMessage"));
      }

      if (state?.success) {
        toast.success(user ? "Member updated" : "Member added");
        router.push("/members");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.success],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl space-y-6"
    >
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {user ? `${user.firstName} ${user.lastName}` : "Add Member"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user ? "Update member" : "Add new member"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div
              className={`${!!user?._id ? "hidden" : "grid"} md:grid-cols-2 gap-4`}
            >
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("firstName")}
                </Label>
                <Input
                  name="firstName"
                  id="firstName"
                  placeholder="Eni"
                  defaultValue={state.firstName}
                />
                {state.errors?.firstName && (
                  <p className="text-red-500 text-sm">
                    {t(state.errors.firstName?.[0])}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="lastName"
                  className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("lastName")}
                </Label>
                <Input
                  name="lastName"
                  id="lastName"
                  placeholder="Akoko"
                  defaultValue={state.lastName}
                />
                {state.errors?.lastName && (
                  <p className="text-red-500 text-sm">
                    {t(state.errors.lastName?.[0])}
                  </p>
                )}
              </div>
            </div>

            <div className={`${!!user?._id && "hidden"}`}>
              <Label
                htmlFor="email"
                className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("email")}
              </Label>
              <Input
                name="email"
                type="email"
                defaultValue={state.email}
                id="email"
                placeholder="eni.akoko@gmail.com"
              />
              {state.errors?.email && (
                <p className="text-red-500 text-sm">
                  {t(state.errors.email?.[0])}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${user?._id && "hidden"}`}>
                <Label
                  htmlFor="phone"
                  className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("phone")}
                </Label>
                <Input
                  name="phone"
                  id="phone"
                  placeholder="016366373833"
                  defaultValue={state.phone}
                />
                {state.errors?.phone && (
                  <p className="text-red-500 text-sm">
                    {t(state.errors.phone?.[0])}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select name="role" defaultValue={state?.role ?? "member"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="treasurer">Treasure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {user && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={state?.status ?? "member"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <input
              name="authEmail"
              defaultValue={session.data?.user?.email ?? ""}
              hidden
            />
            <input name="id" defaultValue={user?._id ?? ""} hidden />
            <div className="flex items-center gap-2">
              <Checkbox
                name="terms"
                value="true"
                hidden
                id="terms"
                defaultChecked={true}
              />
            </div>

            <Button disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />{" "}
                  {t(user?._id ? "update" : "submit")}...
                </>
              ) : (
                <>
                  <Check className="mr-2" />{" "}
                  {t(user?._id ? "update" : "submit")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
