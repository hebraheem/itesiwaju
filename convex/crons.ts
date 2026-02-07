// convex/crons.ts
import { cronJobs } from "convex/server";
import { api } from "./_generated/api";
import { updateOverdueAccounts } from "@/convex/accounts";

const crons = cronJobs();

/**
 * Germany SUMMER time (CEST, UTC+2)
 * Local 00:00 = 22:00 UTC
 * Last Sunday of March → Last Sunday of October
 */
crons.cron(
  "updateOverdue_summer",
  "0 22 * * *",
  api.accounts.updateOverdueAccounts,
);

/**
 * Germany WINTER time (CET, UTC+1)
 * Local 00:00 = 23:00 UTC
 * Last Sunday of October → Last Sunday of March
 */
crons.cron(
  "updateOverdue_winter",
  "0 23 * * *",
  api.accounts.updateOverdueAccounts,
);

export default crons;
