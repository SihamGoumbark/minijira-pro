import { Search, Plus, Filter, X } from 'lucide-react';

export default function Navbar({
  selectedProject,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  priorityFilter,
  setPriorityFilter,
  onOpenCreateModal,
}) {
  const hasFilters = searchQuery || typeFilter !== 'ALL' || priorityFilter !== 'ALL';

  return (
    <header className="flex min-h-[52px] shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[#dfe1e6] bg-white px-5 py-2">
      <div className="flex shrink-0 items-center gap-3">
        {selectedProject ? (
          <div className="flex items-center gap-1.5 text-[13px] whitespace-nowrap">
            <span className="text-[#5e6c84]">Projets</span>
            <span className="text-[#5e6c84]">/</span>
            <span className="rounded bg-[#f4f5f7] px-1.5 py-0.5 text-[11px] font-bold text-[#42526e]">
              {selectedProject.projectKey}
            </span>
            <span className="text-[#5e6c84]">/</span>
            <strong className="font-semibold text-[#172b4d]">{selectedProject.name}</strong>
          </div>
        ) : (
          <strong className="text-[14px] font-semibold text-[#172b4d]">Espace de travail</strong>
        )}

        {selectedProject && (
          <button
            onClick={onOpenCreateModal}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#0052cc] px-3 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-[#0747a6]"
          >
            <Plus size={15} /> Créer
          </button>
        )}
      </div>

      {selectedProject && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <Search size={14} className="pointer-events-none absolute left-2.5 text-[#5e6c84]" />
            <input
              type="text"
              placeholder="Rechercher un ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 rounded border border-[#dfe1e6] bg-[#fafbfc] py-1 pr-2.5 pl-8 text-[12.5px] text-[#172b4d] transition focus:border-[#0052cc] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-[#5e6c84]" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded border border-[#dfe1e6] bg-white px-2 py-1 text-[12px] text-[#172b4d] focus:border-[#0052cc] focus:outline-none"
            >
              <option value="ALL">Tous types</option>
              <option value="EPIC">Type : Epic</option>
              <option value="STORY">Type : Story</option>
              <option value="TASK">Type : Task</option>
              <option value="BUG">Type : Bug</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded border border-[#dfe1e6] bg-white px-2 py-1 text-[12px] text-[#172b4d] focus:border-[#0052cc] focus:outline-none"
            >
              <option value="ALL">Toutes priorités</option>
              <option value="HIGH">Priorité : High</option>
              <option value="MEDIUM">Priorité : Medium</option>
              <option value="LOW">Priorité : Low</option>
            </select>

            {hasFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('ALL');
                  setPriorityFilter('ALL');
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded bg-[#ffebe6] px-2 py-1 text-[11.5px] font-semibold text-[#bf2600] hover:bg-[#ffbdad]"
                title="Réinitialiser les filtres"
              >
                <X size={13} /> Effacer
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}