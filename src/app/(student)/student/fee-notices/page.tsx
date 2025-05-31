
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import Image from 'next/image'; // Added for UPI QR code placeholder
import { PageHeader } from '@/components/layout/PageHeader';
import { Receipt, Loader2, AlertCircle as AlertIcon, CreditCard, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { FeeNotice, FeeNoticeStatus } from '@/lib/types';
import { getStudentFeeNotices } from '@/lib/services/studentService';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs

export default function StudentFeeNoticesPage() {
  const [feeNotices, setFeeNotices] = useState<FeeNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedNoticeForPayment, setSelectedNoticeForPayment] = useState<FeeNotice | null>(null);
  const [isPaymentDialogVisible, setIsPaymentDialogVisible] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStudentFeeNotices("S10234"); 
        setFeeNotices(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching fee notices.");
        }
        console.error("Failed to fetch fee notices:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePayNowClick = (notice: FeeNotice) => {
    setSelectedNoticeForPayment(notice);
    setIsPaymentDialogVisible(true);
  };

  const handleConfirmMockPayment = async () => {
    if (!selectedNoticeForPayment) return;

    setIsProcessingPayment(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    setFeeNotices(prevNotices =>
      prevNotices.map(notice =>
        notice.id === selectedNoticeForPayment.id
          ? { ...notice, status: 'Paid' as FeeNoticeStatus }
          : notice
      )
    );

    toast({
      title: "Payment Successful (Demo)",
      description: `Payment for "${selectedNoticeForPayment.title}" has been processed.`,
      action: <CheckCircle className="h-5 w-5 text-green-500" />,
    });

    setIsProcessingPayment(false);
    setIsPaymentDialogVisible(false);
    setSelectedNoticeForPayment(null);
  };
  
  const getStatusBadgeClassName = (status: FeeNoticeStatus): string => {
    switch (status) {
        case 'Paid':
            return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700';
        case 'Pending':
            return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-400 dark:border-yellow-700';
        case 'Overdue':
            return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-700';
        default:
            return '';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Fee Notices"
        icon={Receipt}
        description="View your current and past fee notices, payment status, and dues."
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">All Fee Notices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive" className="mt-4">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Fetching Fee Notices</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && feeNotices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Fee Notices Found</p>
              <p>It looks like all your payments are up to date, or there are no notices to display at the moment.</p>
            </div>
          )}

          {!isLoading && !error && feeNotices.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Notice Title</TableHead>
                  <TableHead className="w-[40%] md:w-[30%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs uppercase font-medium text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeNotices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell className="font-medium hidden md:table-cell">{notice.title}</TableCell>
                    <TableCell>
                        <span className="md:hidden font-medium">{notice.title}</span>
                        {notice.description && <p className="text-xs text-muted-foreground mt-0.5 md:mt-0">{notice.description}</p>}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {notice.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{format(parseISO(notice.dueDate), "do MMMM, yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClassName(notice.status)}>
                        {notice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {notice.status === 'Pending' || notice.status === 'Overdue' ? (
                        <Button
                          size="sm"
                          onClick={() => handlePayNowClick(notice)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay Now
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No actions</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedNoticeForPayment && (
        <AlertDialog open={isPaymentDialogVisible} onOpenChange={setIsPaymentDialogVisible}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Payment for: {selectedNoticeForPayment.title}</AlertDialogTitle>
              <AlertDialogDescription>
                Amount Due: ₹{selectedNoticeForPayment.amount.toLocaleString('en-IN')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Tabs defaultValue="card" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="card">Card</TabsTrigger>
                <TabsTrigger value="upi">UPI</TabsTrigger>
              </TabsList>
              <TabsContent value="card">
                <div className="space-y-4 py-4">
                  <p className="text-xs text-muted-foreground">This is a mock payment screen. No real transaction will occur.</p>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="•••• •••• •••• ••••" disabled />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry (MM/YY)</Label>
                      <Input id="expiryDate" placeholder="MM/YY" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="•••" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardHolderName">Card Holder Name</Label>
                    <Input id="cardHolderName" placeholder="Name on Card" disabled />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="upi">
                <div className="space-y-4 py-4">
                   <p className="text-xs text-muted-foreground">This is a mock UPI payment. Scan the QR or enter UPI ID.</p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-2 border rounded-md bg-background">
                      <Image 
                        src="https://placehold.co/160x160.png" // Placeholder QR
                        alt="Mock UPI QR Code" 
                        width={160} 
                        height={160}
                        data-ai-hint="qr code" 
                      />
                    </div>
                    <div className="w-full space-y-2">
                      <Label htmlFor="upiId">Or Enter UPI ID</Label>
                      <Input id="upiId" placeholder="yourname@upi" disabled />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessingPayment}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmMockPayment} disabled={isProcessingPayment}>
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm & Pay (Demo)"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

