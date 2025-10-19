// import { useEffect, useState } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Label } from '@/components/ui/label';
// import { useToast } from '@/hooks/use-toast';
// import { Download } from 'lucide-react';

// interface SummaryRow {
//   order_date: string;
//   day_name: string;
//   ingredient: string;
//   unit: string;
//   total_quantity: number;
// }

// export default function Summary() {
//   const [summary, setSummary] = useState<SummaryRow[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
//   const [dateTo, setDateTo] = useState(
//     new Date(Date.now() + 86400000).toISOString().split('T')[0]
//   );
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchSummary();
//   }, []);

//   const fetchSummary = async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('v_daily_ingredient_summary')
//         .select('*')
//         .gte('order_date', dateFrom)
//         .lte('order_date', dateTo)
//         .order('order_date')
//         .order('ingredient');

//       if (error) throw error;
//       setSummary(data || []);
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportToCSV = () => {
//     const headers = ['Date', 'Day', 'Ingredient', 'Total Quantity', 'Unit'];
//     const rows = summary.map((row) => [
//       row.order_date,
//       row.day_name,
//       row.ingredient,
//       row.total_quantity,
//       row.unit,
//     ]);

//     const csvContent = [
//       headers.join(','),
//       ...rows.map((row) => row.join(',')),
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `ingredient-summary-${dateFrom}-to-${dateTo}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const groupedByDate = summary.reduce((acc, row) => {
//     if (!acc[row.order_date]) {
//       acc[row.order_date] = { day: row.day_name, items: [] };
//     }
//     acc[row.order_date].items.push(row);
//     return acc;
//   }, {} as Record<string, { day: string; items: SummaryRow[] }>);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-foreground">Daily Ingredient Summary</h1>
//         <p className="text-muted-foreground">View aggregated ingredient requirements by date</p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Date Range Filter</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="flex-1 space-y-2">
//               <Label htmlFor="date-from">From</Label>
//               <Input
//                 id="date-from"
//                 type="date"
//                 value={dateFrom}
//                 onChange={(e) => setDateFrom(e.target.value)}
//               />
//             </div>
//             <div className="flex-1 space-y-2">
//               <Label htmlFor="date-to">To</Label>
//               <Input
//                 id="date-to"
//                 type="date"
//                 value={dateTo}
//                 onChange={(e) => setDateTo(e.target.value)}
//               />
//             </div>
//             <div className="flex items-end gap-2">
//               <Button onClick={fetchSummary} disabled={loading}>
//                 {loading ? 'Loading...' : 'Apply Filter'}
//               </Button>
//               <Button
//                 onClick={exportToCSV}
//                 variant="outline"
//                 disabled={summary.length === 0}
//                 className="gap-2"
//               >
//                 <Download className="h-4 w-4" />
//                 CSV
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {loading ? (
//         <div className="text-center py-12 text-muted-foreground">Loading...</div>
//       ) : Object.keys(groupedByDate).length === 0 ? (
//         <Card>
//           <CardContent className="text-center py-12 text-muted-foreground">
//             No data found for the selected date range
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="space-y-6">
//           {Object.entries(groupedByDate).map(([date, { day, items }]) => (
//             <Card key={date}>
//               <CardHeader>
//                 <CardTitle className="text-lg">
//                   {new Date(date).toLocaleDateString('en-US', {
//                     weekday: 'long',
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric',
//                   })}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Ingredient</TableHead>
//                       <TableHead>Total Quantity</TableHead>
//                       <TableHead>Unit</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {items.map((row, idx) => (
//                       <TableRow key={idx}>
//                         <TableCell className="font-medium">{row.ingredient}</TableCell>
//                         <TableCell>{Number(row.total_quantity).toFixed(3)}</TableCell>
//                         <TableCell>{row.unit}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

interface SummaryRow {
  order_date: string;   // YYYY-MM-DD
  day_name: string;     // monday, ...
  ingredient: string;
  unit: string;
  total_quantity: number;
}

/* ---------- fix: helpers de zona horaria (Montreal) ---------- */
const TZ = 'America/Toronto';

// YYYY-MM-DD de "hoy" en Montreal
function todayInTZ(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// YYYY-MM-DD + n días (en Montreal)
function addDaysInTZ(yyyyMmDd: string, days: number): string {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  // trabajar con “fecha pura” a las 12:00 UTC (truco del mediodía)
  const base = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12));
  base.setUTCDate(base.getUTCDate() + days);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(base);
}

// “Saturday, October 18, 2025” para una fecha YYYY-MM-DD
function headingForDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12));
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dt);
}
/* ------------------------------------------------------------- */

export default function Summary() {
  const { toast } = useToast();
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(false);

  // fix: por defecto hoy→mañana (en Montreal)
  const [dateFrom, setDateFrom] = useState<string>(todayInTZ());
  const [dateTo, setDateTo] = useState<string>(addDaysInTZ(todayInTZ(), 1));

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('v_daily_ingredient_summary')
        .select('*')
        .gte('order_date', dateFrom)
        .lte('order_date', dateTo)
        .order('order_date')
        .order('ingredient');

      if (error) throw error;
      setSummary(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Day', 'Ingredient', 'Total Quantity', 'Unit'];
    const rows = summary.map(row => [
      row.order_date,
      row.day_name,
      row.ingredient,
      row.total_quantity,
      row.unit,
    ]);

    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingredient-summary-${dateFrom}-to-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Agrupar por fecha
  const groupedByDate = useMemo(() => {
    const acc: Record<string, { day: string; items: SummaryRow[] }> = {};
    for (const row of summary) {
      if (!acc[row.order_date]) acc[row.order_date] = { day: row.day_name, items: [] };
      acc[row.order_date].items.push(row);
    }
    return acc;
  }, [summary]);

  // fix: autocorrecciones de rango
  const onChangeFrom = (v: string) => {
    setDateFrom(v);
    if (dateTo && v > dateTo) setDateTo(v);
  };
  const onChangeTo = (v: string) => {
    setDateTo(v);
    if (dateFrom && v < dateFrom) setDateFrom(v);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Daily Ingredient Summary</h1>
        <p className="text-muted-foreground">View aggregated ingredient requirements by date</p>
      </div>

      {/* Filtro por fechas */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">From</Label>
              <Input id="date-from" type="date" value={dateFrom} onChange={(e) => onChangeFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">To</Label>
              <Input id="date-to" type="date" value={dateTo} onChange={(e) => onChangeTo(e.target.value)} />
            </div>
            <Button onClick={fetchSummary} disabled={loading}>
              {loading ? 'Loading...' : 'Apply Filter'}
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              disabled={summary.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contenido */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No data found for the selected date range
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, { items }]) => (
            <Card key={date}>
              <CardHeader>
                {/* fix: fecha mostrada con TZ correcta */}
                <CardTitle className="text-lg">{headingForDate(date)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Total Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((row, idx) => (
                      <TableRow key={`${row.ingredient}-${idx}`}>
                        <TableCell className="font-medium">{row.ingredient}</TableCell>
                        <TableCell>{Number(row.total_quantity).toFixed(3)}</TableCell>
                        <TableCell>{row.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
