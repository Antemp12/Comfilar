import { relations } from "drizzle-orm";

import { uploadsTable } from "../uploads/tables";
import { accountTable, sessionTable, userTable } from "./tables";
import { quoteRequestsTable, ordersTable, meetingsTable } from "../comfilar/tables";

export const userRelations = relations(userTable, ({ many }) => ({
  accounts: many(accountTable),
  sessions: many(sessionTable),
  uploads: many(uploadsTable),
  quoteRequests: many(quoteRequestsTable),
  orders: many(ordersTable),
  clientMeetings: many(meetingsTable, { relationName: "clientMeetings" }),
  employeeMeetings: many(meetingsTable, { relationName: "employeeMeetings" }),
}));

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const accountRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));
