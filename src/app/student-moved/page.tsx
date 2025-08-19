"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, ExternalLink } from 'lucide-react';

export default function StudentMovedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-xl w-full border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" /> Student Portal has moved to Mobile
          </CardTitle>
          <CardDescription>
            For a better experience, the student dashboard is now available exclusively on our mobile app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please download the app from your device's store. If you already have the app, you can close this tab.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="w-full" variant="default" asChild>
              <a href="#" aria-disabled>
                Get on Play Store <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button className="w-full" variant="secondary" asChild>
              <a href="#" aria-disabled>
                Get on App Store <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Need help? Contact school administration for access or support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
