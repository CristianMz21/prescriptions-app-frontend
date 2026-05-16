import { Pool, type QueryResult } from "pg";

/**
 * Read-side DB helpers used by Playwright specs to verify side-effects
 * the API made on Postgres. Uses raw `pg` (not Prisma) so the FE repo
 * does not have to ship a duplicate Prisma schema or generated client
 * — the queries are intentionally tiny and target known tables from
 * `backend/prisma/schema.prisma`.
 *
 * Connection string priority:
 *   1. process.env.QA_DATABASE_URL   (CI override)
 *   2. process.env.DATABASE_URL      (dev convenience)
 *   3. Local docker-compose default  (matches backend/.env.example)
 */
const CONNECTION_STRING =
  process.env.QA_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgresql://user:Password123!@localhost:5433/prescriptions_db?schema=public";

/** Singleton pool — Playwright spawns one Node process per worker. */
let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: CONNECTION_STRING,
      max: 4,
      idleTimeoutMillis: 5_000,
    });
  }
  return pool;
}

/** Tear down between Playwright suites to avoid open-handle warnings. */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

interface DbUser {
  id: string;
  email: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const r: QueryResult<DbUser> = await getPool().query(
    'SELECT id, email, role FROM "User" WHERE email = $1 LIMIT 1',
    [email],
  );
  return r.rows[0] ?? null;
}

interface DbPrescription {
  id: string;
  code: string;
  status: "PENDING" | "CONSUMED";
  createdAt: Date;
  consumedAt: Date | null;
  expiryDate: Date | null;
  authorId: string;
  patientId: string;
}

export async function getRxByCode(
  code: string,
): Promise<DbPrescription | null> {
  const r: QueryResult<DbPrescription> = await getPool().query(
    `SELECT id, code, status, "createdAt", "consumedAt", "expiryDate",
            "authorId", "patientId"
       FROM "Prescription"
      WHERE code = $1
      LIMIT 1`,
    [code],
  );
  return r.rows[0] ?? null;
}

export async function getRxById(
  id: string,
): Promise<DbPrescription | null> {
  const r: QueryResult<DbPrescription> = await getPool().query(
    `SELECT id, code, status, "createdAt", "consumedAt", "expiryDate",
            "authorId", "patientId"
       FROM "Prescription"
      WHERE id = $1
      LIMIT 1`,
    [id],
  );
  return r.rows[0] ?? null;
}

interface DbPrescriptionItem {
  id: string;
  prescriptionId: string;
  name: string;
  dosage: string | null;
  unit: string | null;
  quantity: number | null;
}

export async function getItemsByRxId(
  prescriptionId: string,
): Promise<DbPrescriptionItem[]> {
  const r: QueryResult<DbPrescriptionItem> = await getPool().query(
    `SELECT id, "prescriptionId", name, dosage, unit, quantity
       FROM "PrescriptionItem"
      WHERE "prescriptionId" = $1
      ORDER BY "createdAt" ASC`,
    [prescriptionId],
  );
  return r.rows;
}

interface PatientOwnedRxIds {
  ownedIds: string[];
  foreignSampleId: string | null;
}

/**
 * Returns the prescription ids owned by `patientEmail` plus one
 * arbitrary foreign-owned id (for negative-path "patient can't see X"
 * assertions). Useful with seed data where exact ids aren't known
 * ahead of time.
 */
export async function getPatientOwnedAndForeign(
  patientEmail: string,
): Promise<PatientOwnedRxIds> {
  const owned: QueryResult<{ id: string }> = await getPool().query(
    `SELECT p.id
       FROM "Prescription" p
       JOIN "Patient" pat ON pat.id = p."patientId"
       JOIN "User" u ON u.id = pat."userId"
      WHERE u.email = $1`,
    [patientEmail],
  );
  const foreign: QueryResult<{ id: string }> = await getPool().query(
    `SELECT p.id
       FROM "Prescription" p
       JOIN "Patient" pat ON pat.id = p."patientId"
       JOIN "User" u ON u.id = pat."userId"
      WHERE u.email <> $1
      LIMIT 1`,
    [patientEmail],
  );
  return {
    ownedIds: owned.rows.map((r) => r.id),
    foreignSampleId: foreign.rows[0]?.id ?? null,
  };
}

interface MetricsTotals {
  totalPrescriptions: number;
  pending: number;
  consumed: number;
}

/**
 * Computes the same totals the admin metrics endpoint should return
 * for a given date range — directly from the DB so E2E specs can
 * assert API responses match ground truth.
 *
 * `fromDate` / `toDate` are ISO date strings (YYYY-MM-DD) inclusive
 * on the lower bound. `toDate` is the END of the supplied day in UTC
 * so '2026-01-31' includes everything created up to 23:59:59.999.
 */
export async function computeDateRangeMetrics(
  fromDate?: string,
  toDate?: string,
): Promise<MetricsTotals> {
  const params: unknown[] = [];
  const where: string[] = [];
  if (fromDate) {
    params.push(new Date(`${fromDate}T00:00:00.000Z`));
    where.push(`"createdAt" >= $${params.length}`);
  }
  if (toDate) {
    params.push(new Date(`${toDate}T23:59:59.999Z`));
    where.push(`"createdAt" <= $${params.length}`);
  }
  const filter = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const r: QueryResult<{ total: string; pending: string; consumed: string }> =
    await getPool().query(
      `SELECT COUNT(*)::text AS total,
              COUNT(*) FILTER (WHERE status = 'PENDING')::text AS pending,
              COUNT(*) FILTER (WHERE status = 'CONSUMED')::text AS consumed
         FROM "Prescription" ${filter}`,
      params,
    );
  const row = r.rows[0];
  return {
    totalPrescriptions: Number(row.total),
    pending: Number(row.pending),
    consumed: Number(row.consumed),
  };
}

/**
 * Remove a single prescription (and its items via cascade) — used by
 * specs that create test data and need to leave the seed snapshot
 * clean. NOOP if the row doesn't exist.
 */
export async function deleteRxById(id: string): Promise<void> {
  await getPool().query('DELETE FROM "Prescription" WHERE id = $1', [id]);
}
