import { describe, expect, it } from "vitest";
import { navigationByRole } from "./nav";
import { routes } from "./routes";

describe("navigationByRole", () => {
  it("admin gets the analytics → prescriptions → users → doctors → patients flow", () => {
    const items = navigationByRole.ADMIN;
    expect(items).toHaveLength(5);
    expect(items.map((i) => i.href)).toEqual([
      routes.admin.metrics,
      routes.admin.prescriptions,
      routes.admin.users,
      routes.admin.doctors,
      routes.admin.patients,
    ]);
    expect(items.map((i) => i.label)).toEqual([
      "Analytics",
      "Prescriptions",
      "Users",
      "Doctors",
      "Patients",
    ]);
  });

  it("doctor has prescriptions, new script, patients, profile (no analytics unless feature-flagged)", () => {
    // Analytics is gated by NEXT_PUBLIC_DOCTOR_ANALYTICS_ENABLED; the test
    // env doesn't set the flag, so analytics should NOT appear here.
    // (See lib/features.test.ts for the flag's own contract.)
    const items = navigationByRole.DOCTOR;
    const hrefs = items.map((i) => i.href);
    expect(hrefs).toContain(routes.doctor.prescriptions);
    expect(hrefs).toContain(routes.doctor.newPrescription);
    expect(hrefs).toContain(routes.doctor.patients);
    expect(hrefs).toContain(routes.doctor.profile);
    expect(hrefs).not.toContain(routes.doctor.analytics);
  });

  it("patient navigation is just My Prescriptions + Profile", () => {
    const items = navigationByRole.PATIENT;
    expect(items).toHaveLength(2);
    expect(items[0].href).toBe(routes.patient.prescriptions);
    expect(items[0].label).toBe("My Prescriptions");
    expect(items[1].href).toBe(routes.patient.profile);
    expect(items[1].label).toBe("Profile");
  });

  it("every nav item declares an icon (presence, not value)", () => {
    for (const role of ["ADMIN", "DOCTOR", "PATIENT"] as const) {
      for (const item of navigationByRole[role]) {
        expect(item.icon.length).toBeGreaterThan(0);
      }
    }
  });
});
