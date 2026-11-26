import { useState } from 'react';
import { X, FolderKanban } from 'lucide-react';

export default function ProjectModal({ isOpen, onClose, onCreateProject }) {
  const [form, setForm] = useState({ name: '', projectKey: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.projectKey.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await onCreateProject({
        name: form.name.trim(),
        projectKey: form.projectKey.trim().toUpperCase(),
        description: form.description.trim(),
      });
      setForm({ name: '', projectKey: '', description: '' });
      onClose();
    } catch (err) {
      const serverMsg =
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message || 'Cette clé de projet est déjà utilisée.';
      setErrorMsg(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#091e42]/55 p-4 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#dfe1e6] px-5 py-3.5">
          <div className="flex items-center gap-2 text-[14px] font-bold text-[#172b4d]">
            <FolderKanban size={18} className="text-[#0052cc]" />
            <span>Créer un nouveau projet Agile</span>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer text-[#5e6c84] hover:text-[#172b4d]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 p-5">
          {errorMsg && (
            <div className="rounded bg-[#ffebe6] px-3 py-2 text-[12.5px] font-medium text-[#bf2600]">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="mb-1 block text-[11px] font-bold tracking-wide text-[#5e6c84] uppercase">
              Nom du projet *
            </label>
            <input
              className="w-full rounded border border-[#dfe1e6] bg-[#fafbfc] px-2.5 py-2 text-[13px] focus:border-[#0052cc] focus:bg-white focus:outline-none"
              placeholder="Ex: Plateforme E-Commerce"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold tracking-wide text-[#5e6c84] uppercase">
              Clé du projet (Max 10 caractères) *
            </label>
            <input
              className="w-full rounded border border-[#dfe1e6] bg-[#fafbfc] px-2.5 py-2 text-[13px] uppercase focus:border-[#0052cc] focus:bg-white focus:outline-none"
              placeholder="Ex: ECOM"
              maxLength={10}
              value={form.projectKey}
              onChange={(e) => setForm({ ...form, projectKey: e.target.value.toUpperCase() })}
              required
            />
            <span className="mt-1 block text-[11.5px] text-[#5e6c84]">
              Préfixe des tickets : {form.projectKey || 'ECOM'}-1, {form.projectKey || 'ECOM'}-2
            </span>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold tracking-wide text-[#5e6c84] uppercase">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded border border-[#dfe1e6] bg-[#fafbfc] px-2.5 py-2 text-[13px] focus:border-[#0052cc] focus:bg-white focus:outline-none"
              placeholder="Objectifs principaux du projet..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded border border-[#dfe1e6] bg-[#f4f5f7] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#172b4d] hover:bg-[#ebecf0]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded bg-[#0052cc] px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#0747a6] disabled:opacity-60"
            >
              {submitting ? 'Création...' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}