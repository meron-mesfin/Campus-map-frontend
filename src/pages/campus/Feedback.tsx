import React, { useState } from 'react';
import { initialFeedback, initialLocations, Feedback as FeedbackType } from '../../data/mockData';
import { CheckCircleIcon, Trash2Icon, StarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
export function Feedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>(initialFeedback);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const filteredFeedbacks = feedbacks.filter((f) => {
    if (filter === 'pending') return !f.reviewed;
    if (filter === 'reviewed') return f.reviewed;
    return true;
  });
  const handleToggleReview = (id: string) => {
    setFeedbacks(feedbacks.map((f) => f.id === id ? {
      ...f,
      reviewed: !f.reviewed
    } : f));
    const feedback = feedbacks.find((f) => f.id === id);
    toast.success(feedback?.reviewed ? 'Marked as pending' : 'Marked as reviewed');
  };
  const handleDelete = () => {
    if (deleteId) {
      setFeedbacks(feedbacks.filter((f) => f.id !== deleteId));
      toast.success('Feedback deleted');
      setDeleteId(null);
    }
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            User Feedback
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Review and manage feedback from campus users.
          </p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="all">All Feedback</option>
          <option value="pending">Pending Review</option>
          <option value="reviewed">Reviewed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredFeedbacks.length === 0 ? <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              No feedback found.
            </p>
          </div> : filteredFeedbacks.map((feedback) => {
        const location = initialLocations.find((l) => l.id === feedback.locationId);
        return <div key={feedback.id} className={`p-5 rounded-xl border transition-colors ${feedback.reviewed ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-slate-800 border-primary-200 dark:border-primary-800 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {location?.name || 'Unknown Location'}
                      {!feedback.reviewed && <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-medium">
                          New
                        </span>}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      By {feedback.user} •{' '}
                      {new Date(feedback.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => <StarIcon key={star} size={16} className={star <= feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'} />)}
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  {feedback.comment}
                </p>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button onClick={() => handleToggleReview(feedback.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${feedback.reviewed ? 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40'}`}>
                    <CheckCircleIcon size={16} />
                    {feedback.reviewed ? 'Mark as Pending' : 'Mark as Reviewed'}
                  </button>
                  <button onClick={() => setDeleteId(feedback.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2Icon size={16} />
                    Delete
                  </button>
                </div>
              </div>;
      })}
      </div>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Feedback" message="Are you sure you want to delete this feedback? This action cannot be undone." />
    </div>;
}