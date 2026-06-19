import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  FileText,
  Video,
  Globe,
  User,
  X,
  Loader2,
  UploadCloud,
  Pencil,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/auth/useAuth';
import { api } from '../api/axios';
import { env } from '../config/env';

interface NotificationItem {
  _id: string;
  media_header: string;
  media_narration: string;
  media_type: string;
  media_url?: string;
  media_file?: string;
  media_file_url?: string;
  notification_type: 'broadcast' | 'one-to-one';
  recipient_id?: string;
  is_read?: boolean;
  createdAt: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  role_id?: {
    name: string;
  };
}

export const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NotificationItem | null>(null);
  const [formData, setFormData] = useState({
    media_header: '',
    media_narration: '',
    notification_type: 'broadcast' as 'broadcast' | 'one-to-one',
    recipient_id: '',
    media_url: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [saving, setSaving] = useState(false);

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Check if current user is an admin or superadmin
  const isSuperadmin = user?.role_id?.name?.toLowerCase() === 'superadmin';
  const isAdmin =
    user?.role_id?.name?.toLowerCase()?.endsWith('_admin') ||
    user?.role_id?.name?.toLowerCase()?.includes('admin');
  const canManage = isSuperadmin || isAdmin;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mediacorner', {
        params: { media_type: 'notification' },
      });
      const fetched = response.data.data || [];
      setNotifications(fetched);

      // Auto-read any unread one-to-one notifications that are meant for current user
      const unreadOneToOne = fetched.filter(
        (item: NotificationItem) =>
          item.notification_type === 'one-to-one' &&
          !item.is_read &&
          (item.recipient_id === user?._id || item.recipient_id === user?.member_id?._id),
      );

      if (unreadOneToOne.length > 0) {
        await Promise.all(
          unreadOneToOne.map((item: NotificationItem) =>
            api.patch(`/mediacorner/${item._id}/read`),
          ),
        );
        // Dispatch event to refresh notification badge in header
        window.dispatchEvent(new Event('notifications_read'));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (canManage) {
      fetchMembers();
    }
  }, [user]);

  const handleCreateClick = () => {
    setEditingItem(null);
    setFormData({
      media_header: '',
      media_narration: '',
      notification_type: 'broadcast',
      recipient_id: '',
      media_url: '',
    });
    setFile(null);
    setShowModal(true);
  };

  const handleEditClick = (item: NotificationItem) => {
    setEditingItem(item);
    setFormData({
      media_header: item.media_header,
      media_narration: item.media_narration,
      notification_type: item.notification_type,
      recipient_id: item.recipient_id || '',
      media_url: item.media_url || '',
    });
    setFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('media_header', formData.media_header);
      data.append('media_narration', formData.media_narration);
      data.append('media_type', 'notification');
      data.append('notification_type', formData.notification_type);

      if (formData.notification_type === 'one-to-one' && formData.recipient_id) {
        data.append('recipient_id', formData.recipient_id);
      }
      if (formData.media_url) {
        data.append('media_url', formData.media_url);
      }
      if (file) {
        data.append('media_file', file);
      }

      if (editingItem) {
        // Edit flow
        await api.put(`/mediacorner/${editingItem._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Create flow
        await api.post('/mediacorner', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowModal(false);
      setEditingItem(null);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to save notification:', error);
      alert('Failed to save notification');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.delete(`/mediacorner/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-6 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 px-6 py-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Stay updated with broadcasts and direct announcements.
            </p>
          </div>

          {canManage && (
            <button
              onClick={handleCreateClick}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#2d348f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f2468] hover:shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Notification
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#2d348f]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
              <Bell className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-500">No notifications found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((item) => {
              const fileType = item.media_file?.toLowerCase();
              const isVideo = fileType?.endsWith('.mp4') || fileType?.endsWith('.mov');
              const isPdf = fileType?.endsWith('.pdf');
              const isExpanded = !!expandedIds[item._id];

              return (
                <div
                  key={item._id}
                  className="flex items-start gap-3.5 py-4.5 first:pt-0 last:pb-0"
                >
                  {/* Bullet Icon */}
                  <div className="mt-1 flex-shrink-0 text-gray-500">
                    <CheckCircle2 className="h-5 w-5 stroke-[2.5] text-[#2d348f]" />
                  </div>

                  {/* Content Container */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3
                          onClick={() => toggleExpand(item._id)}
                          className="cursor-pointer text-[14.5px] leading-relaxed font-semibold text-gray-900 transition hover:text-[#2d348f]"
                        >
                          {item.media_header}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            item.notification_type === 'broadcast'
                              ? 'border-blue-100 bg-blue-50 text-blue-700'
                              : 'border-purple-100 bg-purple-50 text-purple-700'
                          }`}
                        >
                          {item.notification_type === 'broadcast' ? (
                            <>
                              <Globe className="h-2.5 w-2.5" /> Broadcast
                            </>
                          ) : (
                            <>
                              <User className="h-2.5 w-2.5" /> Direct
                            </>
                          )}
                        </span>
                        <span className="text-xs text-gray-400">
                          •{' '}
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {canManage && (
                        <div className="flex flex-shrink-0 items-center gap-1">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="cursor-pointer rounded-lg p-1 text-gray-400 transition hover:bg-gray-50 hover:text-indigo-600"
                            title="Edit notification"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="cursor-pointer rounded-lg p-1 text-gray-400 transition hover:bg-gray-50 hover:text-red-600"
                            title="Delete notification"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Description Section */}
                    <div className="mt-1">
                      {isExpanded ? (
                        <div className="animate-in fade-in slide-in-from-top-2 mt-2 rounded-xl border border-slate-100 bg-slate-50 p-4 duration-200">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                              Description
                            </span>
                            <button
                              onClick={() => toggleExpand(item._id)}
                              className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-gray-400 hover:text-gray-600"
                            >
                              Show less <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-gray-700">
                            {item.media_narration}
                          </p>

                          {/* Attachments Section */}
                          {(item.media_url || item.media_file) && (
                            <div className="mt-3.5 flex flex-wrap items-center gap-3 border-t border-slate-200/60 pt-3">
                              {item.media_url && (
                                <a
                                  href={item.media_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d348f] hover:underline"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Open Link
                                </a>
                              )}

                              {item.media_file && (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      if (item.media_file) {
                                        window.open(
                                          `${env.apiUrl}/mediacorner/asset?media=${item.media_file}`,
                                          '_blank',
                                        );
                                      }
                                    }}
                                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#2d348f] hover:underline"
                                  >
                                    {isPdf ? (
                                      <FileText className="h-3.5 w-3.5 text-red-600" />
                                    ) : isVideo ? (
                                      <Video className="h-3.5 w-3.5 text-indigo-600" />
                                    ) : (
                                      <FileText className="h-3.5 w-3.5" />
                                    )}
                                    View {isPdf ? 'PDF' : isVideo ? 'Video' : 'Attachment'}
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() => {
                                      if (item.media_file) {
                                        window.open(
                                          `${env.apiUrl}/mediacorner/asset?media=${item.media_file}`,
                                          '_blank',
                                        );
                                      }
                                    }}
                                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => toggleExpand(item._id)}
                          className="mt-0.5 flex cursor-pointer items-center gap-1 text-[13px] text-gray-500 transition hover:text-[#2d348f]"
                        >
                          <span className="font-medium text-gray-600">Description:</span>
                          <span className="xs:max-w-[320px] max-w-[200px] truncate text-gray-500 sm:max-w-[450px] md:max-w-[600px] lg:max-w-[700px]">
                            {item.media_narration}
                          </span>
                          <span className="ml-1 flex shrink-0 items-center gap-0.5 text-xs font-semibold text-[#2d348f] hover:underline">
                            Read more <ChevronDown className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="animate-in fade-in relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-[15px] font-semibold text-gray-900">
                {editingItem ? 'Edit Notification' : 'Create Notification'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5">
              {/* Target Type */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Type *</label>
                <select
                  value={formData.notification_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notification_type: e.target.value as 'broadcast' | 'one-to-one',
                      recipient_id: '',
                    })
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none focus:border-[#2d348f] focus:ring-2 focus:ring-[#2d348f]/10"
                >
                  <option value="broadcast">Broadcast (To Everyone)</option>
                  <option value="one-to-one">One-to-One (Specific User)</option>
                </select>
              </div>

              {/* Recipient Dropdown (for one-to-one) */}
              {formData.notification_type === 'one-to-one' && (
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Recipient *
                  </label>
                  <select
                    value={formData.recipient_id}
                    onChange={(e) => setFormData({ ...formData, recipient_id: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none focus:border-[#2d348f] focus:ring-2 focus:ring-[#2d348f]/10"
                  >
                    <option value="">Select a user...</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Header/Title */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  value={formData.media_header}
                  onChange={(e) => setFormData({ ...formData, media_header: e.target.value })}
                  required
                  placeholder="Enter notification title"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none focus:border-[#2d348f] focus:ring-2 focus:ring-[#2d348f]/10"
                />
              </div>

              {/* Description/Narration */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Message *</label>
                <textarea
                  value={formData.media_narration}
                  onChange={(e) => setFormData({ ...formData, media_narration: e.target.value })}
                  required
                  rows={4}
                  placeholder="Enter message details..."
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none focus:border-[#2d348f] focus:ring-2 focus:ring-[#2d348f]/10"
                />
              </div>

              {/* URL Link */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  External Link URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.media_url}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none focus:border-[#2d348f] focus:ring-2 focus:ring-[#2d348f]/10"
                />
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Upload File / PDF / Video (Optional)
                </label>
                <div className="flex w-full items-center justify-center">
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        {file ? (
                          <span className="font-semibold text-[#2d348f]">{file.name}</span>
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
                      accept="application/pdf,video/*,.mp4"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#2d348f] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#1f2468] disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
