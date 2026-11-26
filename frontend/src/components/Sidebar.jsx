import {
  FolderKanban, ListTodo, Kanban, BarChart3, Users, Radio, ShieldCheck, LogOut, Plus
} from 'lucide-react';

export default function Sidebar({
  auth,
  projects,
  selectedProject,
  onSelectProject,
  onOpenProjectModal,
  activePage,
  setActivePage,
  wsConnected,
  onLogout,
}) {
  const handleNavClick = (page) => {
    if (!selectedProject) {
      onOpenProjectModal();
      return;
    }
    setActivePage(page);
  };

  const navItems = [
    { id: 'BACKLOG', label: 'Backlog & Sprints', Icon: ListTodo },
    { id: 'BOARD', label: 'Tableau Kanban', Icon: Kanban },
    { id: 'ANALYTICS', label: 'Rapports & Analytics', Icon: BarChart3 },
    { id: 'TEAM', label: 'Équipe & Accès', Icon: Users },
  ];

  return (
    <aside className="flex w-[225px] shrink-0 flex-col gap-3 border-r border-[#dfe1e6] bg-[#f4f5f7] px-2.5 py-3">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-1.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0052cc] text-white">
          <FolderKanban size={18} />
        </div>
        <div>
          <div className="text-[14px] font-bold leading-tight text-[#172b4d]">Mini-Jira Pro</div>
          <div className="text-[11px] text-[#5e6c84]">Agile Software</div>
        </div>
      </div>

      {/* Live WebSocket Badge */}
      <div
        className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[11.5px] font-semibold ${
          wsConnected ? 'bg-[#e3fcef] text-[#006644]' : 'bg-[#ffebe6] text-[#bf2600]'
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        <Radio size={12} />
        <span>{wsConnected ? 'Synchronisation Live' : 'En attente de projet'}</span>
      </div>

      {/* Navigation */}
      <div>
        <div className="px-2 pb-1.5 text-[10.5px] font-bold tracking-wider text-[#5e6c84] uppercase">
          Planification & Suivi
        </div>
        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activePage === id && selectedProject;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={`flex cursor-pointer items-center gap-2.5 rounded px-2.5 py-2 text-left text-[13px] transition ${
                  isActive
                    ? 'bg-[#deebff] font-semibold text-[#0052cc]'
                    : 'font-medium text-[#42526e] hover:bg-[#ebecf0] hover:text-[#172b4d]'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Projets */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 pb-1.5 text-[10.5px] font-bold tracking-wider text-[#5e6c84] uppercase">
          <span>Mes Projets ({projects.length})</span>
          <button
            onClick={onOpenProjectModal}
            title="Créer un nouveau projet"
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded bg-[#ebecf0] text-[#172b4d] hover:bg-[#dfe1e6]"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {projects.length === 0 ? (
            <p className="px-2 py-1 text-[11.5px] text-[#5e6c84]">
              Aucun projet. Cliquez sur <strong>+</strong> pour en créer un.
            </p>
          ) : (
            projects.map((p) => {
              const isSelected = selectedProject?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left transition ${
                    isSelected ? 'bg-white shadow-xs' : 'hover:bg-[#ebecf0]'
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0747a6] text-[10.5px] font-bold text-white">
                    {p.projectKey.slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-semibold text-[#172b4d]">{p.name}</div>
                    <div className="text-[10.5px] text-[#5e6c84]">{p.projectKey}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Profil */}
      <div className="flex flex-col gap-2 border-t border-[#dfe1e6] pt-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-[12px] font-bold text-white">
            {auth.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold text-[#172b4d]">{auth.fullName}</div>
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                auth.role === 'ADMIN' ? 'bg-[#eae6ff] text-[#403294]' : 'bg-[#deebff] text-[#0747a6]'
              }`}
            >
              <ShieldCheck size={10} /> {auth.role}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded bg-[#ebecf0] py-1.5 text-[12px] font-semibold text-[#42526e] transition hover:bg-[#ffebe6] hover:text-[#bf2600]"
        >
          <LogOut size={13} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}