import { useEffect, useState } from 'react';
import { X, Send, Trash2, MessageSquare } from 'lucide-react';
import api from '../services/api';
import IssueTypeIcon from './IssueTypeIcon';

export default function TaskModal({
  isOpen,
  onClose,
  task,
  sprints,
  auth,
  isAdmin,
  onSaveTask,
  onDeleteTask,
  onAssignSprint,
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    issueType: 'TASK',
    status: 'TODO',
    priority: 'MEDIUM',
    storyPoints: 3,
    assignee: '',
    sprintId: '',
  });

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        issueType: task.issueType || 'TASK',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        storyPoints: task.storyPoints || 3,
        assignee: task.assignee || '',
        sprintId: task.sprint?.id || '',
      });
      loadComments(task.id);
    } else {
      setForm({
        title: '',
        description: '',
        issueType: 'STORY',
        status: 'TODO',
        priority: 'MEDIUM',
        storyPoints: 3,
        assignee: auth?.fullName || '',
        sprintId: '',
      });
      setComments([]);
    }
  }, [isOpen, task]);

  const loadComments = async (taskId) => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/tasks/${taskId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Erreur chargement commentaires', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;
    const res = await api.post(`/tasks/${task.id}/comments`, {
      authorName: auth.fullName,
      content: newComment,
    });
    setComments([...comments, res.data]);
    setNewComment('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await onSaveTask(form, task?.id);
    if (task && String(task.sprint?.id || '') !== String(form.sprintId)) {
      await onAssignSprint(task.id, form.sprintId);
    }
    onClose();
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full rounded border border-[#dfe1e6] bg-[#fafbfc] px-2.5 py-1.5 text-[13px] text-[#172b4d] focus:border-[#0052cc] focus:bg-white focus:outline-none';
  const labelClass = 'block text-[10.5px] font-bold tracking-wide text-[#5e6c84] uppercase';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#091e42]/55 p-4 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[780px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#dfe1e6] px-5 py-3">
          <div className="flex items-center gap-2">
            <IssueTypeIcon type={form.issueType} showLabel={!task} />
            {task ? (
              <span className="text-[13px] font-bold text-[#42526e]">{task.ticketKey}</span>
            ) : (
              <strong className="text-[14px] text-[#172b4d]">Créer un ticket</strong>
            )}
          </div>
          <div className="flex items-center gap-2">
            {task && isAdmin && (
              <button
                type="button"
                onClick={async () => {
                  await onDeleteTask(task.id);
                  onClose();
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded bg-[#ffebe6] px-2.5 py-1 text-[12px] font-semibold text-[#bf2600] hover:bg-[#ffbdad]"
              >
                <Trash2 size={13} /> Supprimer
              </button>
            )}
            <button type="button" onClick={onClose} className="cursor-pointer text-[#5e6c84] hover:text-[#172b4d]">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 overflow-y-auto p-5 md:grid-cols-[1.6fr_1fr]">
          {/* Colonne principale */}
          <div className="flex flex-col gap-3">
            <div>
              <label className={`${labelClass} mb-1`}>Résumé / Titre *</label>
              <input
                className={`${inputClass} text-[14px] font-semibold`}
                placeholder="Ex: Implémenter l'authentification JWT..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={`${labelClass} mb-1`}>Description détaillée</label>
              <textarea
                rows={4}
                className={inputClass}
                placeholder="Critères d'acceptation, étapes de reproduction..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {task && (
              <div className="mt-2 border-t border-[#dfe1e6] pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold text-[#172b4d]">
                  <MessageSquare size={14} /> Commentaires ({comments.length})
                </div>

                <div className="mb-2.5 flex max-h-40 flex-col gap-2 overflow-y-auto">
                  {loadingComments ? (
                    <p className="text-[12px] text-[#5e6c84]">Chargement...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-[12px] text-[#5e6c84]">Aucun commentaire pour le moment.</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="rounded bg-[#f4f5f7] px-2.5 py-2 text-[12px]">
                        <div className="mb-0.5 flex justify-between text-[11px] text-[#5e6c84]">
                          <strong className="text-[#172b4d]">{c.authorName}</strong>
                          <span>
                            {new Date(c.createdAt).toLocaleString([], {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-[#172b4d]">{c.content}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded border border-[#dfe1e6] bg-[#f4f5f7] px-3 py-1.5 text-[12px] font-semibold text-[#172b4d] hover:bg-[#ebecf0]"
                  >
                    <Send size={13} /> Envoyer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="flex flex-col gap-2.5">
            <div>
              <label className={`${labelClass} mb-1`}>Type de ticket</label>
              <select
                className={inputClass}
                value={form.issueType}
                onChange={(e) => setForm({ ...form, issueType: e.target.value })}
              >
                <option value="EPIC">Epic</option>
                <option value="STORY">Story</option>
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
              </select>
            </div>

            <div>
              <label className={`${labelClass} mb-1`}>Statut</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className={`${labelClass} mb-1`}>Priorité</label>
              <select
                className={inputClass}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className={`${labelClass} mb-1`}>Estimation (Story Points)</label>
              <select
                className={inputClass}
                value={form.storyPoints}
                onChange={(e) => setForm({ ...form, storyPoints: Number(e.target.value) })}
              >
                {[1, 2, 3, 5, 8, 13].map((pt) => (
                  <option key={pt} value={pt}>
                    {pt} {pt === 1 ? 'pt' : 'pts'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`${labelClass} mb-1`}>Assigné à</label>
              <input
                className={inputClass}
                placeholder="Nom du membre..."
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              />
            </div>

            <div>
              <label className={`${labelClass} mb-1`}>Sprint</label>
              <select
                className={inputClass}
                value={form.sprintId}
                onChange={(e) => setForm({ ...form, sprintId: e.target.value })}
              >
                <option value="">Backlog (Non planifié)</option>
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded border border-[#dfe1e6] bg-[#f4f5f7] px-3 py-1.5 text-[12px] font-semibold text-[#172b4d] hover:bg-[#ebecf0]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded bg-[#0052cc] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0747a6]"
              >
                {task ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}