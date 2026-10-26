import {sqliteTable,text,index,integer} from 'drizzle-orm/sqlite-core';
export const analyticsDevices=sqliteTable('analytics_devices',{
 id:text('id').primaryKey(),firstDay:text('first_day').notNull(),source:text('source').notNull(),excluded:integer('excluded').notNull().default(0),
});
export const analyticsEvents=sqliteTable('analytics_events',{
 id:text('id').primaryKey(),deviceId:text('device_id').notNull(),day:text('day').notNull(),kind:text('kind').notNull(),receivedAt:text('received_at').notNull(),
},t=>[index('analytics_day_kind').on(t.day,t.kind),index('analytics_device_day').on(t.deviceId,t.day)]);
