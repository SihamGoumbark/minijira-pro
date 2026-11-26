import { useState } from 'react';
import { Plus, Play, CheckCircle2, Calendar, Layers } from 'lucide-react';
import IssueTypeIcon from '../components/IssueTypeIcon';

const SPRINT_BADGE_STYLES = {
  ACTIVE: 'bg-[#deebff] text-[#0052cc]',
  PLANNED: 'bg-[#ebecf0] text-[#42526e]',
  COMPLETED: 'bg-[#e3fcef] text-[#006644]',
};

const STATUS_PILL_STYLES = {
  TODO: 'bg-[#dfe1e6] text-[#42526e]',
  IN_PROGRESS: 'bg-[#deebff] text-[#0747a6]',
  DONE: 'bg-[#e3fcef] text-[#006644]',
};

export default function BacklogPage({
  tasks,
  sprints,
  isAdmin,
  onCreateSprint,
  onStartSprint,
  onCompleteSprint,
  onAssignSprint,
  onSelectTask,
  onOpenCreateModal,
}) {
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [sprintForm, setSprintForm] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });

  const handleCreateSprintSubmit = async (e) => {
    e.preventDefault();
    if (!sprintForm.name.trim()) return;
    await onCreateSprint(sprintForm);
    setSprintForm({ name: '', goal: '', startDate: '', endDate: '' });
    setShowSprintForm(false);
  };

  const backlogTasks = tasks.filter((t) => !t.sprint);

  const renderTaskRow = (task) => (
    <div
      key={task.id}
      onClick={() => onSelectTask(task)}
      className="flex cursor-pointer items-center justify-between gap-3 rounded border border-[#dfe1e6] bg-white px-3 py-2 transition hover:border-[#b3d4ff] hover:bg-[#fafbfc]"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <IssueTypeIcon type={task.issueType} />
        <span className="shrink-0 text-[11.5px] font-bold text-[#5e6c84]">{task.ticketKey}</span>
        <span className="truncate text-[13px] font-medium text-[#172b4d]">{task.title}</span>
      </div>

      <div
        className="flex shrink-0 items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
            STATUS_PILL_STYLES[task.status] || 'bg-[#dfe1e6] text-[#42526e]'
          }`}
        >
          {task.status.replace('_', ' ')}
        </span>
        {task.assignee && (
          <span className="rounded bg-[#deebff] px-2 py-0.5 text-[10.5px] font-semibold text-[#0747a6]">
            {task.assignee}
          </span>
        )}
        <span className="rounded-full bg-[#ebecf0] px-2 py-0.5 text-[10.5px] font-bold text-[#172b4d]">
          {task.storyPoints} pts
        </span>
        <select
          className="rounded border border-[#dfe1e6] bg-[#f4f5f7] px-2 py-1 text-[11.5px] text-[#172b4d] focus:border-[#0052cc] focus:outline-none"
          value={task.sprint?.id || ''}
          onChange={(e) => onAssignSprint(task.id, e.target.value)}
        >
          <option value="">Backlog</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const inputClass =
    'w-full rounded border border-[#dfe1e6] bg-white px-2.5 py-1.5 text-[12.5px] text-[#172b4d] focus:border-[#0052cc] focus:outline-none';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-[#172b4d]">Backlog & Planification des Sprints</h2>
          <p className="text-[12px] text-[#5e6c84]">
            Organisez vos itérations Scrum et affectez les User Stories aux Sprints
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowSprintForm(!showSprintForm)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#dfe1e6] bg-[#f4f5f7] px-3 py-1.5 text-[12.5px] font-semibold text-[#172b4d] hover:bg-[#ebecf0]"
            >
              <Plus size={15} /> Créer un Sprint
            </button>
          )}
          <button
            onClick={onOpenCreateModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#0052cc] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#0747a6]"
          >
            <Plus size={15} /> Créer un ticket
          </button>
        </div>
      </div>

      {showSprintForm && (
        <form
          onSubmit={handleCreateSprintSubmit}
          className="mb-4 grid grid-cols-1 gap-2 rounded-md bg-[#f4f5f7] p-3 md:grid-cols-[1.4fr_1.4fr_1fr_1fr_auto]"
        >
          <input
            className={inputClass}
            placeholder="Nom du Sprint (ex: Sprint 1)"
            value={sprintForm.name}
            onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Objectif du Sprint (Sprint Goal)"
            value={sprintForm.goal}
            onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })}
          />
          <input
            type="date"
            className={inputClass}
            value={sprintForm.startDate}
            onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })}
          />
          <input
            type="date"
            className={inputClass}
            value={sprintForm.endDate}
            onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })}
          />
          <button
            type="submit"
            className="cursor-pointer rounded bg-[#0052cc] px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#0747a6]"
          >
            Enregistrer
          </button>
        </form>
      )}

      {/* Liste des Sprints */}
      {sprints.map((sprint) => {
        const sprintTasks = tasks.filter((t) => t.sprint?.id === sprint.id);
        const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

        return (
          <div key={sprint.id} className="mb-4 rounded-md bg-[#f4f5f7] p-3">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-[13.5px] text-[#172b4d]">{sprint.name}</strong>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    SPRINT_BADGE_STYLES[sprint.status] || 'bg-[#ebecf0] text-[#42526e]'
                  }`}
                >
                  {sprint.status}
                </span>
                {(sprint.startDate || sprint.endDate) && (
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-[#5e6c84]">
                    <Calendar size={12} /> {sprint.startDate || '?'} → {sprint.endDate || '?'}
                  </span>
                )}
                <span className="text-[11.5px] text-[#5e6c84]">
                  ({sprintTasks.length} tickets · {totalPoints} pts)
                </span>
              </div>

              {isAdmin && (
                <div>
                  {sprint.status === 'PLANNED' && (
                    <button
                      onClick={() => onStartSprint(sprint.id)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded bg-[#0052cc] px-2.5 py-1 text-[11.5px] font-semibold text-white hover:bg-[#0747a6]"
                    >
                      <Play size={12} /> Démarrer le Sprint
                    </button>
                  )}
                  {sprint.status === 'ACTIVE' && (
                    <button
                      onClick={() => onCompleteSprint(sprint.id)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded bg-[#00875a] px-2.5 py-1 text-[11.5px] font-semibold text-white hover:bg-[#006644]"
                    >
                      <CheckCircle2 size={12} /> Clôturer le Sprint
                    </button>
                  )}
                </div>
              )}
            </div>

            {sprint.goal && (
              <div className="mb-2 text-[12px] text-[#42526e]">
                Objectif : <em>{sprint.goal}</em>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              {sprintTasks.length === 0 ? (
                <div className="rounded border border-dashed border-[#c1c7d0] bg-[#fafbfc] p-3 text-center text-[12px] text-[#5e6c84]">
                  Aucun ticket planifié. Affectez des tickets depuis le Backlog ci-dessous.
                </div>
              ) : (
                sprintTasks.map(renderTaskRow)
              )}
            </div>
          </div>
        );
      })}

      {/* Backlog */}
      <div className="rounded-md bg-[#f4f5f7] p-3">
        <div className="mb-2 flex items-center gap-2">
          <Layers size={15} className="text-[#42526e]" />
          <strong className="text-[13.5px] text-[#172b4d]">Backlog Produit</strong>
          <span className="text-[11.5px] text-[#5e6c84]">({backlogTasks.length} tickets)</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {backlogTasks.length === 0 ? (
            <div className="rounded border border-dashed border-[#c1c7d0] bg-[#fafbfc] p-3 text-center text-[12px] text-[#5e6c84]">
              Le Backlog est vide.
            </div>
          ) : (
            backlogTasks.map(renderTaskRow)
          )}
        </div>
      </div>
    </div>
  );
}