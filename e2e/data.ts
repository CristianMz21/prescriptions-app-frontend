import type { APIRequestContext } from "@playwright/test";
import type {
  PrescriptionResponseDto,
  Role,
  UserEntity,
} from "../src/lib/api/generated/schemas";

export const BACKEND_URL =
  process.env.E2E_BACKEND_URL ?? "http://localhost:3000";

export const SEED = {
  admin: { email: "admin@clinic.com", password: "Password123!" },
  doctor: { email: "doctor@clinic.com", password: "Password123!" },
  patient: { email: "patient@clinic.com", password: "Password123!" },
} as const;

export type SeededRole = keyof typeof SEED;

export const LANDING_PATH: Record<Role, string> = {
  ADMIN: "/admin/metrics",
  DOCTOR: "/doctor/prescriptions",
  PATIENT: "/patient/prescriptions",
};

export function uniqueMedName(prefix = "Aspirin") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

interface BackendLoginCtx {
  apiRequest: APIRequestContext;
  email: string;
  password: string;
}

/** Logs into the backend with a fresh cookie jar so subsequent calls are
 *  authenticated as that user. Returns the API request context for chaining. */
export async function backendLogin({
  apiRequest,
  email,
  password,
}: BackendLoginCtx): Promise<void> {
  const res = await apiRequest.post(`${BACKEND_URL}/auth/login`, {
    data: { email, password },
  });
  if (res.status() !== 201) {
    throw new Error(
      `Backend login for ${email} returned ${res.status()}: ${await res.text()}`,
    );
  }
}

/** Resolve the `Patient.id` profile id for a seeded patient User by email. */
export async function resolvePatientProfileId(
  apiRequest: APIRequestContext,
  patientEmail: string,
): Promise<string> {
  // Bump the page size — onboarding tests create extra patients, which push
  // the seed account off page 1 with the default limit.
  const list = await apiRequest.get(`${BACKEND_URL}/users/patients?limit=100`);
  const body = (await list.json()) as { data?: UserEntity[] };
  const user = body.data?.find((u) => u.email === patientEmail);
  if (!user) {
    throw new Error(`Patient ${patientEmail} not found in /users/patients`);
  }
  const detailRes = await apiRequest.get(`${BACKEND_URL}/users/${user.id}`);
  const detail = (await detailRes.json()) as { patient?: { id?: string } };
  if (!detail.patient?.id) {
    throw new Error(`User ${patientEmail} has no patient profile`);
  }
  return detail.patient.id;
}

/** Create a new PENDING prescription as a doctor against a patient. Returns
 *  the new RX. Used by mutation tests so they don't depend on shared seed
 *  state. */
export async function seedPrescription(
  apiRequest: APIRequestContext,
  options: { medName?: string; expiryDate?: string } = {},
): Promise<PrescriptionResponseDto> {
  await backendLogin({
    apiRequest,
    email: SEED.doctor.email,
    password: SEED.doctor.password,
  });
  const patientId = await resolvePatientProfileId(
    apiRequest,
    SEED.patient.email,
  );
  const medName = options.medName ?? uniqueMedName();
  const res = await apiRequest.post(`${BACKEND_URL}/prescriptions`, {
    data: {
      patientId,
      items: [
        {
          name: medName,
          dosage: "100mg",
          quantity: 30,
          unit: "comprimidos",
          instructions: "Once daily",
        },
      ],
      notes: "E2E seed",
      expiryDate: options.expiryDate,
    },
  });
  if (res.status() !== 201) {
    throw new Error(
      `seedPrescription failed: ${res.status()} ${await res.text()}`,
    );
  }
  return (await res.json()) as PrescriptionResponseDto;
}
