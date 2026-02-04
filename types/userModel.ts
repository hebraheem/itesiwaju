export type UserModel = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "member" | "pro" | "treasurer";
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  } | null;
  phone?: string | null;
  otherName?: string | null;
  status: "active" | "suspended" | "inactive";
  joinedAt: number;
};
