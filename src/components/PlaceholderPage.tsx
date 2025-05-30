
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  featureName?: string;
}

export function PlaceholderPage({ title, description, icon, featureName }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} icon={icon} />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{featureName || title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section for "{featureName || title}" is under construction.
            Full functionality will be implemented soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
