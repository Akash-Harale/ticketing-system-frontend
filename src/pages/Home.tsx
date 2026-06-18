export default function Home() {
  return (
    <div className="bg-white font-sans">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <img
          src="https://nss.gov.in/sites/all/themes/youthaffair/images/nss.jpg"
          alt="NSS Event"
          className="h-[320px] w-full object-cover opacity-80 md:h-[480px]"
        />
      </section>

      {/* About Section */}
      <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-4 py-12 md:py-16 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-2">
            <span className="text-sm font-bold tracking-wider text-[#ef4a24] uppercase">
              Introduction
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#2d348f]">
              About National Service Scheme (NSS)
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-slate-600 md:text-base">
            <p>
              The National Service Scheme (NSS) is a Central Sector Scheme of the Government of
              India, Ministry of Youth Affairs & Sports. It provides opportunities to the student
              youth of schools and colleges to take part in various government-led community service
              activities and programmes.
            </p>
            <p>
              The primary objective of developing the personality and character of the student youth
              through voluntary community service remains unchanged. Through engagement, volunteers
              develop a sense of social and civic responsibility and gain practical experience.
            </p>
            <p>
              NSS volunteers work on a variety of social development issues including literacy
              drives, environment conservation, health education, sanitation drives, disaster
              management, and blood donation camps, strengthening the bond between the community and
              academia.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-sm font-bold tracking-wider text-[#ef4a24] uppercase">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4a24]"></span> Major Focus Areas
            </div>
            <ul className="space-y-3 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-3">
                <span className="font-bold text-green-500">✓</span> Literacy and Adult Education
              </li>
              <li className="flex items-center gap-3">
                <span className="font-bold text-green-500">✓</span> Environment Conservation &
                Planting
              </li>
              <li className="flex items-center gap-3">
                <span className="font-bold text-green-500">✓</span> Health, Hygiene & Sanitation
                Drives
              </li>
              <li className="flex items-center gap-3">
                <span className="font-bold text-green-500">✓</span> Blood Donation & Health Camps
              </li>
              <li className="flex items-center gap-3">
                <span className="font-bold text-green-500">✓</span> Disaster Relief & Rehabilitation
              </li>
            </ul>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-500 italic">
              "The best way to find yourself is to lose yourself in the service of others." –
              Mahatma Gandhi
            </p>
          </div>
        </div>
      </section>

      {/* Latest Updates / News Section */}
      <section className="border-t border-b border-slate-200 bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] space-y-8 px-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <span className="text-sm font-bold tracking-wider text-[#ef4a24] uppercase">
                Newsfeed
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#2d348f]">
                Latest Announcements & Events
              </h2>
            </div>
            <button className="cursor-pointer self-start text-sm font-bold text-[#2d348f] transition-colors hover:text-[#ef4a24] md:self-auto">
              View All Announcements &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:shadow-md">
              <div className="space-y-3 p-6">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 uppercase">
                  Notification
                </span>
                <h4 className="cursor-pointer text-lg leading-snug font-bold text-slate-800 hover:text-[#2d348f]">
                  Registration for National Youth Festival 2026 Open
                </h4>
                <p className="line-clamp-3 text-sm text-slate-500">
                  NSS volunteers from all regions are invited to register for the upcoming National
                  Youth Festival. Show your skills, culture, and projects!
                </p>
              </div>
              <div className="text-slate-450 flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs">
                <span>Date: June 15, 2026</span>
                <span className="cursor-pointer font-semibold text-[#2d348f] hover:underline">
                  Read More
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:shadow-md">
              <div className="space-y-3 p-6">
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600 uppercase">
                  Campaign
                </span>
                <h4 className="cursor-pointer text-lg leading-snug font-bold text-slate-800 hover:text-[#2d348f]">
                  Nationwide Tree Plantation Drive Underway
                </h4>
                <p className="line-clamp-3 text-sm text-slate-500">
                  Join the mission to plant 1 Million trees across colleges and institutions this
                  month. Submit your plantation reports to the portal.
                </p>
              </div>
              <div className="text-slate-450 flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs">
                <span>Date: June 10, 2026</span>
                <span className="cursor-pointer font-semibold text-[#2d348f] hover:underline">
                  Read More
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:shadow-md">
              <div className="space-y-3 p-6">
                <span className="rounded-full bg-[#ef4a24]/10 px-2.5 py-1 text-xs font-bold text-[#ef4a24] uppercase">
                  Update
                </span>
                <h4 className="cursor-pointer text-lg leading-snug font-bold text-slate-800 hover:text-[#2d348f]">
                  New MIS Reporting Portal Guidelines Released
                </h4>
                <p className="line-clamp-3 text-sm text-slate-500">
                  All Program Units are advised to refer to the new guidelines document to submit
                  monthly activity reports, enrollments, and budget sheets.
                </p>
              </div>
              <div className="text-slate-450 flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs">
                <span>Date: June 05, 2026</span>
                <span className="cursor-pointer font-semibold text-[#2d348f] hover:underline">
                  Read More
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Messages / Dignitaries */}
      <section className="mx-auto max-w-[1400px] space-y-8 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <span className="text-sm font-bold tracking-wider text-[#ef4a24] uppercase">
            Our Inspiration
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#2d348f]">
            Messages from Leadership
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="border-slate-150 flex flex-col items-center gap-6 rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md md:flex-row md:items-start md:p-8">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzlyYgE92iIu2o9Xz9X78u2i_c3uC096DskA&s"
              alt="Hon'ble Minister"
              className="h-24 w-24 shrink-0 rounded-full border-4 border-slate-100 object-cover shadow-inner"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
              }}
            />
            <div className="space-y-3 text-center md:text-left">
              <p className="text-sm leading-relaxed text-slate-500 italic">
                "NSS volunteers are key partners in national progress. Their work in bringing civic
                change, disaster relief, and health education defines true nation building."
              </p>
              <div>
                <h4 className="text-base font-extrabold text-slate-800">Dr. Mansukh Mandaviya</h4>
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Hon'ble Minister of Youth Affairs & Sports
                </p>
              </div>
            </div>
          </div>

          <div className="border-slate-150 flex flex-col items-center gap-6 rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md md:flex-row md:items-start md:p-8">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz746h3317gKjJ_y669U9R7g9_C73nS8dKHA&s"
              alt="Secretary"
              className="h-24 w-24 shrink-0 rounded-full border-4 border-slate-100 object-cover shadow-inner"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
              }}
            />
            <div className="space-y-3 text-center md:text-left">
              <p className="text-sm leading-relaxed text-slate-500 italic">
                "Through structured community engagement, the NSS provides student youth with
                invaluable lessons in social leadership, empathy, and organizational management."
              </p>
              <div>
                <h4 className="text-base font-extrabold text-slate-800">Smt. Meeta Rajivlochan</h4>
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Secretary, Ministry of Youth Affairs & Sports
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
