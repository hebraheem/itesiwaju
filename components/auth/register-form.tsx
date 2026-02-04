"use client";

import { useActionState, useEffect } from "react";
import { Loader2, Check, UserPlus, ArrowLeft } from "lucide-react";
import { registerAction, RegisterState } from "@/app/actions/register.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MotionDiv from "@/components/animations/MotionDiv";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, action, isPending] = useActionState(
    registerAction,
    initialState,
  );
  const t = useTranslations("auth.register");
  const router = useRouter();

  useEffect(
    () => {
      if (state.success) {
        router.push("/");
        toast.success(t("successMessage"));
      }

      if (String(state.success) === "false") {
        toast.error(t("errorMessage"));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.success],
  );

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl"
    >
      <Card className="shadow-2xl border-2">
        <CardHeader className="text-center space-y-4">
          <Link href="/">
            <ArrowLeft />
          </Link>{" "}
          <MotionDiv
            className="w-16 h-16 bg-linear-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <UserPlus className="w-8 h-8 text-white" />
          </MotionDiv>
          <div>
            <CardTitle className="text-3xl font-bold">{t("title")}</CardTitle>
            <CardDescription className="text-base mt-2 flex items-center justify-center gap-2 ">
              {t("subtitle")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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

            <div>
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

            <div>
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
            <div className="flex items-center gap-2">
              <Checkbox
                name="terms"
                value="true"
                id="terms"
                defaultChecked={state.terms}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("terms")}
              </label>
            </div>
            {state.errors?.terms && (
              <p className="text-red-500 text-sm">
                {t(state.errors.terms?.[0])}
              </p>
            )}

            <Button disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" /> {t("submit")}...
                </>
              ) : (
                <>
                  <Check className="mr-2" /> {t("submit")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}
