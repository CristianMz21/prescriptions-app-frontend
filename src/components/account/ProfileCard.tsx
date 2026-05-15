"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import type { UserProfileResponseDto } from "@/lib/api/generated/schemas";
import { useUsersUpdateMe } from "@/lib/api/generated/prescriptionManagementAPI";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/notifications";
import { qk } from "@/lib/api/queryKeys";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  phone: z.string().max(32).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileCardProps {
  user: UserProfileResponseDto;
  /** Extra fields rendered in a definition list below the header. */
  extras?: Array<{ label: string; value: ReactNode }>;
  /** Footer slot for actions (e.g. theme toggle). */
  actions?: ReactNode;
}

export function ProfileCard({ user, extras = [], actions }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
    },
  });

  const updateMe = useUsersUpdateMe({
    mutation: {
      onSuccess: () => {
        notify.success("Profile updated");
        setIsEditing(false);
        void queryClient.invalidateQueries({ queryKey: qk.auth.profile() });
      },
      onError: (err) => notify.apiError(err, "Failed to update profile"),
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateMe.mutate({
      data: {
        name: values.name,
        phone: values.phone || undefined,
      },
    });
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <Card className="card-glass p-4 md:p-6 gap-6 max-w-4xl rounded-2xl border border-outline-variant/30">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div className="flex flex-col gap-1">
          <span className="label-uppercase tracking-widest text-[0.65rem]">
            Operator Profile
          </span>
          <h2 className="text-2xl font-bold text-primary tracking-tight">
            {user.name}
          </h2>
          <span className="text-sm font-mono text-on-surface-variant">
            {user.email}
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="uppercase tracking-widest text-[0.65rem]"
            >
              {user.themePreference}
            </Badge>
            <Badge
              variant="outline"
              className="uppercase tracking-widest text-[0.65rem]"
            >
              Since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </Badge>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col sm:items-end gap-2">
          <Badge
            variant="outline"
            className="uppercase tracking-widest text-[0.7rem]"
          >
            {user.role}
          </Badge>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => setIsEditing(true)}
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="label-uppercase">
                Full Name
              </Label>
              <Input
                id="name"
                {...register("name")}
                className={errors.name ? "border-error" : ""}
              />
              {errors.name && (
                <span className="text-xs text-error">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="label-uppercase">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+54 11 1234-5678"
                {...register("phone")}
                className={errors.phone ? "border-error" : ""}
              />
              {errors.phone && (
                <span className="text-xs text-error">
                  {errors.phone.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="w-full sm:w-auto"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          <Field label="Phone number" value={user.phone} />
          <Field
            label="Account ID"
            value={<code className="text-xs font-mono">{user.id}</code>}
          />
          <Field label="Theme preference" value={user.themePreference} />
          <Field
            label="Member since"
            value={new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
          {extras.map((e) => (
            <Field key={e.label} label={e.label} value={e.value} />
          ))}
        </dl>
      )}

      {actions || isEditing ? (
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-outline-variant/30 pt-4">
          {!isEditing && actions}
        </div>
      ) : null}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="label-uppercase tracking-widest text-[0.65rem] text-on-surface-variant">
        {label}
      </dt>
      <dd className="text-base text-on-surface font-medium">{value ?? "—"}</dd>
    </div>
  );
}
