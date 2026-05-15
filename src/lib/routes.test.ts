import { describe, expect, it } from "vitest";
import { getRedirectPath, routes } from "./routes";

describe("routes", () => {
  it("builds parameterized patient routes", () => {
    expect(routes.patient.detail("abc-123")).toBe(
      "/patient/prescriptions/abc-123",
    );
    expect(routes.patient.consume("abc-123")).toBe(
      "/patient/prescriptions/abc-123/consume",
    );
  });
});

describe("getRedirectPath", () => {
  it("routes ADMIN to metrics", () => {
    expect(getRedirectPath("ADMIN")).toBe(routes.admin.metrics);
  });
  it("routes DOCTOR to prescriptions list", () => {
    expect(getRedirectPath("DOCTOR")).toBe(routes.doctor.prescriptions);
  });
  it("routes PATIENT to prescriptions list", () => {
    expect(getRedirectPath("PATIENT")).toBe(routes.patient.prescriptions);
  });
  it("falls back to /login for unknown roles", () => {
    // Cast through `unknown` to bypass the Role type — the runtime fallback
    // is what we care about (defence-in-depth against schema drift).
    expect(getRedirectPath("OUTSIDER" as never)).toBe(routes.login);
  });
});

describe("routes (constants)", () => {
  it("exposes the canonical admin URLs", () => {
    expect(routes.admin.metrics).toBe("/admin/metrics");
    expect(routes.admin.users).toBe("/admin/users");
    expect(routes.admin.newUser).toBe("/admin/users/new");
    expect(routes.admin.doctors).toBe("/admin/doctors");
    expect(routes.admin.patients).toBe("/admin/patients");
    expect(routes.admin.prescriptions).toBe("/admin/prescriptions");
  });
  it("exposes the canonical doctor URLs + helpers", () => {
    expect(routes.doctor.prescriptions).toBe("/doctor/prescriptions");
    expect(routes.doctor.newPrescription).toBe("/doctor/prescriptions/new");
    expect(routes.doctor.detail("rx-1")).toBe("/doctor/prescriptions/rx-1");
    expect(routes.doctor.patients).toBe("/doctor/patients");
    expect(routes.doctor.profile).toBe("/doctor/profile");
    expect(routes.doctor.analytics).toBe("/doctor/analytics");
  });
  it("exposes the canonical patient URLs + helpers", () => {
    expect(routes.patient.prescriptions).toBe("/patient/prescriptions");
    expect(routes.patient.profile).toBe("/patient/profile");
  });
  it("login route is /login", () => {
    expect(routes.login).toBe("/login");
  });
});
