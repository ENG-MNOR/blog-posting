import { Mail } from 'lucide-react';
import { FaWhatsapp, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';

const socials = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/nuurhaji.osman',
    icon: FaFacebookF,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/nor-haji-osman-4b9365151/',
    icon: FaLinkedinIn,
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/252615213035',
    icon: FaWhatsapp,
  },
  {
    label: 'Email',
    href: 'mailto:norhaji@just.edu.so',
    icon: Mail,
  },
];

const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-surface transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-border">
            <img src="/logo.jpeg" alt="" className="h-full w-full scale-[1.35] object-contain" />
          </span>
          <div>
            <p className="font-display text-base text-foreground">Nor Haji Osman</p>
            <p className="mt-0.5 text-xs">
              © {new Date().getFullYear()} · Strengthening health systems across the Horn of Africa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {socials.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label={label}
              className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Icon size={15} aria-hidden />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
