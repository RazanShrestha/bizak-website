import svgPaths from "../../imports/svg-eyvfmiiac4";
import bizakLogoFooter from "../../assets/bizaklogo-footer.png";

const footerLinks = [
  {
    heading: 'Product',
    items: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Integrations', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    items: [
      { label: 'Documentation', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Blog', href: '/blog' },
      { label: 'Customer Stories', href: '#' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#121212] border-t border-white/5">
      <div className="max-w-[1320px] mx-auto px-5 py-16">
        <div className="flex flex-col lg:flex-row gap-12 justify-between">
          {/* Brand column */}
          <div className="lg:w-[464px]">
            <div className="flex items-center gap-2 mb-6">
              <img src={bizakLogoFooter} alt="Bizak Logo" />
              {/* <span className="text-white tracking-tight" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20 }}>Bizak</span> */}
            </div>
            <p className="text-white/40" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.625, maxWidth: 310 }}>
              Empowering modern businesses with an all-in-one ERP that is flexible, powerful, and easy to use.
            </p>
          </div>

          {/* Links columns */}
          <div className="flex flex-col sm:flex-row gap-12">
            {footerLinks.map((col) => (
              <div key={col.heading} className="w-52">
                <h5 className="text-white uppercase tracking-wide mb-6"
                  style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, letterSpacing: '0.55px' }}>
                  {col.heading}
                </h5>
                <ul className="space-y-4">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="text-white/40 hover:text-white/70 transition-colors"
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14 }}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-white/5">
          <p className="text-white/20" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 11 }}>
            © 2024 BIZAK SYSTEMS INC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            {/* Social icons */}
            <a href="#" className="text-white/20 hover:text-white/50 transition-colors">
              <svg width="19" height="19" viewBox="0 0 18.9999 18.9999" fill="none">
                <path d={svgPaths.p1a75c680} fill="currentColor" />
              </svg>
            </a>
            <a href="#" className="text-white/20 hover:text-white/50 transition-colors">
              <svg width="19" height="15" viewBox="0 0 18.9999 14.9999" fill="none">
                <path d={svgPaths.p3f52f0c0} fill="currentColor" />
              </svg>
            </a>
            <a href="#" className="text-white/20 hover:text-white/50 transition-colors">
              <svg width="17" height="19" viewBox="0 0 16.9999 18.9999" fill="none">
                <path d={svgPaths.p9aabd00} fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
