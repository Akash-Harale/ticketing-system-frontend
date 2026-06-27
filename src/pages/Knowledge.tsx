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
  Plus,
} from 'lucide-react';
import { Tab, TabItem } from '../components/ui/Tab';
import { Accordion } from '../components/ui/Accordion';
import { api } from '../api/axios';
import { env } from '../config/env';
import { AddKnowledgeModal } from '../features/knowledge/components/AddKnowledgeModal';
import { usePermission } from '../context/auth/usePermission';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface PDFItem {
  id: string;
  title: string;
  description: string;
  url: string;
  filename?: string;
}

interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
}

interface TemplateItem {
  id: string;
  title: string;
  description: string;
}

interface MediaItem {
  _id: string;
  media_type: 'faq' | 'document' | 'video' | 'template' | 'pdf';
  media_header: string;
  media_narration: string;
  media_file_url?: string;
  media_url?: string;
  media_file?: string;
}

const TABS: TabItem[] = [
  { id: 'faq', label: 'FAQs', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'pdf', label: 'PDFs', icon: <FileText className="h-4 w-4" /> },
  { id: 'videos', label: 'Videos', icon: <Video className="h-4 w-4" /> },
  { id: 'templates', label: 'Templates', icon: <LayoutTemplate className="h-4 w-4" /> },
];

/* ─────────────────────────────────────────────
   SUB-SECTIONS
   ───────────────────────────────────────────── */

const FaqSection = ({ query, items }: { query: string; items: FAQItem[] }) => {
  const filtered = items.filter(
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

const PdfSection = ({ query, items }: { query: string; items: PDFItem[] }) => {
  const filtered = items.filter(
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
            {/* Icon row */}
            <div className="flex items-start">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{pdf.title}</h3>
              <p className="text-[13px] leading-relaxed text-gray-500">{pdf.description}</p>
            </div>

            {/* Meta + actions */}
            <div className="flex items-center justify-end border-t border-gray-100 pt-3">
              <div className="flex gap-2">
                <button
                  id={`pdf-preview-${pdf.id}`}
                  onClick={() => {
                    if (pdf.filename) {
                      window.open(
                        `${env.apiUrl}/mediacorner/asset?media=${pdf.filename}`,
                        '_blank',
                      );
                    } else if (pdf.url) {
                      window.open(pdf.url, '_blank');
                    }
                  }}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
                <button
                  id={`pdf-download-${pdf.id}`}
                  onClick={() => {
                    if (pdf.filename) {
                      window.open(
                        `${env.apiUrl}/mediacorner/asset?media=${pdf.filename}`,
                        '_blank',
                      );
                    } else if (pdf.url) {
                      window.open(pdf.url, '_blank');
                    }
                  }}
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

const VideoSection = ({ query, items }: { query: string; items: VideoItem[] }) => {
  const filtered = items.filter(
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
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-900">{vid.title}</h3>
                <p className="text-[13px] leading-relaxed text-gray-500">{vid.description}</p>
              </div>
              <button
                id={`vid-watch-${vid.id}`}
                onClick={() => vid.url && window.open(vid.url, '_blank')}
                className="mt-2 flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium text-indigo-600 transition hover:text-indigo-800"
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

const TemplateSection = ({ query, items }: { query: string; items: TemplateItem[] }) => {
  const filtered = items.filter(
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
            <div className="flex items-start">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                <LayoutTemplate className="h-5 w-5" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{tpl.title}</h3>
              <p className="text-[13px] leading-relaxed text-gray-500">{tpl.description}</p>
            </div>

            <div className="flex items-center justify-end border-t border-gray-100 pt-3">
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
  const { hasPermission } = usePermission();
  const [activeTab, setActiveTab] = useState<string>('faq');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<{
    faq: FAQItem[];
    pdf: PDFItem[];
    videos: VideoItem[];
    templates: TemplateItem[];
  }>({
    faq: [],
    pdf: [],
    videos: [],
    templates: [],
  });

  const fetchData = async () => {
    try {
      const response = await api.get('/mediacorner');
      const items: MediaItem[] = response.data.data || [];
      const faq = items
        .filter((i) => i.media_type === 'faq')
        .map((i) => ({ id: i._id, question: i.media_header, answer: i.media_narration }));
      const pdf = items
        .filter((i) => i.media_type === 'document' || i.media_type === 'pdf')
        .map((i) => ({
          id: i._id,
          title: i.media_header,
          description: i.media_narration,
          url: i.media_file_url || i.media_url || '',
          filename: i.media_file || '',
        }));
      const videos = items
        .filter((i) => i.media_type === 'video')
        .map((i) => ({
          id: i._id,
          title: i.media_header,
          description: i.media_narration,
          url: i.media_file_url || i.media_url || '',
        }));
      const templates = items
        .filter((i) => i.media_type === 'template')
        .map((i) => ({ id: i._id, title: i.media_header, description: i.media_narration }));

      setData({ faq, pdf, videos, templates });
    } catch (error) {
      console.error('Failed to fetch knowledge base', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Focus input when search bar opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  const sectionCount: Record<string, number> = {
    faq: data.faq.length,
    pdf: data.pdf.length,
    videos: data.videos.length,
    templates: data.templates.length,
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

            {hasPermission('Mediacorner', 'CREATE') && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Knowledge base</span>
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
        {activeTab === 'faq' && <FaqSection query={searchQuery} items={data.faq} />}
        {activeTab === 'pdf' && <PdfSection query={searchQuery} items={data.pdf} />}
        {activeTab === 'videos' && <VideoSection query={searchQuery} items={data.videos} />}
        {activeTab === 'templates' && (
          <TemplateSection query={searchQuery} items={data.templates} />
        )}
      </div>

      <AddKnowledgeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Knowledge;
