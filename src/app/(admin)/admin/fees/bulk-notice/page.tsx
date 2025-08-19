
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Mail, PlusCircle, Loader2, AlertCircle as AlertIcon, Eye, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BulkFeeNoticeDefinition, BulkFeeNoticeFormValues } from '@/lib/types';
import { BulkFeeNoticeFormSchema } from '@/lib/types';
import { getAdminGeneratedFeeNotices, createAdminBulkFeeNotice, getBatchDistributionStats } from '@/lib/services/feeNoticesService';
import { getSchoolSettings } from '@/lib/services/settingsService';

export default function AdminBulkFeeNoticesPage() {
  // Form + notifications
  const { toast } = useToast();
  const form = useForm<BulkFeeNoticeFormValues>({
    resolver: zodResolver(BulkFeeNoticeFormSchema),
    defaultValues: {
      noticeTitle: '',
      description: '',
      amount: undefined as unknown as number,
      dueDate: undefined,
      targetClasses: '',
      additionalNotes: '',
    },
  });

  // Page state
  const [notices, setNotices] = useState<BulkFeeNoticeDefinition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Status dialog state
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total: number; pending: number; paid: number; overdue: number } | null>(null);

  // Class/Section dropdown state
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [sectionsByClass, setSectionsByClass] = useState<Record<string, string[]>>({});
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [targets, setTargets] = useState<string[]>([]);

  // ...

  useEffect(() => {
    const loadFromSettings = async () => {
      try {
        const s = await getSchoolSettings();
        if (!s) return;
        const fallbackSections = Array.isArray(s.sections) ? s.sections.filter(Boolean).map(x => x.trim()) : ['A','B','C'];
        let classes: string[];
        let byClass: Record<string, string[]> = {};
        if (Array.isArray(s.classes) && s.classes.length > 0) {
          classes = s.classes.slice(); // preserve user-defined order
          const map = s.classSections || {};
          for (const c of classes) {
            const secs = Array.isArray(map[c]) && map[c]!.length > 0 ? map[c]!.filter(Boolean).map(x=>x.trim()) : fallbackSections;
            byClass[c] = ['All Sections', ...secs];
          }
        } else {
          // legacy fallback ordering: common-sense
          const common = ['Nursery','LKG','UKG'];
          const rangeMin = typeof s.classMin === 'number' ? s.classMin : 1;
          const rangeMax = typeof s.classMax === 'number' ? s.classMax : 12;
          const numbered = Array.from({length: Math.max(0, rangeMax - rangeMin + 1)}, (_,i)=>`Class ${i+rangeMin}`);
          classes = [...common, ...numbered];
          for (const c of classes) {
            byClass[c] = ['All Sections', ...fallbackSections];
          }
        }
        setClassOptions(classes);
        setSectionsByClass(byClass);
      } catch (e) {
        console.warn('Failed to load school settings for class/sections', e);
      }
    };
    loadFromSettings();
  }, []);

  // ...

  const handleGenerateNotice = async (values: BulkFeeNoticeFormValues) => {
    setIsSubmitting(true);
    try {
      // ensure targetClasses reflects selected targets
      const finalValues = {
        ...values,
        targetClasses: targets.length > 0 ? targets.join('\n') : values.targetClasses,
      } as BulkFeeNoticeFormValues;
      const created = await createAdminBulkFeeNotice(finalValues);
      setNotices((prev: BulkFeeNoticeDefinition[]) => [created, ...prev]);
      setIsFormDialogOpen(false);
      form.reset();
      toast({ title: 'Bulk Notice Generated', description: 'The fee notice has been generated and distributed.' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate notice.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewStatus = async (notice: BulkFeeNoticeDefinition) => {
    setSelectedBatchId(notice.id);
    setIsStatusDialogOpen(true);
    setStatusLoading(true);
    setStatusError(null);
    try {
      const s = await getBatchDistributionStats(notice.id);
      setStats(s);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load status';
      setStatusError(msg);
    } finally {
      setStatusLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Fee Notices"
        icon={Mail}
        description="Generate and manage fee notices for multiple classes or sections."
        actions={
          <Button onClick={() => { form.reset({ noticeTitle: '', description: '', amount: '' as any, dueDate: undefined, targetClasses: '', additionalNotes: '' }); setIsFormDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate New Bulk Notice
          </Button>
        }
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Previously Generated Bulk Notices</CardTitle>
          <CardDescription>Overview of all bulk fee notices that have been created.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Title</TableHead>
                  <TableHead>Target Classes</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Generated On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Notices</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && notices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Bulk Notices Generated Yet</p>
              <p>Click "Generate New Bulk Notice" to create your first one.</p>
            </div>
          )}

          {!isLoading && !error && notices.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Title</TableHead>
                  <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Target Classes</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Generated</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice: BulkFeeNoticeDefinition) => (
                  <TableRow key={notice.id}>
                    <TableCell className="font-medium">{notice.noticeTitle}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-pre-line">{notice.targetClasses}</TableCell>
                    <TableCell className="text-right font-medium">{notice.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{format(new Date(notice.dueDate), "do MMM, yyyy")}</TableCell>
                    <TableCell>{format(parseISO(notice.generatedDate), "do MMM, yyyy, p")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewStatus(notice)}>
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New Bulk Fee Notice</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a fee notice for multiple classes/sections.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerateNotice)} className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="noticeTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Term 2 Fees 2024-25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the fee notice..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 15000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mb-1.5">Due Date</FormLabel>
                      <DatePicker 
                        date={field.value} 
                        setDate={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                      />
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />
              </div>
              {/* Target selection via dropdowns; keep hidden textarea bound for validation */}
              <FormField
                control={form.control}
                name="targetClasses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Classes/Sections</FormLabel>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div>
                          <FormLabel className="text-xs text-muted-foreground">Class</FormLabel>
                          <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setSelectedSection(''); }}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classOptions.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <FormLabel className="text-xs text-muted-foreground">Section</FormLabel>
                          <Select value={selectedSection} onValueChange={(val) => setSelectedSection(val)} disabled={!selectedClass}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                              {(sectionsByClass[selectedClass] ?? []).map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              if (!selectedClass || !selectedSection) return;
                              const label = `${selectedClass} - ${selectedSection}`;
                              setTargets((prev) => prev.includes(label) ? prev : [...prev, label]);
                              // update hidden field to satisfy form validation
                              const joined = [...new Set([...(targets), label])].join('\n');
                              field.onChange(joined);
                            }}
                            disabled={!selectedClass || !selectedSection}
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setTargets([]);
                              field.onChange('');
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      {targets.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {targets.map((t) => (
                            <div key={t} className="flex items-center gap-2 border rounded-full px-3 py-1 text-sm">
                              <span>{t}</span>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  const next = targets.filter(x => x !== t);
                                  setTargets(next);
                                  field.onChange(next.join('\n'));
                                }}
                                aria-label={`Remove ${t}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Hidden textarea to keep RHF value and validation */}
                      <textarea
                        {...field}
                        className="hidden"
                        readOnly
                        value={field.value || targets.join('\n')}
                      />
                      <FormDescription>
                        Use the dropdowns to add one or more class/section targets.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any other relevant information for parents/students..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Notice
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
    <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Distribution Status</DialogTitle>
          <DialogDescription>
            {selectedBatchId ? `Batch ID: ${selectedBatchId}` : ''}
          </DialogDescription>
        </DialogHeader>
        {statusLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        ) : statusError ? (
          <Alert variant="destructive">
            <AlertIcon className="h-5 w-5" />
            <AlertMsgTitle>Error</AlertMsgTitle>
            <AlertDescription>{statusError}</AlertDescription>
          </Alert>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-md border">
              <p className="text-sm text-muted-foreground">Total Notices</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
            <div className="p-4 rounded-md border">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold text-amber-600">{stats.pending}</p>
            </div>
            <div className="p-4 rounded-md border">
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-semibold text-green-600">{stats.paid}</p>
            </div>
            <div className="p-4 rounded-md border">
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-semibold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);
}
