import { useState } from 'react';
import { ShieldCheck, FolderKanban, UserPlus, Mail } from 'lucide-react';
import api from '../services/api';

export default function TeamPage({ project, tasks, auth, onProjectUpdated }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState({ type: '', text: '' });
  const [members, setMembers] = useState(project?.memberEmails || []);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = !project?.ownerEmail || project.ownerEmail === auth?.email;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !project) return;
    setSubmitting(true);
    setInviteStatus({ type: '', text: '' });

    try {
      const res = await api.post(`/projects/${project.id}/members`, null, {
        params: { email: inviteEmail.trim() },
      });
      setMembers(res.data.memberEmails || [...members, inviteEmail.trim().toLowerCase()]);
      setInviteEmail('');
      setInviteStatus({ type: 'success', text: 'Collaborateur ajouté au projet avec succès !' });
      if (onProjectUpdated) onProjectUpdated(res.data);
    } catch (err) {
      setInviteStatus({
        type: 'error',
        text: err.response?.data?.message || "Impossible d'inviter cet utilisateur (vérifiez son email).",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const memberStats = {};
  tasks.forEach((t) => {
    const name = t.assignee || 'Non assigné';
    if (!memberStats[name]) {
      memberStats[name] = { count: 0, points: 0, done: 0 };
    }
    memberStats[name].count += 1;
    memberStats[name].points += t.storyPoints || 0;
    if (t.status === 'DONE') memberStats[name].done += 1;
  });

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[18px] font-bold text-[#172b4d]">Équipe & Paramètres du Projet</h2>
        <p className="text-[12px] text-[#5e6c84]">
          Gérez les membres du projet et suivez la charge de travail des collaborateurs
        </p>
      </div>

      {project && (
        <div className="mb-4 rounded-lg border border-[#dfe1e6] bg-white p-4">
          <div className="mb-1.5 flex items-center gap-2 text-[14px] font-bold text-[#172b4d]">
            <FolderKanban size={18} className="text-[#0052cc]" />
            <span>
              {project.name} ({project.projectKey})
            </span>
          </div>
          <p className="mb-2 text-[12.5px] text-[#5e6c84]">
            {project.description || 'Aucune description renseignée pour ce projet.'}
          </p>
          <div className="text-[11.5px] text-[#5e6c84]">
            Responsable du projet : <strong>{project.ownerEmail || auth.email}</strong>
          </div>

          {/* Barre d'invitation d'un membre */}
          {isOwner && (
            <div className="mt-4 border-t border-[#f4f5f7] pt-3.5">
              <label className="mb-1.5 block text-[12px] font-bold text-[#172b4d]">
                Inviter un collaborateur par email
              </label>
              <form onSubmit={handleInvite} className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#5e6c84]"
                  />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Ex: developpeur@minijira.ma"
                    className="w-full rounded border border-[#dfe1e6] bg-[#fafbfc] py-2 pr-3 pl-9 text-[12.5px] text-[#172b4d] focus:border-[#0052cc] focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded bg-[#0052cc] px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#0747a6] disabled:opacity-50"
                >
                  <UserPlus size={15} />
                  {submitting ? 'Ajout...' : 'Inviter'}
                </button>
              </form>

              {inviteStatus.text && (
                <div
                  className={`mt-2 rounded px-3 py-1.5 text-[12px] font-medium ${
                    inviteStatus.type === 'success'
                      ? 'bg-[#e3fcef] text-[#006644]'
                      : 'bg-[#ffebe6] text-[#bf2600]'
                  }`}
                >
                  {inviteStatus.text}
                </div>
              )}
            </div>
          )}

          {/* Liste des membres invités */}
          <div className="mt-4 border-t border-[#f4f5f7] pt-3">
            <div className="mb-2 text-[12px] font-bold text-[#172b4d]">
              Membres ayant accès au projet ({members.length + 1})
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#deebff] px-3 py-1 text-[11.5px] font-semibold text-[#0747a6]">
                {project.ownerEmail || auth.email} (Propriétaire)
              </span>
              {members.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f5f7] px-3 py-1 text-[11.5px] font-medium text-[#172b4d]"
                >
                  {email}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-[#dfe1e6] bg-white p-4">
        <h3 className="mb-3 text-[14px] font-bold text-[#172b4d]">Charge de travail par collaborateur</h3>
        {Object.entries(memberStats).map(([member, stat]) => (
          <div
            key={member}
            className="flex items-center justify-between border-b border-[#f4f5f7] py-2.5 last:border-b-0"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0052cc] text-[12.5px] font-bold text-white">
                {member.charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="text-[13px] font-semibold text-[#172b4d]">{member}</div>
                <div className="text-[11.5px] text-[#5e6c84]">
                  {stat.count} ticket(s) · {stat.done} terminé(s)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#ebecf0] px-2.5 py-0.5 text-[11px] font-bold text-[#172b4d]">
                {stat.points} pts
              </span>
              {member === auth.fullName && (
                <span className="inline-flex items-center gap-1 rounded bg-[#eae6ff] px-2 py-0.5 text-[10px] font-bold text-[#403294]">
                  <ShieldCheck size={11} /> Vous ({auth.role})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}