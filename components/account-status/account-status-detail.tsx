"use client";

import { useState, useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Wallet,
  Calendar,
  AlertCircle,
  CheckCircle,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import RoleAction from "@/components/common/RoleAction";
import { extractErrorMessage, parseDate, USER_ROLES } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  recordPaymentAction,
  recordBorrowAction,
  recordFineAction,
  recordDueAction,
} from "@/app/actions/account.action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as React from "react";

export function AccountStatusDetail({ memberId }: { memberId: string }) {
  const t = useTranslations("accountStatus");
  const session = useSession();
  const accountStand = useQuery(api.accounts.getAccountByUserId, {
    userId: memberId as Id<"users">,
    authEmail: session.data?.user?.email || "",
  });
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "payment" | "borrow" | "fine" | null
  >(null);

  const handleActionSelect = (action: string) => {
    setSelectedAction(action as "payment" | "borrow" | "fine");
    setIsActionDialogOpen(true);
  };

  const filteredPayments = (accountStand?.paymentHistory || []).filter(
    (payment) =>
      payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.amount?.toString().includes(searchQuery),
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "good_standing":
        return "default";
      case "overdue":
        return "destructive";
      case "owing":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "payment":
      case "borrow_payment":
      case "fine_payment":
      case "due_payment":
        return t("paymentTypes.payment");
      case "borrow":
        return t("paymentTypes.borrow");
      case "fine":
        return t("paymentTypes.fine");
      default:
        return type;
    }
  };

  if (!accountStand) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("back")}
      </Button>

      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 md:w-16 md:h-16">
            <AvatarFallback className="bg-orange-500 text-white text-lg md:text-xl font-bold">
              {accountStand?.user?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {accountStand?.user?.name}
            </h1>
            <Badge
              variant={getStatusBadgeVariant(accountStand?.status ?? "")}
              className="mt-2"
            >
              {t(`status.${accountStand?.status}`)}
            </Badge>
          </div>
        </div>
        <RoleAction roles={[USER_ROLES.admin, USER_ROLES.treasurer]}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {selectedAction
                  ? t(`actions.record${selectedAction}`)
                  : t("actions.recordAction")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleActionSelect("payment")}>
                {t("actions.recordPayment")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleActionSelect("borrow")}>
                {t("actions.recordBorrow")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleActionSelect("fine")}>
                {t("actions.recordFine")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleActionSelect("due")}>
                {t("actions.recordDue")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </RoleAction>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            icon: Wallet,
            label: t("details.borrowedAmount"),
            value: `€${(accountStand?.currentBorrowedAmount ?? 0).toLocaleString()}`,
            color: "bg-blue-500",
          },
          {
            icon: CheckCircle,
            label: t("payment.fineToBalance"),
            value: `€${(accountStand?.fineToBalance ?? 0).toLocaleString()}`,
            color: "bg-green-500",
          },
          {
            icon: AlertCircle,
            label: t("details.dueToBalance"),
            value: `€${(accountStand?.duesToBalance ?? 0).toLocaleString()}`,
            color: "bg-orange-500",
          },
          {
            icon: Calendar,
            label: t("details.dueDate"),
            value: accountStand?.dueDate
              ? parseDate(accountStand?.dueDate)
              : t("details.goodStanding"),
            color: "bg-purple-500",
          },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 md:p-6">
              <div className={`p-2 md:p-3 ${stat.color} rounded-xl w-fit mb-3`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 ">
            <CardTitle className="text-lg md:text-xl">
              <p className="text-nowrap">{t("details.paymentHistory")}</p>
            </CardTitle>
            <div className="relative w-3/4 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPayments")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {filteredPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t("noRecords")}
              </p>
            ) : (
              filteredPayments.map((payment, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 md:p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm md:text-base">
                        €{payment.amount.toLocaleString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {getPaymentTypeLabel(payment.type)}
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {payment.description}
                    </p>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {parseDate(payment.date)}
                  </p>
                  {payment.dueDate && (
                    <p className="text-xs md:text-sm text-red-500">
                      {t("details.dueDate")}: {parseDate(payment.dueDate)}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => {
          setIsActionDialogOpen(false);
          setSelectedAction(null);
        }}
        actionType={selectedAction}
        memberId={memberId}
        memberName={accountStand?.user?.name ?? ""}
      />
    </div>
  );
}

function ActionDialog({
  isOpen,
  onClose,
  actionType,
  memberId,
  memberName,
}: {
  isOpen: boolean;
  onClose: () => void;
  actionType: "payment" | "borrow" | "fine" | "due" | null;
  memberId: string;
  memberName: string;
}) {
  const t = useTranslations("accountStatus");
  const { data: session } = useSession();

  const [paymentState, paymentAction, isPendingPayment] = useActionState(
    recordPaymentAction,
    {},
  );
  const [borrowState, borrowAction, isPendingBorrow] = useActionState(
    recordBorrowAction,
    {},
  );
  const [fineState, fineAction, isPendingFine] = useActionState(
    recordFineAction,
    {},
  );
  const [dueState, dueAction, isPendingDue] = useActionState(
    recordDueAction,
    {},
  );

  const getState = () => {
    switch (actionType) {
      case "payment":
        return paymentState;
      case "borrow":
        return borrowState;
      case "fine":
        return fineState;
      case "due":
        return dueState;
      default:
        return {};
    }
  };

  const getAction = () => {
    switch (actionType) {
      case "payment":
        return paymentAction;
      case "borrow":
        return borrowAction;
      case "fine":
        return fineAction;
      case "due":
        return dueAction;
      default:
        return () => {};
    }
  };

  const isPending =
    isPendingPayment || isPendingBorrow || isPendingFine || isPendingDue;
  const state = getState();
  const action = getAction();

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || t("actionSuccess"));
      onClose();
    }
    if (state.success === false && state.message) {
      toast.error(extractErrorMessage(state.message));
    }
  }, [state.success, state.message, onClose, t]);

  if (!actionType || !isOpen) return null;

  const getDialogTitle = () => {
    switch (actionType) {
      case "payment":
        return t("actions.recordPayment");
      case "borrow":
        return t("actions.recordBorrow");
      case "fine":
        return t("actions.recordFine");
      case "due":
        return t("actions.recordDue");
      default:
        return "";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg md:text-xl">
                  {getDialogTitle()}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t("actionDescription", { name: memberName })}
              </p>
            </CardHeader>
            <CardContent>
              <form action={action} className="space-y-4">
                <input type="hidden" name="userId" value={memberId} />
                <input
                  type="hidden"
                  name="authEmail"
                  value={session?.user?.email || ""}
                />

                <div className="space-y-2">
                  <Label htmlFor="amount">{t("form.amount")}</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    disabled={isPending}
                    className={state.errors?.amount ? "border-red-500" : ""}
                  />
                  {state.errors?.amount && (
                    <p className="text-sm text-red-500">
                      {state.errors.amount[0]}
                    </p>
                  )}
                </div>

                {actionType === "borrow" && (
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">{t("form.dueDate")}</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      required
                      disabled={isPending}
                      className={state.errors?.dueDate ? "border-red-500" : ""}
                    />
                    {state.errors?.dueDate && (
                      <p className="text-sm text-red-500">
                        {state.errors.dueDate[0]}
                      </p>
                    )}
                  </div>
                )}

                {actionType === "fine" && (
                  <div className="space-y-2">
                    <Label htmlFor="reason">{t("form.reason")}</Label>
                    <Input
                      id="reason"
                      name="reason"
                      placeholder={t("form.reasonPlaceholder")}
                      required
                      disabled={isPending}
                      className={state.errors?.reason ? "border-red-500" : ""}
                    />
                    {state.errors?.reason && (
                      <p className="text-sm text-red-500">
                        {state.errors.reason[0]}
                      </p>
                    )}
                  </div>
                )}

                {actionType === "payment" && (
                  <div className="space-y-2">
                    <Label htmlFor="type">{t("payment.paymentType")}</Label>
                    <Select name="type" required disabled={isPending}>
                      <SelectTrigger
                        className={
                          state.errors?.paymentType ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder={t("payment.selectType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="borrow_payment">
                          {t("payment.borrow_payment")}
                        </SelectItem>
                        <SelectItem value="fine_payment">
                          {t("payment.fine_payment")}
                        </SelectItem>
                        <SelectItem value="due_payment">
                          {t("payment.due_payment")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {state.errors?.paymentType && (
                      <p className="text-sm text-red-500">
                        {state.errors.paymentType[0]}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">{t("form.description")}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder={t("form.descriptionPlaceholder")}
                    rows={3}
                    disabled={isPending}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("form.submitting")}
                      </>
                    ) : (
                      t("form.submit")
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    {t("form.cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
