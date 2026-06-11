import React, { useState, useRef, useEffect } from 'react';
import {
  HelpCircle,
  FileText,
  Video,
  LayoutTemplate,
  Search,
  X,
  FileDown,
  ExternalLink,
  Play,
  Eye,
} from 'lucide-react';
import { Tab, TabItem } from '../components/ui/Tab';
import { Accordion, AccordionItem } from '../components/ui/Accordion';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const faqItems: AccordionItem[] = [
  {
    id: 'faq-1',
    question: 'How do I create a new support ticket?',
    answer:
      'Navigate to the Dashboard and click the "New Ticket" button in the top-right corner. Fill in the required fields — Title, Category, Priority, and Description — then click Submit. You will receive a confirmation email with your ticket ID.',
  },
  {
    id: 'faq-2',
    question: 'What are the different ticket priority levels?',
    answer:
      'Tickets are categorised into four priority levels: Low (resolved within 5 business days), Medium (3 business days), High (1 business day), and Critical (same day, 24/7 support). Priority is auto-suggested based on the issue type but can be adjusted manually.',
  },
  {
    id: 'faq-3',
    question: 'How can I track the status of my submitted ticket?',
    answer:
      'Go to "My Tickets" from the sidebar. Each ticket card shows its current status — Open, In Progress, Pending Review, or Resolved. You can click on any ticket to view the full conversation thread and status timeline.',
  },
  {
    id: 'faq-4',
    question: 'Can I reopen a closed ticket?',
    answer:
      'Yes. Open the closed ticket from your ticket history and click "Reopen Ticket" at the bottom of the thread. Provide a reason for reopening. The ticket will be re-assigned to the original agent or the next available one in the queue.',
  },
  {
    id: 'faq-5',
    question: 'How do I escalate an unresolved ticket?',
    answer:
      'If a ticket has been open longer than its SLA target, an "Escalate" button will automatically appear. Alternatively, contact your account manager directly or use the Admin panel to manually bump the priority to Critical.',
  },
  {
    id: 'faq-6',
    question: 'Is it possible to assign a ticket to a specific agent?',
    answer:
      'Admins and Team Leads can manually assign tickets from the ticket detail view using the "Assign To" dropdown. Regular users can request a specific agent by mentioning them in a ticket comment using the @mention feature.',
  },
];

const pdfItems = [
  {
    id: 'pdf-1',
    title: 'Getting Started Guide',
    description:
      'A comprehensive onboarding manual covering account setup, dashboard navigation, and your first ticket submission. Ideal for new team members joining the platform.',
    size: '2.4 MB',
    pages: 18,
    tag: 'Onboarding',
  },
  {
    id: 'pdf-2',
    title: 'Admin Configuration Handbook',
    description:
      'Step-by-step instructions for system administrators to configure roles, permissions, SLA policies, email templates, and webhook integrations.',
    size: '5.1 MB',
    pages: 42,
    tag: 'Admin',
  },
  {
    id: 'pdf-3',
    title: 'Ticket Workflow & SLA Policy',
    description:
      'Detailed documentation of the ticket lifecycle — from creation through resolution — including SLA thresholds, escalation rules, and audit trail specifications.',
    size: '1.8 MB',
    pages: 24,
    tag: 'Policy',
  },
  {
    id: 'pdf-4',
    title: 'API Integration Reference',
    description:
      'Full REST API documentation with endpoint schemas, authentication methods (JWT & API key), rate limits, and code samples in Node.js, Python, and cURL.',
    size: '3.7 MB',
    pages: 56,
    tag: 'Developer',
  },
];

const videoItems = [
  {
    id: 'vid-1',
    title: 'Platform Overview & Navigation',
    description:
      'A quick walkthrough of the main dashboard, sidebar navigation, and key modules. Perfect for a first look at the system before diving deeper.',
    duration: '4:32',
    category: 'Getting Started',
  },
  {
    id: 'vid-2',
    title: 'Creating & Managing Tickets',
    description:
      'Learn how to submit tickets, set priorities, attach files, add watchers, and track progress through the full resolution lifecycle.',
    duration: '7:15',
    category: 'Core Features',
  },
  {
    id: 'vid-3',
    title: 'Setting Up User Roles & Permissions',
    description:
      'This tutorial guides admins through creating custom roles, assigning privilege sets, and auditing user access levels across the organisation.',
    duration: '9:48',
    category: 'Admin',
  },
  {
    id: 'vid-4',
    title: 'Configuring SLA & Escalation Rules',
    description:
      'Understand how to define SLA tiers per ticket category, set breach notifications, and create automated escalation workflows using the rule engine.',
    duration: '11:03',
    category: 'Advanced',
  },
  {
    id: 'vid-5',
    title: 'Integrating with Third-Party Tools',
    description:
      'Connect the ticketing system with Slack, Jira, GitHub, and custom webhooks. Covers OAuth flow, mapping fields, and testing integrations end-to-end.',
    duration: '13:27',
    category: 'Developer',
  },
];

const templateItems = [
  {
    id: 'tpl-1',
    title: 'Bug Report Template',
    description:
      'A structured template capturing environment details, steps to reproduce, expected vs actual behaviour, and severity rating. Helps agents triage faster.',
    category: 'Bug Report',
    fields: 8,
  },
  {
    id: 'tpl-2',
    title: 'Feature Request Form',
    description:
      'Standardised form for submitting enhancement ideas — includes business justification, user story format, acceptance criteria, and estimated impact.',
    category: 'Feature Request',
    fields: 7,
  },
  {
    id: 'tpl-3',
    title: 'Infrastructure Incident Report',
    description:
      'Used for outages and service degradations. Captures affected services, incident timeline, root cause analysis (RCA), and corrective action items.',
    category: 'Incident',
    fields: 12,
  },
  {
    id: 'tpl-4',
    title: 'Onboarding Request Checklist',
    description:
      'Pre-built checklist for provisioning access, configuring accounts, and completing onboarding tasks for new hires joining a team.',
    category: 'HR / IT',
    fields: 15,
  },
];

const TABS: TabItem[] = [
  { id: 'faq', label: 'FAQs', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'pdf', label: 'PDFs', icon: <FileText className="h-4 w-4" /> },
  { id: 'videos', label: 'Videos', icon: <Video className="h-4 w-4" /> },
  { id: 'templates', label: 'Templates', icon: <LayoutTemplate className="h-4 w-4" /> },
];

/* ─────────────────────────────────────────────
   TAG / CATEGORY BADGE
───────────────────────────────────────────── */
const tagColors: Record<string, string> = {
  Onboarding: 'bg-green-100 text-green-700',
  Admin: 'bg-orange-100 text-orange-700',
  Policy: 'bg-purple-100 text-purple-700',
  Developer: 'bg-blue-100 text-blue-700',
  'Getting Started': 'bg-green-100 text-green-700',
  'Core Features': 'bg-indigo-100 text-indigo-700',
  Advanced: 'bg-red-100 text-red-700',
  'Bug Report': 'bg-red-100 text-red-700',
  'Feature Request': 'bg-blue-100 text-blue-700',
  Incident: 'bg-orange-100 text-orange-700',
  'HR / IT': 'bg-teal-100 text-teal-700',
};

const Badge = ({ label }: { label: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
      tagColors[label] ?? 'bg-gray-100 text-gray-600'
    }`}
  >
    {label}
  </span>
);

/* ─────────────────────────────────────────────
   SUB-SECTIONS
───────────────────────────────────────────── */

const FaqSection = ({ query }: { query: string }) => {
  const filtered = faqItems.filter(
    (f) =>
      f.question.toLowerCase().includes(query.toLowerCase()) ||
      f.answer.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <p className="mb-6 text-sm text-gray-500">
        {filtered.length} question{filtered.length !== 1 ? 's' : ''} found
      </p>
      {filtered.length === 0 ? (
        <EmptyState message="No FAQs match your search." />
      ) : (
        <Accordion items={filtered} allowMultiple />
      )}
    </div>
  );
};

const PdfSection = ({ query }: { query: string }) => {
  const filtered = pdfItems.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {filtered.length === 0 ? (
        <div className="col-span-2">
          <EmptyState message="No PDFs match your search." />
        </div>
      ) : (
        filtered.map((pdf) => (
          <div
            key={pdf.id}
            className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
          >
            {/* Icon + tag row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <FileText className="h-5 w-5" />
              </div>
              <Badge label={pdf.tag} />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{pdf.title}</h3>
              <p className="text-[13px] leading-relaxed text-gray-500">{pdf.description}</p>
            </div>

            {/* Meta + actions */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex gap-3 text-[12px] text-gray-400">
                <span>{pdf.pages} pages</span>
                <span>·</span>
                <span>{pdf.size}</span>
              </div>
              <div className="flex gap-2">
                <button
                  id={`pdf-preview-${pdf.id}`}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
                <button
                  id={`pdf-download-${pdf.id}`}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs text-white transition hover:bg-indigo-700"
                >
                  <FileDown className="h-3 w-3" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const VideoSection = ({ query }: { query: string }) => {
  const filtered = videoItems.filter(
    (v) =>
      v.title.toLowerCase().includes(query.toLowerCase()) ||
      v.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      {filtered.length === 0 ? (
        <EmptyState message="No videos match your search." />
      ) : (
        filtered.map((vid) => (
          <div
            key={vid.id}
            className="group flex gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
          >
            {/* Thumbnail placeholder */}
            <div className="relative flex h-20 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform duration-200 group-hover:scale-110">
                <Play className="h-4 w-4 translate-x-0.5" />
              </div>
              <span className="absolute right-1.5 bottom-1 rounded bg-black/60 px-1 py-0.5 text-[10px] font-medium text-white">
                {vid.duration}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Badge label={vid.category} />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-gray-900">{vid.title}</h3>
                <p className="text-[13px] leading-relaxed text-gray-500">{vid.description}</p>
              </div>
              <button
                id={`vid-watch-${vid.id}`}
                className="mt-2 flex w-fit items-center gap-1.5 text-xs font-medium text-indigo-600 transition hover:text-indigo-800"
              >
                Watch now <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const TemplateSection = ({ query }: { query: string }) => {
  const filtered = templateItems.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {filtered.length === 0 ? (
        <div className="col-span-2">
          <EmptyState message="No templates match your search." />
        </div>
      ) : (
        filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <Badge label={tpl.category} />
            </div>

            <div className="flex-1">
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{tpl.title}</h3>
              <p className="text-[13px] leading-relaxed text-gray-500">{tpl.description}</p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-[12px] text-gray-400">{tpl.fields} fields</span>
              <button
                id={`tpl-use-${tpl.id}`}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white transition hover:bg-indigo-700"
              >
                Use Template
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-16 text-center">
    <Search className="h-8 w-8 text-gray-300" />
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */

export const Knowledge = () => {
  const [activeTab, setActiveTab] = useState<string>('faq');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus input when search bar opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  const sectionCount: Record<string, number> = {
    faq: faqItems.length,
    pdf: pdfItems.length,
    videos: videoItems.length,
    templates: templateItems.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="mb-6 rounded-2xl bg-white shadow-sm">
        {/* Title row */}
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-1">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Guides, FAQs, tutorials, and templates — all in one place.
            </p>
          </div>

          {/* Search toggle */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="flex items-center gap-2 rounded-xl border border-indigo-300 bg-white px-3 py-2 shadow-md ring-1 ring-indigo-100">
                <Search className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                <input
                  id="kb-search-input"
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${TABS.find((t) => t.id === activeTab)?.label ?? ''}…`}
                  className="w-60 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
                <button
                  id="kb-search-close"
                  onClick={() => setSearchOpen(false)}
                  className="ml-1 rounded-full p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="kb-search-open"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all duration-150 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            )}
          </div>
        </div>

        {/* Tab row */}
        <Tab tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} className="px-2" />
      </div>

      {/* ── Content ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Section header */}
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            {TABS.find((t) => t.id === activeTab)?.icon}
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-[12px] text-gray-400">{sectionCount[activeTab]} items</p>
          </div>
        </div>

        {/* Dynamic section */}
        {activeTab === 'faq' && <FaqSection query={searchQuery} />}
        {activeTab === 'pdf' && <PdfSection query={searchQuery} />}
        {activeTab === 'videos' && <VideoSection query={searchQuery} />}
        {activeTab === 'templates' && <TemplateSection query={searchQuery} />}
      </div>
    </div>
  );
};

export default Knowledge;
