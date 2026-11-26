import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';

const COLORS = ['#0052cc', '#36b37e', '#ffab00', '#de350b', '#6554c0'];

export default function AnalyticsPage({ projectId, tasks }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    api
      .get(`/agile/projects/${projectId}/analytics`)
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error('Erreur analytics', err));
  }, [projectId, tasks.length]);

  if (!analytics) {
    return <p className="text-[13px] text-[#5e6c84]">Chargement des métriques Agile...</p>;
  }

  const totalTasks = analytics.totalTasks || 0;
  const doneTasks = analytics.doneTasks || 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statusData = Object.entries(analytics.byStatus || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  const priorityData = Object.entries(analytics.byPriority || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const workloadData = Object.entries(analytics.workloadByAssignee || {}).map(([name, points]) => ({
    name,
    points,
  }));

  const typeCounts = tasks.reduce((acc, t) => {
    const key = t.issueType || 'TASK';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[18px] font-bold text-[#172b4d]">Rapports & Métriques Agile</h2>
        <p className="text-[12px] text-[#5e6c84]">
          Suivi de la vélocité, répartition par statut et charge de l'équipe
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-[#dfe1e6] bg-[#fafbfc] p-3.5">
          <div className="text-[10.5px] font-bold tracking-wide text-[#5e6c84] uppercase">Total Tickets</div>
          <div className="mt-1 text-[20px] font-bold text-[#172b4d]">{totalTasks}</div>
        </div>
        <div className="rounded-lg border border-[#dfe1e6] bg-[#fafbfc] p-3.5">
          <div className="text-[10.5px] font-bold tracking-wide text-[#5e6c84] uppercase">Story Points Totaux</div>
          <div className="mt-1 text-[20px] font-bold text-[#172b4d]">{analytics.totalPoints ?? 0} pts</div>
        </div>
        <div className="rounded-lg border border-[#dfe1e6] bg-[#fafbfc] p-3.5">
          <div className="text-[10.5px] font-bold tracking-wide text-[#5e6c84] uppercase">Vélocité (Terminés)</div>
          <div className="mt-1 text-[20px] font-bold text-[#00875a]">{analytics.completedPoints ?? 0} pts</div>
        </div>
        <div className="rounded-lg border border-[#dfe1e6] bg-[#fafbfc] p-3.5">
          <div className="text-[10.5px] font-bold tracking-wide text-[#5e6c84] uppercase">Taux d'avancement</div>
          <div className="mt-1 text-[20px] font-bold text-[#0052cc]">{completionRate}%</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <div className="rounded-lg border border-[#dfe1e6] bg-white p-4">
          <h3 className="mb-2.5 text-[13.5px] font-bold text-[#172b4d]">Répartition par Statut</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={75} label>
                {statusData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-[#dfe1e6] bg-white p-4">
          <h3 className="mb-2.5 text-[13.5px] font-bold text-[#172b4d]">Charge par Membre (Story Points)</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={workloadData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="points" fill="#0052cc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-[#dfe1e6] bg-white p-4">
          <h3 className="mb-2.5 text-[13.5px] font-bold text-[#172b4d]">Tickets par Type (Epic, Story, Task, Bug)</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#6554c0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-[#dfe1e6] bg-white p-4">
          <h3 className="mb-2.5 text-[13.5px] font-bold text-[#172b4d]">Tickets par Priorité</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={75} label>
                {priorityData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[(idx + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}