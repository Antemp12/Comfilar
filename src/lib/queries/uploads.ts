import "server-only";
import { desc, eq } from "drizzle-orm";

import type { UserWithUploads } from "~/app/admin/summary/page.types";

import { db } from "~/db";
import { userTable, uploadsTable } from "~/db/schema";

// Fetch users and their uploads without relational queries (MariaDB compatible)
export async function getUsersWithUploads(): Promise<UserWithUploads[]> {
  try {
    // Get all users first
    const users = await db
      .select()
      .from(userTable)
      .orderBy(desc(userTable.createdAt));

    // Get all uploads
    const allUploads = await db
      .select()
      .from(uploadsTable);

    // Manually join uploads to users
    const usersWithUploads: UserWithUploads[] = users.map(user => ({
      ...user,
      uploads: allUploads.filter(upload => upload.userId === user.id),
    }));

    return usersWithUploads;
  } catch (error) {
    console.error("Failed to fetch users with uploads:", error);
    return [];
  }
}
