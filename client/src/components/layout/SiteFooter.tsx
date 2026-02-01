import { Facebook, Linkedin, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const SiteFooter = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Nour Haji Osman. All rights reserved.</p>

        <div className="flex items-center gap-3 text-xs">
          <p>Follow Us:</p>

          <a href="http://facebook.com/nuurhaji.osman" className="hover:text-slate-700 transition">
            <Facebook size={16} />
          </a>
          <a href="http://linkedin.com/in/nor-haji-osman-4b9365151/" className="hover:text-slate-700 transition">
            <Linkedin size={16} />
          </a>
          <a href="http://wa.me/+252615213035" className="hover:text-slate-700 transition">
            <FaWhatsapp size={16} />
          </a>
          <a href="mailto:norhaji@just.edu.so" className="hover:text-slate-700 transition">
            <Mail size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;





