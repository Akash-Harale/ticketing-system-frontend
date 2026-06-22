import React, { useState } from 'react';
import { CheckCircle2, FileText } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'whatsNew' | 'announcements' | 'notifications' | 'news'
  >('whatsNew');

  const dummyNewsData = {
    whatsNew: [
      {
        id: 1,
        title:
          'Recommendation for the award of "Kendriya Grihmantri Dakshata Padak" for the year 2026- reg.',
        fileSize: '1.46 MB',
        color: 'default',
      },
      {
        id: 2,
        title:
          'Filling up of post of Junior Reception Officer/Senior Reception Officer in the Secretariat Security Organization, Ministry of Home Affairs, on deputation basis — reg.',
        fileSize: '603.9 KB',
        color: 'default',
      },
      {
        id: 3,
        title:
          'Nomination of Pre-deployment Training for Women Peacekeeper, training course (20th June-16th July 2026)-reg.',
        fileSize: '3.44 MB',
        color: 'red',
      },
      {
        id: 4,
        title: 'Final result of ACIO-II/Exe Exam - 2025.',
        fileSize: '5.04 KB',
        color: 'default',
      },
    ],
    announcements: [
      {
        id: 1,
        title:
          "Calling for recommendation for the award of President's Medal for Distinguished Service (PSM) and Medal for Meritorious Service (MSM) in respect of personnel of Police, Fire, HG & CD and Correctional Services on the occasion of Independence Day- 2026-reg.",
        fileSize: '404.18 KB',
        color: 'default',
      },
      {
        id: 2,
        title:
          "E-Gazetted Notification in r/o Awardees of Medal for Gallantry (GM), President's Medal for Distinguished Service (PSM) and Medal for Meritorious Service (MSM) awarded on the occasion of Republic Day, 2026-reg.",
        fileSize: '107.55 KB',
        color: 'default',
      },
    ],
    notifications: [
      {
        id: 1,
        title:
          'Standard Operating Procedure (SOP) for "Ranking of Police Training Institutes" and "Ranking of CFSLs/SFSLs" - reg.',
        fileSize: '2.13 MB',
        color: 'default',
      },
      {
        id: 2,
        title:
          'Filling up of post of Assistant Commandant in Secretariat Security Force, Ministry of Home Affairs, on deputation basis-reg.',
        fileSize: '292.54 KB',
        color: 'default',
      },
    ],
    news: [
      {
        id: 1,
        title: 'SA/Exe Tier-2 Exam 2025-declaration of result.',
        fileSize: '4.22 KB',
        color: 'default',
      },
      {
        id: 2,
        title: 'Final Result of ACIO-II/Tech Rectt in IB',
        fileSize: '4.23 KB',
        color: 'default',
      },
    ],
  };

  const tabs = [
    { id: 'whatsNew', label: "What's New" },
    { id: 'announcements', label: 'Announcements' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'news', label: 'News' },
  ] as const;

  return (
    <div className="bg-white font-sans">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <img
          src="modi.jpg"
          alt="NSS Event"
          className="h-[320px] w-full object-cover opacity-80 md:h-[480px]"
        />
      </section>

      {/* Tabbed Updates Section */}
      <section className="mx-auto max-w-[1200px] px-6 py-12 md:py-16">
        {/* Tabs Headers */}
        <div className="mb-8 flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer border-b-2 px-6 py-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-[#2d348f] text-[#2d348f]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content List */}
        <div className="space-y-6">
          {dummyNewsData[activeTab].map((item) => (
            <div key={item.id} className="flex items-start gap-3.5">
              {/* Bullet Icon */}
              <div className="mt-1 flex-shrink-0 text-gray-500">
                <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
              </div>

              {/* Text & Download details */}
              <div className="space-y-1">
                <p
                  className={`text-[14.5px] leading-relaxed font-medium ${
                    item.color === 'red'
                      ? 'text-red-700 hover:text-red-800'
                      : 'text-gray-900 hover:text-[#2d348f]'
                  } cursor-pointer transition`}
                >
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <FileText className="h-3.5 w-3.5 text-red-600" />
                  <span className="flex cursor-pointer items-center gap-1 font-medium hover:text-[#2d348f] hover:underline">
                    Download ({item.fileSize})
                  </span>
                </div>
              </div>
            </div>
          ))}
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
