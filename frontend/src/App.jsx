import { useEffect, useState, useRef, useMemo } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Activity, FolderPlus } from 'lucide-react';

import api, { WS_BASE_URL, setupInterceptors } from './services/api';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TaskModal from './components/TaskModal';
import ProjectModal from './components/ProjectModal';

import AuthPage from './pages/AuthPage';
import BacklogPage from './pages/BacklogPage';
import BoardPage from './pages/BoardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TeamPage from './pages/TeamPage';

const ACTIVITY_BORDER = {
  CREATED: 'border-l-[#36b37e]',
  DELETED: 'border-l-[#de350b]',
  COMMENTED: 'border-l-[#6554c0]',
};

export default function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('jira_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [activities, setActivities] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

  const [activePage, setActivePage] = useState('BOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const authRef = useRef(auth);
  authRef.current = auth;

  const isAdmin = auth?.role === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('jira_auth');
    setAuth(null);
    setProjects([]);
    setSelectedProject(null);
    setTasks([]);
    setSprints([]);
  };

  useEffect(() => {
    const eject = setupInterceptors(
      () => authRef.current?.token,
      () => handleLogout()
    );
    return eject;
  }, []);

  const handleAuthSuccess = (data) => {
    localStorage.setItem('jira_auth', JSON.stringify(data));
    setAuth(data);
  };

  useEffect(() => {
    if (!auth) return;
    fetchProjects();
  }, [auth]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (res.data.length > 0 && !selectedProject) {
        setSelectedProject(res.data[0]);
      } else if (res.data.length === 0) {
        setIsProjectModalOpen(true);
      }
    } catch (err) {
      console.error('Erreur chargement projets:', err);
    }
  };

  const handleCreateProject = async (projectData) => {
    const res = await api.post('/projects', projectData);
    setProjects((prev) => [...prev, res.data]);
    setSelectedProject(res.data);
  };

  useEffect(() => {
    if (!selectedProject || !auth) {
      setWsConnected(false);
      return;
    }

    const projectId = selectedProject.id;
    fetchTasks(projectId);
    fetchSprints(projectId);
    fetchActivities(projectId);

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setWsConnected(true);
        client.subscribe(`/topic/projects/${projectId}`, () => {
          fetchTasks(projectId);
          fetchSprints(projectId);
          fetchActivities(projectId);
        });
      },
      onDisconnect: () => setWsConnected(false),
    });

    client.activate();
    return () => client.deactivate();
  }, [selectedProject, auth]);

  const fetchTasks = async (projectId) => {
    const res = await api.get(`/tasks/project/${projectId}`);
    setTasks(res.data);
  };

  const fetchSprints = async (projectId) => {
    const res = await api.get(`/agile/projects/${projectId}/sprints`);
    setSprints(res.data);
  };

  const fetchActivities = async (projectId) => {
    const res = await api.get(`/tasks/project/${projectId}/activities`);
    setActivities(res.data);
  };

  const handleSaveTask = async (formData, taskId) => {
    if (!selectedProject) return;
    if (taskId) {
      await api.put(`/tasks/${taskId}`, formData);
    } else {
      await api.post(`/tasks/project/${selectedProject.id}`, formData);
    }
    await fetchTasks(selectedProject.id);
    await fetchActivities(selectedProject.id);
  };

  const handleMoveStatus = async (taskId, newStatus) => {
    await api.patch(`/tasks/${taskId}/status`, null, {
      params: { status: newStatus },
    });
    await fetchTasks(selectedProject.id);
    await fetchActivities(selectedProject.id);
  };

  const handleDeleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    await fetchTasks(selectedProject.id);
    await fetchActivities(selectedProject.id);
  };

  const handleCreateSprint = async (sprintData) => {
    if (!selectedProject) return;
    await api.post(`/agile/projects/${selectedProject.id}/sprints`, sprintData);
    await fetchSprints(selectedProject.id);
    await fetchActivities(selectedProject.id);
  };

  const handleStartSprint = async (sprintId) => {
    await api.patch(`/agile/sprints/${sprintId}/status`, null, {
      params: { status: 'ACTIVE' },
    });
    await fetchSprints(selectedProject.id);
    await fetchActivities(selectedProject.id);
  };

  const handleCompleteSprint = async (sprintId) => {
    await api.patch(`/agile/sprints/${sprintId}/status`, null, {
      params: { status: 'COMPLETED' },
    });
    await fetchSprints(selectedProject.id);
    await fetchActivities(selectedProject.id);
  };

  const handleAssignSprint = async (taskId, sprintId) => {
    await api.patch(`/agile/tasks/${taskId}/sprint`, null, {
      params: sprintId ? { sprintId: Number(sprintId) } : {},
    });
    await fetchTasks(selectedProject.id);
    await fetchActivities(selectedProject.id);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesQuery =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticketKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.assignee && t.assignee.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'ALL' || t.issueType === typeFilter;
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      return matchesQuery && matchesType && matchesPriority;
    });
  }, [tasks, searchQuery, typeFilter, priorityFilter]);

  if (!auth) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        auth={auth}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={(proj) => setSelectedProject(proj)}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        activePage={activePage}
        setActivePage={setActivePage}
        wsConnected={wsConnected}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          selectedProject={selectedProject}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          onOpenCreateModal={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
        />

        <div className="flex flex-1 overflow-hidden">
          <main className="min-w-0 flex-1 overflow-y-auto bg-white px-5 py-4">
            {!selectedProject ? (
              <div className="px-5 py-16 text-center text-[#5e6c84]">
                <FolderPlus size={44} className="mx-auto mb-3 text-[#0052cc]" />
                <h2 className="text-[18px] font-bold text-[#172b4d]">Bienvenue dans Mini-Jira Pro</h2>
                <p className="mx-auto mt-1.5 mb-4 max-w-md text-[13px]">
                  Vous n'avez pas encore de projet. Créez votre premier espace Agile pour gérer vos sprints et tickets.
                </p>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#0052cc] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0747a6]"
                >
                  + Créer mon premier projet
                </button>
              </div>
            ) : (
              <>
                {activePage === 'BACKLOG' && (
                  <BacklogPage
                    tasks={filteredTasks}
                    sprints={sprints}
                    isAdmin={isAdmin}
                    onCreateSprint={handleCreateSprint}
                    onStartSprint={handleStartSprint}
                    onCompleteSprint={handleCompleteSprint}
                    onAssignSprint={handleAssignSprint}
                    onSelectTask={(task) => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    onOpenCreateModal={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                  />
                )}

                {activePage === 'BOARD' && (
                  <BoardPage
                    tasks={filteredTasks}
                    sprints={sprints}
                    onMoveStatus={handleMoveStatus}
                    onSelectTask={(task) => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                  />
                )}

                {activePage === 'ANALYTICS' && (
                  <AnalyticsPage projectId={selectedProject.id} tasks={tasks} />
                )}

                {activePage === 'TEAM' && (
                  <TeamPage project={selectedProject} tasks={tasks} auth={auth} />
                )}
              </>
            )}
          </main>

          {selectedProject && (
            <aside className="hidden w-[215px] shrink-0 overflow-y-auto border-l border-[#dfe1e6] bg-[#fafbfc] p-3 xl:block">
              <div className="mb-2.5 flex items-center gap-1.5 border-b border-[#dfe1e6] pb-2 text-[12.5px] font-bold text-[#172b4d]">
                <Activity size={15} className="text-[#0052cc]" />
                <span>Activité en direct</span>
              </div>
              <div className="flex flex-col gap-2">
                {activities.length === 0 ? (
                  <p className="text-[11.5px] text-[#5e6c84]">Aucune activité récente.</p>
                ) : (
                  activities.map((a) => (
                    <div
                      key={a.id}
                      className={`rounded border border-[#dfe1e6] border-l-[3px] bg-white px-2.5 py-2 text-[11.5px] leading-snug ${
                        ACTIVITY_BORDER[a.action] || 'border-l-[#0052cc]'
                      }`}
                    >
                      <div className="text-[#172b4d]">{a.details}</div>
                      <div className="mt-1 text-[10.5px] text-[#5e6c84]">
                        {new Date(a.timestamp || a.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        sprints={sprints}
        auth={auth}
        isAdmin={isAdmin}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        onAssignSprint={handleAssignSprint}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}