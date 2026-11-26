import { useState } from 'react';
import { Zap } from 'lucide-react';
import IssueTypeIcon from '../components/IssueTypeIcon';

const COLUMNS = [
  { key: 'TODO', label: 'TO DO', dotColor: '#5e6c84' },
  { key: 'IN_PROGRESS', label: 'IN PROGRESS', dotColor: '#0052cc' },
  { key: 'DONE', label: 'DONE', dotColor: '#36b37e' },
];

const PRIORITY_STYLES = {
  HIGH: 'bg-[#ffebe6] text-[#bf2600]',
  MEDIUM: 'bg-[#fffae6] text-[#974f0c]',
  LOW: 'bg-[#e3fcef] text-[#006644]',
};

export default function BoardPage({
  tasks,
  sprints,
  onMoveStatus,
  onSelectTask,
}) {
  const [selectedSprintId, setSelectedSprintId] = useState('ALL');
  const [dragOverCol, setDragOverCol] = useState(null);

  const visibleTasks = tasks.filter((t) => {
    if (selectedSprintId === 'ALL') return true;
    if (selectedSprintId === 'BACKLOG') return !t.sprint;
    return t.sprint?.id === Number(selectedSprintId);
  });

  const activeSprint =
    selectedSprintId !== 'ALL' && selectedSprintId !== 'BACKLOG'
      ? sprints.find((s) => s.id === Number(selectedSprintId))
      : null;

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId.toString());
  };

  const onDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = Number(e.dataTransfer.getData('taskId'));
    const dragged = tasks.find((t) => t.id === taskId);
    if (dragged && dragged.status !== targetStatus) {
      onMoveStatus(taskId, targetStatus);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-[#172b4d]">Tableau Kanban</h2>
          <p className="text-[12px] text-[#5e6c84]">
            Glissez-déposez les cartes ou cliquez sur un ticket pour voir ses détails
          </p>
        </div>

        <div className="flex min-w-[220px] items-center gap-2">
          <Zap size={15} className="shrink-0 text-[#0052cc]" />
          <select
            className="w-full rounded border border-[#dfe1e6] bg-[#fafbfc] px-2.5 py-1.5 text-[12.5px] text-[#172b4d] focus:border-[#0052cc] focus:bg-white focus:outline-none"
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
          >
            <option value="ALL">Tous les tickets ({tasks.length})</option>
            <option value="BACKLOG">Backlog uniquement</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeSprint?.goal && (
        <div className="mb-3.5 rounded-md bg-[#deebff] px-3.5 py-2 text-[12px] text-[#0747a6]">
          <strong>{activeSprint.name}</strong> — Objectif : {activeSprint.goal}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = visibleTasks.filter((t) => t.status === col.key);
          const isOver = dragOverCol === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col.key);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => onDrop(e, col.key)}
              className={`min-h-[120px] rounded-lg border-2 p-3 transition-colors ${
                isOver ? 'border-[#0052cc] bg-[#deebff]' : 'border-transparent bg-[#f4f5f7]'
              }`}
            >
              {/* Header colonne */}
              <div className="mb-3 flex items-center justify-between px-0.5 text-[11.5px] font-bold tracking-wide text-[#42526e]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: col.dotColor }}
                  />
                  <span>{col.label}</span>
                </div>
                <span className="rounded-full bg-[#dfe1e6] px-2 py-0.5 text-[11px] font-bold text-[#172b4d]">
                  {colTasks.length}
                </span>
              </div>

              {/* Stack de cartes */}
              <div className="flex flex-col gap-2.5">
                {colTasks.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[#c1c7d0] bg-white/50 px-3 py-4 text-center text-[11.5px] text-[#6b778c]">
                    Déposez un ticket ici
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                      onClick={() => onSelectTask(task)}
                      className="flex cursor-pointer flex-col gap-2.5 rounded-md bg-white p-3 shadow-xs ring-1 ring-[#091e42]/8 transition hover:-translate-y-0.5 hover:bg-[#fafbfc] hover:shadow-md hover:ring-[#4c9aff]"
                    >
                      {/* Niveau 1 : Type + Clé à gauche, Priorité à droite */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <IssueTypeIcon type={task.issueType} />
                          <span className="text-[11.5px] font-bold tracking-wide text-[#5e6c84]">
                            {task.ticketKey}
                          </span>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            PRIORITY_STYLES[task.priority] || 'bg-[#ebecf0] text-[#42526e]'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Niveau 2 : Titre aéré */}
                      <div className="line-clamp-3 text-[13px] font-medium leading-snug break-words text-[#172b4d]">
                        {task.title}
                      </div>

                      {/* Niveau 3 : Sprint à gauche, Points + Avatar à droite */}
                      <div className="flex items-center justify-between gap-2 border-t border-[#f4f5f7] pt-2">
                        {task.sprint ? (
                          <span className="max-w-[125px] truncate rounded bg-[#eae6ff] px-2 py-0.5 text-[10.5px] font-semibold text-[#403294]">
                            {task.sprint.name}
                          </span>
                        ) : (
                          <span className="rounded bg-[#f4f5f7] px-2 py-0.5 text-[10.5px] font-semibold text-[#5e6c84]">
                            Backlog
                          </span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <span
                            className="rounded-full bg-[#ebecf0] px-2 py-0.5 text-[10.5px] font-bold text-[#172b4d]"
                            title="Story Points"
                          >
                            {task.storyPoints} pts
                          </span>
                          {task.assignee && (
                            <span
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0052cc] text-[10px] font-bold text-white"
                              title={`Assigné à : ${task.assignee}`}
                            >
                              {task.assignee.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}