import { AppIcon } from "@/components/icons/AppIcon";

interface InlineErrorProps {
  message?: string;
}

export function InlineError({ message }: InlineErrorProps) {
  if (!message) return null;

  return (
    <p className="text-xs text-error flex items-center gap-1.5" role="alert">
      <AppIcon name="alertCircle" size="xs" className="text-error" />
      {message}
    </p>
  );
}
