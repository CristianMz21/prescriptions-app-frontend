"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type {
  PrescriptionItemDto,
  UserEntity,
} from "@/lib/api/generated/schemas";
import {
  usePrescriptionsCreate,
  useUsersFindAllPatients,
  usersFindOne,
} from "@/lib/api/generated/prescriptionManagementAPI";
import { ApiError } from "@/lib/api/client";
import { routes } from "@/lib/routes";
import { notify } from "@/lib/notifications";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PrescriptionItemFormState = PrescriptionItemDto & { localId: string };

const createEmptyItem = (): PrescriptionItemFormState => ({
  name: "",
  dosage: "",
  quantity: undefined,
  unit: "",
  instructions: "",
  // Stable React key for client-side form rows. Using crypto.randomUUID()
  // closes Sonar S2245 (weak PRNG hotspot) — Math.random() is fine for UI
  // keys but the global rule prefers the CSPRNG everywhere.
  localId: globalThis.crypto.randomUUID(),
});

const UNIT_OPTIONS = [
  "cápsulas",
  "comprimidos",
  "tabletas",
  "ml",
  "mg",
  "gotas",
  "sobres",
  "ampollas",
  "parches",
  "aplicaciones",
] as const;

const DEBOUNCE_MS = 300;
const PATIENT_LIMIT = 20;
const MIN_SEARCH_CHARS = 2;

export function CreatePrescriptionForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [notes, setNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [items, setItems] = useState<PrescriptionItemFormState[]>([
    createEmptyItem(),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isResolvingPatient, setIsResolvingPatient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const [selectedPatientSnapshot, setSelectedPatientSnapshot] =
    useState<UserEntity | null>(null);
  const [showPatientResults, setShowPatientResults] = useState(true);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const trimmedSearch = debouncedSearch.trim();
  const canSearchPatients = trimmedSearch.length >= MIN_SEARCH_CHARS;

  const queryParams = useMemo(
    () => ({
      limit: PATIENT_LIMIT,
      page: patientPage,
      ...(canSearchPatients ? { q: trimmedSearch } : {}),
    }),
    [canSearchPatients, patientPage, trimmedSearch],
  );

  const {
    data: patientsData,
    isLoading: isSearching,
    isError: searchError,
  } = useUsersFindAllPatients(queryParams, {
    query: { enabled: canSearchPatients },
  });

  const patients: UserEntity[] = patientsData?.data ?? [];

  const createMutation = usePrescriptionsCreate({
    mutation: {
      onSuccess: async () => {
        notify.success("Prescription issued", "The prescription was created.");
        await queryClient.invalidateQueries();
        router.push(routes.doctor.prescriptions);
      },
      onError: (err: ApiError) => {
        notify.apiError(err, "Failed to create prescription");
        setError(err.message || "Failed to create prescription");
      },
    },
  });

  const handleAddItem = () => setItems((prev) => [...prev, createEmptyItem()]);
  const handleRemoveItem = (index: number) =>
    setItems((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  const updateItem = (
    index: number,
    field: keyof PrescriptionItemDto,
    value: string | number | undefined,
  ) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedUserId) {
      setError("Please select a patient");
      return;
    }
    const validItems = items
      .filter((item) => item.name.trim() !== "" && item.unit.trim() !== "")
      .map(({ localId: _, ...rest }) => rest);
    if (validItems.length === 0) {
      setError("At least one medication with name and unit is required");
      return;
    }

    setIsResolvingPatient(true);
    let patientProfileId: string;
    try {
      const fullUser = await usersFindOne(selectedUserId);
      if (!fullUser.patient?.id) {
        setError("Selected user has no patient profile");
        return;
      }
      patientProfileId = fullUser.patient.id;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resolve patient",
      );
      return;
    } finally {
      setIsResolvingPatient(false);
    }

    createMutation.mutate({
      data: {
        patientId: patientProfileId,
        items: validItems,
        notes: notes || undefined,
        expiryDate: expiryDate || undefined,
      },
    });
  };

  const isSubmitting = createMutation.isPending || isResolvingPatient;
  const selectedPatient =
    patients.find((p) => p.id === selectedUserId) ?? selectedPatientSnapshot;

  return (
    <div className="mx-auto max-w-5xl px-3 md:px-6 lg:px-8 py-4 md:py-6">
      <div className="mb-6 md:mb-8">
        <Link
          href={routes.doctor.prescriptions}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider w-fit mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Prescriptions
        </Link>
        <h2 className="text-3xl font-bold text-primary tracking-tight">
          Issue New Prescription
        </h2>
        <p className="text-base text-on-surface-variant mt-2">
          Complete the form below to authorize medication.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        <Card className="card-glass p-4 md:p-6 gap-0 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="mb-6 border-b border-outline-variant/50 pb-3">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">
                person_search
              </span>
              Patient Selection
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Search by name or email and select the patient before issuing.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 rounded-xl border border-outline-variant/25 bg-surface-container-lowest/30 p-3 md:p-4">
            <Label htmlFor="patient" className="label-uppercase">
              Patient
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg pointer-events-none">
                search
              </span>
              <Input
                id="patient-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPatientPage(1);
                  setShowPatientResults(true);
                }}
                placeholder="Search by patient name or email..."
                className="pl-10 py-3 text-base border-outline-variant/60 focus-visible:ring-1 focus-visible:ring-primary/60"
                autoComplete="off"
              />
              {isSearching ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant animate-spin">
                  progress_activity
                </span>
              ) : null}
            </div>

            <div className="rounded-md border border-outline-variant/30 overflow-hidden bg-surface-container-lowest/20">
              {!canSearchPatients ? (
                <p className="px-3 py-3 text-sm text-on-surface-variant">
                  Type at least {MIN_SEARCH_CHARS} characters.
                </p>
              ) : searchError ? (
                <p className="px-3 py-3 text-sm text-error">
                  Failed to load patients.
                </p>
              ) : !showPatientResults ? (
                <div className="px-3 py-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-on-surface-variant">
                    Patient selected. Continue with medication details.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPatientResults(true)}
                  >
                    Change
                  </Button>
                </div>
              ) : patients.length === 0 ? (
                <p className="px-3 py-3 text-sm text-on-surface-variant">
                  No patients found.
                </p>
              ) : (
                <ul className="max-h-64 overflow-y-auto divide-y divide-outline-variant/20">
                  {patients.map((patient) => {
                    const selected = selectedUserId === patient.id;
                    return (
                      <li key={patient.id}>
                        <button
                          type="button"
                          className={`w-full text-left px-3 py-2.5 transition-colors hover:bg-surface-variant/20 ${
                            selected ? "bg-primary/10" : ""
                          }`}
                          onClick={() => {
                            setSelectedUserId(patient.id);
                            setSelectedPatientSnapshot(patient);
                            setError(null);
                            setShowPatientResults(false);
                            window.requestAnimationFrame(() => {
                              const medInput =
                                document.getElementById("med-name-0");
                              medInput?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                              medInput?.focus();
                            });
                          }}
                        >
                          <div className="font-medium text-primary">
                            {patient.name}
                          </div>
                          <div className="text-xs text-on-surface-variant font-mono">
                            {patient.email}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {showPatientResults && canSearchPatients && patientsData?.meta ? (
                <>
                  <Separator />
                  <div className="flex items-center justify-between gap-2 p-2.5">
                    <p className="text-xs text-on-surface-variant">
                      {patientsData.meta.total.toLocaleString()} results · page{" "}
                      {patientsData.meta.page}/{patientsData.meta.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={patientPage <= 1 || isSearching}
                        onClick={() =>
                          setPatientPage((p) => Math.max(1, p - 1))
                        }
                      >
                        Prev
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={
                          patientPage >= patientsData.meta.totalPages ||
                          isSearching
                        }
                        onClick={() => setPatientPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            {selectedPatient ? (
              <div className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-primary flex items-center justify-between gap-3">
                <span>
                  Selected:{" "}
                  <span className="font-semibold">{selectedPatient.name}</span>{" "}
                  <span className="text-on-surface-variant">
                    ({selectedPatient.email})
                  </span>
                </span>
                <button
                  type="button"
                  className="text-[11px] font-semibold underline underline-offset-2 hover:text-primary/80"
                  onClick={() => setShowPatientResults(true)}
                >
                  Change patient
                </button>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">
                Tip: search by name/email and pick from live suggestions.
              </p>
            )}
            {patientsData?.meta &&
              patientsData.data.length === 0 &&
              debouncedSearch.trim().length > 0 && (
                <p className="text-xs text-on-surface-variant mt-1">
                  No patients matching &ldquo;{debouncedSearch}&rdquo;
                </p>
              )}
          </div>
        </Card>

        <Card className="card-glass p-4 md:p-6 gap-0 rounded-2xl border border-outline-variant/30">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 border-b border-outline-variant/50 pb-2 mb-6">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">
                vaccines
              </span>
              Medication Details
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddItem}
              className="w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <MedicationItemRow
                key={item.localId}
                index={index}
                item={item}
                onChange={(field, value) => updateItem(index, field, value)}
                onRemove={() => handleRemoveItem(index)}
                canRemove={items.length > 1}
              />
            ))}
          </div>
        </Card>

        <Card className="card-glass p-4 md:p-6 gap-0 rounded-2xl border border-outline-variant/30">
          <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/50 pb-2">
            <span className="material-symbols-outlined text-on-surface-variant">
              note_alt
            </span>
            Clinical Notes &amp; Authorization
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes" className="label-uppercase">
                Internal Notes (not printed on script)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add diagnosis codes or internal context..."
                rows={4}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expiryDate" className="label-uppercase">
                Expiry Date (Optional)
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-on-surface-variant">
                The prescription will be considered invalid after this date.
              </p>
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              data-testid="form-error"
              className="mb-4 p-3 bg-error-container/10 border border-error rounded text-sm text-error flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
          ) : null}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-outline-variant/30">
            <Link
              href={routes.doctor.prescriptions}
              className={
                buttonVariants({ variant: "outline" }) + " w-full sm:w-auto"
              }
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedUserId}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  {isResolvingPatient ? "Resolving patient…" : "Creating…"}
                </>
              ) : (
                "Issue Prescription"
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

interface MedicationItemRowProps {
  index: number;
  item: PrescriptionItemDto;
  onChange: (
    field: keyof PrescriptionItemDto,
    value: string | number | undefined,
  ) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function MedicationItemRow({
  index,
  item,
  onChange,
  onRemove,
  canRemove,
}: MedicationItemRowProps) {
  const ids = {
    name: `med-name-${index}`,
    dosage: `med-dosage-${index}`,
    unit: `med-unit-${index}`,
    quantity: `med-quantity-${index}`,
    instructions: `med-instructions-${index}`,
  };
  return (
    <div
      data-testid="medication-item"
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 md:p-4 relative group"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        disabled={!canRemove}
        className="absolute top-2 right-2"
        aria-label="Remove medication"
      >
        <span className="material-symbols-outlined">close</span>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mb-4 pr-8">
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <Label htmlFor={ids.name} className="label-uppercase">
            Medication name
          </Label>
          <Input
            id={ids.name}
            value={item.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="e.g., Amoxicillin"
            required
          />
        </div>
        <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-1.5">
          <Label
            htmlFor={ids.unit}
            className="label-uppercase flex justify-between"
          >
            Unit{" "}
            <span className="text-[0.6rem] text-primary lowercase font-normal">
              (required)
            </span>
          </Label>
          <Select
            value={item.unit || "__NONE__"}
            onValueChange={(v) =>
              onChange("unit", v === "__NONE__" ? "" : (v ?? ""))
            }
          >
            <SelectTrigger
              id={ids.unit}
              className={!item.unit ? "border-primary/50" : ""}
            >
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__NONE__">—</SelectItem>
              {UNIT_OPTIONS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-5 lg:col-span-3 flex flex-col gap-1.5">
          <Label htmlFor={ids.dosage} className="label-uppercase">
            Dosage
          </Label>
          <Input
            id={ids.dosage}
            value={item.dosage || ""}
            onChange={(e) => onChange("dosage", e.target.value || undefined)}
            placeholder="e.g., 500mg"
          />
        </div>
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-1.5">
          <Label htmlFor={ids.quantity} className="label-uppercase">
            Dispense quantity
          </Label>
          <Input
            id={ids.quantity}
            type="number"
            value={item.quantity ?? ""}
            onChange={(e) =>
              onChange(
                "quantity",
                e.target.value ? parseInt(e.target.value, 10) : undefined,
              )
            }
            placeholder="Qty"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={ids.instructions} className="label-uppercase">
          Patient instructions (SIG)
        </Label>
        <Input
          id={ids.instructions}
          value={item.instructions || ""}
          onChange={(e) =>
            onChange("instructions", e.target.value || undefined)
          }
          placeholder="e.g., Take one tablet by mouth twice daily"
        />
      </div>
    </div>
  );
}
