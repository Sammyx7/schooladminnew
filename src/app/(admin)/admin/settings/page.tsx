
"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Loader2, School, SlidersHorizontal } from 'lucide-react';
import { getSchoolSettings, updateSchoolSettings, type SchoolSettings } from '@/lib/services/settingsService';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  // Core settings used across the app
  const [schoolName, setSchoolName] = useState("");
  // Legacy removed from UI; keep internal state only for backward data load if present
  const [classMin, setClassMin] = useState<number>(1);
  const [classMax, setClassMax] = useState<number>(12);
  const [sectionsCsv, setSectionsCsv] = useState<string>("A,B,C");
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New: flexible classes + per-class sections
  const [classesList, setClassesList] = useState<string[]>([]);
  const [classSections, setClassSections] = useState<Record<string, string[]>>({});
  const [classSubjects, setClassSubjects] = useState<Record<string, string[]>>({});
  const [newClassName, setNewClassName] = useState<string>("");
  const [newClassSectionsCsv, setNewClassSectionsCsv] = useState<string>("");
  const [newClassSubjectsCsv, setNewClassSubjectsCsv] = useState<string>("");
  const [subjectsCsv, setSubjectsCsv] = useState<string>("english,hindi,urdu,sanskrit,arabic,maths,science,social science,general knowledge");

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getSchoolSettings()
      .then((s) => {
        if (!mounted || !s) return;
        setSchoolName(s.schoolName || "");
        // Read new structure first; fallback to legacy
        const loadedClasses = Array.isArray(s.classes) && s.classes.length > 0
          ? s.classes
          : (() => {
              const min = typeof s.classMin === 'number' ? s.classMin : 1;
              const max = typeof s.classMax === 'number' ? s.classMax : 12;
              const arr: string[] = [];
              for (let i = min; i <= max; i++) arr.push(`Class ${i}`);
              return arr;
            })();
        const loadedClassSections: Record<string, string[]> = s.classSections || {};
        const loadedClassSubjects: Record<string, string[]> = s.classSubjects || {};
        const sharedSections = Array.isArray(s.sections) ? s.sections : ['A','B','C'];
        const sharedSubjects = Array.isArray(s.subjects) && s.subjects.length > 0 ? s.subjects : ['english','hindi','urdu','sanskrit','arabic','maths','science','social science','general knowledge'];
        // Ensure each class has sections (fallback to shared)
        const merged: Record<string, string[]> = {};
        const mergedSubjects: Record<string, string[]> = {};
        for (const c of loadedClasses) {
          merged[c] = Array.isArray(loadedClassSections[c]) && loadedClassSections[c]!.length > 0
            ? loadedClassSections[c]!
            : sharedSections;
          mergedSubjects[c] = Array.isArray(loadedClassSubjects[c]) && loadedClassSubjects[c]!.length > 0
            ? loadedClassSubjects[c]!
            : sharedSubjects;
        }
        setClassesList(loadedClasses);
        setClassSections(merged);
        setClassSubjects(mergedSubjects);
        // Keep default sections as fallback
        setClassMin(typeof s.classMin === 'number' ? s.classMin : 1);
        setClassMax(typeof s.classMax === 'number' ? s.classMax : 12);
        setSectionsCsv(sharedSections.join(','));
        // Load subjects or default list
        const defaultSubjects = ['english','hindi','urdu','sanskrit','arabic','maths','science','social science','general knowledge'];
        const loadedSubjects = Array.isArray(s.subjects) && s.subjects.length > 0 ? s.subjects : defaultSubjects;
        setSubjectsCsv(loadedSubjects.join(','));
        setAddress(s.address || "");
        setPhone(s.phone || "");
        setEmail(s.email || "");
        setLogoUrl(s.logoUrl || "");
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        toast({ title: 'Failed to load settings', description: msg, variant: 'destructive' });
      })
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [toast]);

  const handleSaveChanges = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const sections = sectionsCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const subjects = subjectsCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (!schoolName.trim()) throw new Error('School name is required');
      if (sections.length === 0) throw new Error('At least one default section is required');
      if (subjects.length === 0) throw new Error('At least one subject is required');
      // No legacy min/max validation anymore

      // Build payload with new structure. Keep legacy fields for compatibility.
      const payload: SchoolSettings = {
        schoolName: schoolName.trim(),
        // keep default sections only as fallback
        sections,
        classes: classesList,
        classSections,
        classSubjects,
        subjects,
        address: address?.trim() || undefined,
        phone: phone?.trim() || undefined,
        email: email?.trim() || undefined,
        logoUrl: logoUrl?.trim() || undefined,
      };

      await updateSchoolSettings(payload);
      // Notify other parts of the app (e.g., TopHeader) to refresh displayed values
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('school-settings-updated'));
      }
      toast({ title: 'Settings Saved', description: 'School settings updated successfully.' });
    } catch (e: any) {
      toast({ title: 'Failed to save', description: e?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Helpers for class + per-class sections editor
  const addClassEntry = () => {
    const name = newClassName.trim();
    if (!name) return;
    if (classesList.includes(name)) {
      setNewClassName("");
      setNewClassSectionsCsv("");
      setNewClassSubjectsCsv("");
      return;
    }
    const secs = newClassSectionsCsv
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const subs = newClassSubjectsCsv
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    setClassesList(prev => [...prev, name]);
    setClassSections(prev => ({ ...prev, [name]: secs.length > 0 ? secs : (sectionsCsv.split(',').map(s=>s.trim()).filter(Boolean)) }));
    setClassSubjects(prev => ({ ...prev, [name]: subs.length > 0 ? subs : (subjectsCsv.split(',').map(s=>s.trim()).filter(Boolean)) }));
    setNewClassName("");
    setNewClassSectionsCsv("");
    setNewClassSubjectsCsv("");
  };
  const removeClassEntry = (name: string) => {
    setClassesList(prev => prev.filter(c => c !== name));
    setClassSections(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
    setClassSubjects(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };
  const updateClassSections = (name: string, csv: string) => {
    const secs = csv.split(',').map(s=>s.trim()).filter(Boolean);
    setClassSections(prev => ({ ...prev, [name]: secs }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        icon={Settings}
        description="Manage school name, classes range, sections and basic info used across the app."
      />

      <form onSubmit={handleSaveChanges}>
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><School className="h-5 w-5 text-primary"/> General School Information</CardTitle>
            <CardDescription>Basic details about the institution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g., Greenwood High"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, State" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +91 98765 43210" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@school.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-primary"/> Academic Structure</CardTitle>
            <CardDescription>Define classes and sections used across the app. You can use custom class names (e.g., Nursery, LKG) and assign sections per class.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Default sections fallback */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-1">
                <Label htmlFor="sections">Default Sections (comma-separated)</Label>
                <Input id="sections" value={sectionsCsv} onChange={(e) => setSectionsCsv(e.target.value)} placeholder="A,B,C" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                <Input id="subjects" value={subjectsCsv} onChange={(e) => setSubjectsCsv(e.target.value)} placeholder="english,hindi,urdu,sanskrit,arabic,maths,science,social science,general knowledge" />
              </div>
            </div>

            <Separator className="my-2" />

            {/* New: class list editor */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="newClassName">Add Class</Label>
                  <Input id="newClassName" placeholder="e.g., Nursery" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newClassSections">Sections for this class (comma-separated)</Label>
                  <Input id="newClassSections" placeholder="e.g., A,B" value={newClassSectionsCsv} onChange={(e) => setNewClassSectionsCsv(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newClassSubjects">Subjects for this class (comma-separated)</Label>
                  <Input id="newClassSubjects" placeholder="e.g., english,maths" value={newClassSubjectsCsv} onChange={(e) => setNewClassSubjectsCsv(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={addClassEntry}>Add</Button>
              </div>

              {classesList.length > 0 && (
                <div className="space-y-2">
                  {classesList.map((c, idx) => (
                    <div key={c} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end border rounded-md p-3">
                      <div>
                        <Label>Class</Label>
                        <div className="h-10 flex items-center px-3 rounded-md border bg-muted/20 text-sm">{c}</div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Sections (comma-separated)</Label>
                        <Input
                          value={(classSections[c] || []).join(',')}
                          onChange={(e) => updateClassSections(c, e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Subjects (comma-separated)</Label>
                        <Input
                          value={(classSubjects[c] || []).join(',')}
                          onChange={(e) => {
                            const csv = e.target.value;
                            setClassSubjects(prev => ({ ...prev, [c]: csv.split(',').map(s=>s.trim()).filter(Boolean) }));
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => removeClassEntry(c)}>Remove</Button>
                      </div>
                      <div className="flex gap-2 md:justify-end">
                        <Button type="button" variant="secondary" disabled={idx === 0} onClick={() => {
                          setClassesList(prev => {
                            const copy = [...prev];
                            const [item] = copy.splice(idx, 1);
                            copy.splice(idx - 1, 0, item);
                            return copy;
                          });
                        }}>Up</Button>
                        <Button type="button" variant="secondary" disabled={idx === classesList.length - 1} onClick={() => {
                          setClassesList(prev => {
                            const copy = [...prev];
                            const [item] = copy.splice(idx, 1);
                            copy.splice(idx + 1, 0, item);
                            return copy;
                          });
                        }}>Down</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <CardFooter className="mt-6 px-0">
          <Button type="submit" disabled={isSaving || isLoading} className="ml-auto">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Saving...' : (isLoading ? 'Loading...' : 'Save Changes')}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}

