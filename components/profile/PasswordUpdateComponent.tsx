"use client";

import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import React, { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserPasswordAction } from "@/app/actions/update-user.action";
import { toast } from "sonner";

const PasswordUpdateComponent = ({ email }: { email: string }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordState, passwordAction, isPending] = useActionState(
    updateUserPasswordAction,
    {},
  );

  useEffect(
    () => {
      if (passwordState.success) {
        toast.success(passwordState.message || "Profile updated successfully");
      }
      if (String(passwordState.success) === "false") {
        toast.error(passwordState.message || "Failed to update profile");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [passwordState.success],
  );

  return (
    <form action={passwordAction}>
      <h3 className="font-bold pb-6">Security</h3>
      <hr className="border-gray-5 mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">Old Password</Label>
          <div className="relative">
            <Input
              id="oldPassword"
              type={showPassword ? "text" : "password"}
              name="oldPassword"
              defaultValue={passwordState.oldPassword}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {passwordState?.errors?.oldPassword && (
            <p className="text-sm text-red-500">
              {passwordState?.errors?.oldPassword}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              name="newPassword"
              defaultValue={passwordState.newPassword}
            />
            <button
              type="submit"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {passwordState?.errors?.newPassword && (
            <p className="text-sm text-red-500">
              {passwordState?.errors?.newPassword}
            </p>
          )}
        </div>
      </div>
      <input hidden name="authEmail" defaultValue={email} />
      <Button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white mt-6"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Update Password
      </Button>
    </form>
  );
};
export default PasswordUpdateComponent;
