import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContent, useMutateContent } from '@/hooks/useApi';
import { toApiError } from '@/api/client';
import { resolveMediaUrl } from '@/lib/media';
import { contentHomeSchema, contentAboutSchema } from '@/lib/schemas';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { SkeletonText } from '@/components/ui/skeleton';

type HomeValues = z.infer<typeof contentHomeSchema>;
type AboutValues = z.infer<typeof contentAboutSchema>;

const HomeForm = () => {
  const { data, isLoading } = useContent('home');
  const mutate = useMutateContent('home');
  const [photo, setPhoto] = useState<File | null>(null);

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const form = useForm<HomeValues>({
    resolver: zodResolver(contentHomeSchema),
    values: {
      heroHeadline: data?.heroHeadline ?? '',
      heroSubtext: data?.heroSubtext ?? '',
      intro: data?.intro ?? '',
      yearsExperience: data?.stats?.yearsExperience,
      rolesHandled: data?.stats?.rolesHandled,
      researchCount: data?.stats?.researchCount,
      countriesImpacted: data?.stats?.countriesImpacted,
    },
  });

  const onSubmit = async (values: HomeValues) => {
    const fd = new FormData();
    fd.append('heroHeadline', values.heroHeadline ?? '');
    fd.append('heroSubtext', values.heroSubtext ?? '');
    fd.append('intro', values.intro ?? '');
    fd.append(
      'stats',
      JSON.stringify({
        yearsExperience: values.yearsExperience,
        rolesHandled: values.rolesHandled,
        researchCount: values.researchCount,
        countriesImpacted: values.countriesImpacted,
      }),
    );
    if (photo) fd.append('profilePhoto', photo);
    try {
      await mutate.mutateAsync(fd);
      toast.success('Home content saved');
      setPhoto(null);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  if (isLoading) return <SkeletonText lines={8} className="rounded-2xl border border-border bg-card p-6" />;

  const currentPhoto = preview || resolveMediaUrl(data?.profilePhoto);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div>
        <Label htmlFor="heroHeadline">Hero headline</Label>
        <Input id="heroHeadline" error={form.formState.errors.heroHeadline?.message} {...form.register('heroHeadline')} />
      </div>
      <div>
        <Label htmlFor="heroSubtext">Hero subtext</Label>
        <Textarea id="heroSubtext" rows={3} error={form.formState.errors.heroSubtext?.message} {...form.register('heroSubtext')} />
      </div>
      <div>
        <Label htmlFor="intro">Intro</Label>
        <Textarea id="intro" rows={3} error={form.formState.errors.intro?.message} {...form.register('intro')} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <Label htmlFor="yearsExperience">Years</Label>
          <Input id="yearsExperience" type="number" {...form.register('yearsExperience')} />
        </div>
        <div>
          <Label htmlFor="rolesHandled">Roles</Label>
          <Input id="rolesHandled" type="number" {...form.register('rolesHandled')} />
        </div>
        <div>
          <Label htmlFor="researchCount">Research</Label>
          <Input id="researchCount" type="number" {...form.register('researchCount')} />
        </div>
        <div>
          <Label htmlFor="countriesImpacted">Countries</Label>
          <Input id="countriesImpacted" type="number" {...form.register('countriesImpacted')} />
        </div>
      </div>

      <div>
        <Label>Portrait photo</Label>
        <div className="flex items-center gap-4">
          {currentPhoto ? (
            <img src={currentPhoto} alt="" className="h-20 w-20 rounded-xl border border-border object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
              <ImagePlus size={18} />
            </div>
          )}
          <label className="cursor-pointer rounded-lg border border-input bg-surface px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            {photo ? photo.name : 'Choose image'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Spinner /> : <Save size={16} />}
        Save home content
      </Button>
    </form>
  );
};

const AboutForm = () => {
  const { data, isLoading } = useContent('about');
  const mutate = useMutateContent('about');

  const form = useForm<AboutValues>({
    resolver: zodResolver(contentAboutSchema),
    values: {
      intro: data?.intro ?? '',
      bio: data?.bio ?? '',
      roles: data?.roles?.join(', ') ?? '',
      expertise: data?.expertise?.join(', ') ?? '',
    },
  });

  const onSubmit = async (values: AboutValues) => {
    const toList = (v?: string) =>
      (v ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    try {
      await mutate.mutateAsync({
        intro: values.intro,
        bio: values.bio,
        roles: toList(values.roles),
        expertise: toList(values.expertise),
      });
      toast.success('About content saved');
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  if (isLoading) return <SkeletonText lines={8} className="rounded-2xl border border-border bg-card p-6" />;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div>
        <Label htmlFor="about-intro">Intro</Label>
        <Textarea id="about-intro" rows={3} {...form.register('intro')} />
      </div>
      <div>
        <Label htmlFor="bio">Full biography</Label>
        <Textarea id="bio" rows={7} {...form.register('bio')} />
      </div>
      <div>
        <Label htmlFor="roles">Key roles (comma separated)</Label>
        <Textarea id="roles" rows={2} {...form.register('roles')} />
      </div>
      <div>
        <Label htmlFor="expertise">Areas of expertise (comma separated)</Label>
        <Textarea id="expertise" rows={2} {...form.register('expertise')} />
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Spinner /> : <Save size={16} />}
        Save about content
      </Button>
    </form>
  );
};

const ContentManagerPage = () => (
  <div className="max-w-3xl space-y-8">
    <Helmet>
      <title>Content · Admin</title>
    </Helmet>
    <PageHeader eyebrow="Manage" title="Site content" description="Edit the public homepage and about page." />

    <Tabs defaultValue="home">
      <TabsList>
        <TabsTrigger value="home">Home page</TabsTrigger>
        <TabsTrigger value="about">About page</TabsTrigger>
      </TabsList>
      <TabsContent value="home">
        <HomeForm />
      </TabsContent>
      <TabsContent value="about">
        <AboutForm />
      </TabsContent>
    </Tabs>
  </div>
);

export default ContentManagerPage;
