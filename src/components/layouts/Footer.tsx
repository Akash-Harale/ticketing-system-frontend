import React from 'react';

interface FooterLogo {
  src: string;
  alt: string;
  href?: string;
}

interface FooterLink {
  label: string;
  href: string;
}

export const Footer: React.FC = () => {
  const logos: FooterLogo[] = [
    { src: '/khelo.png', alt: 'Khelo India', href: 'https://kheloindia.gov.in/' },
    { src: '/gem.png', alt: 'GeM', href: 'https://gem.gov.in/' },
    { src: '/mygov.png', alt: 'MyGov', href: 'https://www.mygov.in/' },
    { src: '/pmnrf.png', alt: 'PMNRF', href: 'https://pmnrf.gov.in/' },
    { src: '/india-gov.png', alt: 'India Gov', href: 'https://www.india.gov.in/' },
    {
      src: '/incredible-india.png',
      alt: 'Incredible India',
      href: 'https://www.incredibleindia.org/',
    },
    { src: '/web-directry.jpg', alt: 'Web Directory', href: 'https://goidirectory.gov.in/' },
    { src: '/digital-india.jpg', alt: 'Digital India', href: 'https://www.digitalindia.gov.in/' },
    { src: '/data-gov.png', alt: 'Data Gov', href: 'https://data.gov.in/' },
    { src: '/cpgrams.jpg', alt: 'CPGRAMS', href: 'https://pgportal.gov.in/' },
  ];

  // const links: FooterLink[] = [
  //   { label: 'Website Policies', href: '#' },
  //   { label: 'Site Map', href: '#' },
  //   { label: 'Feedback', href: '#' },
  //   { label: 'Contact Us', href: '#' },
  //   { label: 'Help', href: '#' },
  //   { label: 'WIM', href: '#' },
  // ];

  return (
    <footer className="w-full font-sans">
      {/* Top Logos Row */}
      <div
        className="w-full border-b border-[#cce4f2] py-5"
        style={{
          backgroundColor: '#e3f5ff',
          backgroundImage: 'radial-gradient(#bce3fd 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:justify-between">
            {logos.map((logo, index) => (
              <a
                key={index}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-sm transition-all duration-300 hover:scale-105 hover:opacity-85 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-10 max-w-[120px] object-contain md:h-18 md:max-w-[140px]"
                  onError={() => {
                    // Fallback in case there is any issue loading image from public folder
                    console.error(`Error loading image: ${logo.src}`);
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Links Row */}
      <div className="w-full bg-[#391988] py-4 shadow-inner">
        {/* <div className="mx-auto max-w-[1400px] px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-medium text-white md:text-sm">
            {links.map((link, index) => (
              <React.Fragment key={index}>
                <a
                  href={link.href}
                  className="transition-colors duration-200 hover:text-yellow-400 hover:underline"
                >
                  {link.label}
                </a>
                {index < links.length - 1 && <span className="text-purple-300 select-none">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div> */}
      </div>

      {/* Bottom Info Row */}
      <div
        className="relative w-full overflow-hidden py-8 text-white"
        style={{
          backgroundColor: '#050e26',
          // Subtle elegant dark floral pattern representation via CSS gradient
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(20, 35, 75, 0.4) 0%, transparent 60%), radial-gradient(circle at 90% 80%, rgba(20, 35, 75, 0.4) 0%, transparent 60%)',
        }}
      >
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex flex-col items-center justify-center gap-6 text-center md:flex-row md:text-left">
            {/* Built on CMF Logo */}
            <div className="flex items-center gap-3">
              {/* <img src="/cmf-logo.png" alt="BUILT ON CMF" className="h-9 object-contain" /> */}
              {/* <div className="hidden h-10 border-l border-slate-700 md:block"></div> */}
            </div>

            {/* Info Text */}
            <div className="flex flex-col gap-1 text-[11px] leading-relaxed text-slate-300 md:text-[13px]">
              <p className="font-semibold text-slate-100">
                Website Content Managed by National Service Scheme
              </p>
              <p>
                Designed, Developed and Hosted by{' '}
                <a
                  href="https://www.nic.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                >
                  National Informatics Centre( NIC )
                </a>
              </p>
              <p className="text-[10px] text-slate-400 md:text-[11px]">Last Updated: 08 Jun 2026</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
