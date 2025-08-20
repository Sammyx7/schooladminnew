import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  featureName?: string;
}

export function PlaceholderPage({ title, description, featureName }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card className="border"> {/* Added border, shadow-md will come from base Card */}
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
