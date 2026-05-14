import type { MetricsResponseDto } from "@/lib/api/generated/schemas";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopDoctorsTableProps {
  doctors: MetricsResponseDto["topDoctors"];
}

export function TopDoctorsTable({ doctors }: TopDoctorsTableProps) {
  if (!doctors || doctors.length === 0) return null;

  return (
    <Card className="card-glass mt-6 p-0 gap-0 overflow-hidden">
      <div className="p-6 border-b border-outline-variant/30">
        <h3 className="text-xl font-semibold text-primary">Top Doctors</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-b border-outline-variant/20">
            <TableHead className="uppercase tracking-wider text-xs">
              Rank
            </TableHead>
            <TableHead className="uppercase tracking-wider text-xs">
              Author ID
            </TableHead>
            <TableHead className="uppercase tracking-wider text-xs text-right">
              Prescriptions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor, index) => (
            <TableRow
              key={doctor.authorId}
              className="hover:bg-surface-container-low transition-colors border-b border-outline-variant/10"
            >
              <TableCell>
                <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-on-surface-variant font-mono">
                {doctor.authorId}
              </TableCell>
              <TableCell className="text-sm font-semibold text-primary tabular-nums text-right">
                {doctor.count}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
