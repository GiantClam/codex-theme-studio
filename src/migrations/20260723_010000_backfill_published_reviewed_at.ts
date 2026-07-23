import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`UPDATE \`skins\` SET \`reviewed_at\` = \`updated_at\` WHERE \`status\` = 'published' AND (\`reviewed_at\` IS NULL OR \`reviewed_at\` = '');`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Historical timestamps are intentionally retained after the backfill.
}
