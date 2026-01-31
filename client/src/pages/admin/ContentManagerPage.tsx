import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useContent, useMutateContent } from '@/hooks/useApi';
import toast from "react-hot-toast";
import { ImageIcon } from 'lucide-react';

type HomeContentValues = {
  heroHeadline?: string;
  heroSubtext?: string;
  intro?: string;
  stats?: {
    yearsExperience?: number;
    rolesHandled?: number;
    researchCount?: number;
  };
};

type AboutContentValues = {
  intro?: string;
  bio?: string;
  roles?: string;
  expertise?: string;
};

const ContentManagerPage = () => {
  const { data: home } = useContent('home');
  const { data: about } = useContent('about');
  const updateHome = useMutateContent('home');
  const updateAbout = useMutateContent('about');

  const [homeImage, setHomeImage] = useState<File | null>(null);
  const [existingHomeImage, setExistingHomeImage] = useState<string | null>(null);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
    /\/api\/?$/,
    ''
  );
  const getImageSrc = (path?: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${apiBaseUrl}${path}`;
  };

  const homeForm = useForm<HomeContentValues>();
  const aboutForm = useForm<AboutContentValues>();

  useEffect(() => {
    if (home) {
      homeForm.reset({
        heroHeadline: home.heroHeadline,
        heroSubtext: home.heroSubtext,
        intro: home.intro,
        stats: {
          yearsExperience: home.stats?.yearsExperience,
          rolesHandled: home.stats?.rolesHandled,
          researchCount: home.stats?.researchCount
        }
      });
      setExistingHomeImage(home.profilePhoto || null);
    }
  }, [home, homeForm]);

  useEffect(() => {
    if (about) {
      aboutForm.reset({
        intro: about.intro,
        bio: about.bio,
        roles: about.roles?.join(', '),
        expertise: about.expertise?.join(', ')
      });
    }
  }, [about, aboutForm]);

  const submitHome = async (values: HomeContentValues) => {
    try {
      const formData = new FormData();
      formData.append('heroHeadline', values.heroHeadline || '');
      formData.append('heroSubtext', values.heroSubtext || '');
      formData.append('intro', values.intro || '');
      
      const stats = values.stats ? { ...values.stats } : undefined;
      if (stats) {
        Object.entries(stats).forEach(([key, value]) => {
          if (value === undefined || Number.isNaN(value as number)) {
            delete stats[key as keyof typeof stats];
          }
        });
        formData.append('stats', JSON.stringify(stats));
      }

      if (homeImage) {
        formData.append('profilePhoto', homeImage);
      }

      await updateHome.mutateAsync(formData);
      toast.success("Home content has been Saved Successfully.");
      setHomeImage(null);
    } catch (error) {
      toast.error("Failed to save home content!");
    }
  };

  const submitAbout = async (values: AboutContentValues) => {
    try {
      await updateAbout.mutateAsync({
        ...values,
        roles: values.roles?.split(',').map((item) => item.trim()),
        expertise: values.expertise?.split(',').map((item) => item.trim())
      });
      toast.success("About content has been Saved Successfully.");
    } catch (error) {
      toast.error("Failed to save about content!");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Home Form */}
      <form
        onSubmit={homeForm.handleSubmit(submitHome)}
        className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-semibold text-dark">Home Page</h2>
          <p className="text-sm text-slate-500">Hero copy, intro, and KPI stats.</p>
        </div>

        <div>
          <input
            placeholder="Hero headline"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
            {...homeForm.register('heroHeadline')}
          />
        </div>

        <div>
          <textarea
            placeholder="Hero subtext"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
            {...homeForm.register('heroSubtext')}
          />
        </div>

        <div>
          <textarea
            placeholder="Intro"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
            {...homeForm.register('intro')}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <input
              type="number"
              placeholder="Years"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
              {...homeForm.register('stats.yearsExperience')}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Roles"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
              {...homeForm.register('stats.rolesHandled')}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Research"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
              {...homeForm.register('stats.researchCount')}
            />
          </div>
        </div>

        {/* Homepage Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Homepage Hero Image
          </label>
          <label className="flex items-center gap-2 border rounded-xl px-3 py-2 border-slate-200 cursor-pointer hover:border-primary transition-colors">
            <ImageIcon size={18} className="text-slate-500" />
            <span className="text-sm text-slate-600 flex-1">
              {homeImage ? homeImage.name : existingHomeImage ? 'Change image' : 'Select image'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setHomeImage(e.target.files?.[0] || null)}
            />
          </label>
          {(homeImage || existingHomeImage) && (
            <div className="mt-3">
              {homeImage ? (
                <div className="flex items-center gap-3">
                  <img
                    src={URL.createObjectURL(homeImage)}
                    alt="Preview"
                    className="h-32 w-32 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{homeImage.name}</p>
                    <p className="text-xs text-slate-500">
                      {(homeImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : existingHomeImage ? (
                <div className="flex items-center gap-3">
                  <img
                    src={getImageSrc(existingHomeImage)}
                    alt="Current"
                    className="h-32 w-32 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />
                  <p className="text-sm text-slate-600">Current image</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-primary py-2 text-sm font-semibold text-white"
          disabled={homeForm.formState.isSubmitting}
        >
          Save Home Content
        </button>
      </form>

      {/* About Form */}
      <form
        onSubmit={aboutForm.handleSubmit(submitAbout)}
        className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-semibold text-dark">About Page</h2>
          <p className="text-sm text-slate-500">Bio, roles, expertise.</p>
        </div>

        <div>
          <textarea
            placeholder="Intro"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
            {...aboutForm.register('intro')}
          />
        </div>

        <div>
          <textarea
            placeholder="Full bio"
            rows={6}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
            {...aboutForm.register('bio')}
          />
        </div>

        <div>
          <textarea
            placeholder="Roles (comma separated)"
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
            {...aboutForm.register('roles')}
          />
        </div>

        <div>
          <textarea
            placeholder="Expertise (comma separated)"
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
            {...aboutForm.register('expertise')}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-primary py-2 text-sm font-semibold text-white"
          disabled={aboutForm.formState.isSubmitting}
        >
          Save About Content
        </button>
      </form>
    </div>
  );
};

export default ContentManagerPage;


