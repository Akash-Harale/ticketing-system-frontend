import React, { useState } from 'react';
import { ticketService } from '@/services/ticket.service';
import { Send, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';

export const Feedback = () => {
  const predefinedSubjects = ['UI/UX Suggestion', 'Feature Request', 'General Feedback', 'Other'];

  const [selectedSubject, setSelectedSubject] = useState(predefinedSubjects[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const finalSubject = selectedSubject === 'Other' ? subject : selectedSubject;
      if (!finalSubject.trim()) {
        setError('Subject cannot be empty');
        setLoading(false);
        return;
      }

      await ticketService.createTicket({
        subject: finalSubject,
        description,
        attachment,
        ticketType: 'feedback',
      });
      setSuccess('Feedback submitted successfully!');
      setSubject('');
      setSelectedSubject(predefinedSubjects[0]);
      setDescription('');
      setAttachment('');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Feedback</h1>
          <p className="text-sm text-gray-500">We value your thoughts and suggestions.</p>
        </div>
      </div>

      <div className="max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="px-6 py-6">
          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Subject Category *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {predefinedSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {selectedSubject === 'Other' && (
              <>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Custom Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Brief summary of your feedback"
                />
              </>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Detailed description..."
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Attachment (Optional URL)
            </label>
            <input
              type="text"
              value={attachment}
              onChange={(e) => setAttachment(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Link to file or reference"
            />
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
