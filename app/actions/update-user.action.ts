"use server";

import { convexServer } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";
import { updateProfileSchema } from "@/app/schemas/update-profile.schema";

type UpdateResponse = {
  success?: boolean;
  errors?: Record<string, string>;
  message?: string;
  firstName?: string;
  lastName?: string;
  otherName?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
};

type UpdatePasswordResponse = {
  success?: boolean;
  errors?: Record<string, string>;
  message?: string;
  oldPassword?: string;
  newPassword?: string;
};

export async function updateUserAction(
  _prev: UpdateResponse,
  formData: FormData,
): Promise<UpdateResponse> {
  const firstName = formData.get("firstName")?.toString() as string;
  const lastName = formData.get("lastName")?.toString() as string;
  const otherName = formData.get("otherName")?.toString() as string;
  const email = formData.get("email")?.toString() as string;
  const phone = formData.get("phone")?.toString() as string;
  const street = formData.get("street")?.toString() as string;
  const city = formData.get("city")?.toString() as string;
  const state = formData.get("state")?.toString() as string;
  const country = formData.get("country")?.toString() as string;
  const id = formData.get("id")?.toString() as string;
  const authEmail = formData.get("authEmail")?.toString() as string;

  const address = { street, city, state, country };

  const data = { firstName, lastName, otherName, email, phone, address };
  const parsed = updateProfileSchema.safeParse(data);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string>,
      ...Object.fromEntries(formData.entries()),
    };
  }

  try {
    await convexServer.mutation(api.users.updateUser, {
      // @ts-expect-error id is string but api expects _id
      id,
      authEmail,
      ...parsed.data,
    });
    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? "Unable to updated profile",
      ...Object.fromEntries(formData.entries()),
    };
  }
}

export async function updateUserPasswordAction(
  _prev: UpdatePasswordResponse,
  formData: FormData,
): Promise<UpdatePasswordResponse> {
  const currentPassword = formData.get("oldPassword")?.toString() as string;
  const newPassword = formData.get("newPassword")?.toString() as string;
  const authEmail = formData.get("authEmail")?.toString() as string;
  console.log("currentPassword", currentPassword);

  if (!currentPassword || currentPassword.length < 8) {
    return {
      errors: { oldPassword: "oldPasswordRequired" },
      oldPassword: currentPassword,
      newPassword,
    };
  }

  if (!newPassword || newPassword.length < 8) {
    return {
      errors: { newPassword: "newPasswordRequired" },
      oldPassword: currentPassword,
      newPassword,
    };
  }
  console.log("authEmail", authEmail);

  try {
    // Verify the current password
    const user = await convexServer.query(api.users.getUserByEmail, {
      email: authEmail,
    });
    if (!user) {
      return {
        success: false,
        message: "User not found",
        oldPassword: currentPassword,
        newPassword,
      };
    }

    const isValid = await convexServer.action(api.auth.actions.verifyPassword, {
      password: currentPassword,
      hash: user.password,
    });
    if (!isValid) {
      return {
        success: false,
        message: "Current password is incorrect",
        oldPassword: currentPassword,
        newPassword,
      };
    }

    // // Hash new password
    const hashedPassword = await convexServer.action(
      api.auth.actions.hashPassword,
      { password: newPassword },
    );
    await convexServer.mutation(api.users.updatePassword, {
      // @ts-expect-error id is string but api expects _id
      userId: id,
      authEmail,
      newPassword: hashedPassword,
      currentPassword,
    });
    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message || "Failed to update password",
      oldPassword: currentPassword,
      newPassword,
    };
  }
}
