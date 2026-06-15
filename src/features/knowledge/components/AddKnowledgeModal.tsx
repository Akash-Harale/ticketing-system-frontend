import React, { useState } from 'react';
import { X, Loader2, UploadCloud } from 'lucide-react';
import { api } from '../../../api/axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddKnowledgeModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    media_header: '',
    media_narration: '',
    media_type: 'faq',
    media_url: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('media_header', formData.media_header);
      data.append('media_narration', formData.media_narration);
      data.append('media_type', formData.media_type);
      if (formData.media_url) {
        data.append('media_url', formData.media_url);
      }
      if (file) {
        data.append('media_file', file);
      }

      await api.post('/mediacorner', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to add knowledge base item', error);
      alert('Failed to add knowledge base item');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ media_header: '', media_narration: '', media_type: 'faq', media_url: '' });
    setFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-[15px] font-semibold text-gray-900">Add Knowledge Base Item</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Type *</label>
            <select
              value={formData.media_type}
              onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="faq">FAQ</option>
              <option value="document">PDF / Document</option>
              <option value="video">Video</option>
              <option value="template">Template</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {formData.media_type === 'faq' ? 'Question *' : 'Title *'}
            </label>
            <input
              type="text"
              value={formData.media_header}
              onChange={(e) => setFormData({ ...formData, media_header: e.target.value })}
              required
              placeholder={formData.media_type === 'faq' ? 'Enter question' : 'Enter title'}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {formData.media_type === 'faq' ? 'Answer *' : 'Description *'}
            </label>
            <textarea
              value={formData.media_narration}
              onChange={(e) => setFormData({ ...formData, media_narration: e.target.value })}
              required
              rows={4}
              placeholder={formData.media_type === 'faq' ? 'Enter answer' : 'Enter description'}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {['document', 'video'].includes(formData.media_type) && (
            <>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  URL Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.media_url}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Upload File (Optional)
                </label>
                <div className="flex w-full items-center justify-center">
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        {file ? (
                          <span className="font-semibold text-indigo-600">{file.name}</span>
                        ) : (
                          <>
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </>
                        )}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                      accept={
                        formData.media_type === 'video'
                          ? 'video/*,.mp4'
                          : 'application/pdf,.doc,.docx'
                      }
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
