import { Zap, Bookmark, CheckSquare, Bug } from 'lucide-react';

export const ISSUE_TYPE_CONFIG = {
  EPIC: { label: 'Epic', bg: '#6554c0', Icon: Zap },
  STORY: { label: 'Story', bg: '#36b37e', Icon: Bookmark },
  TASK: { label: 'Task', bg: '#0052cc', Icon: CheckSquare },
  BUG: { label: 'Bug', bg: '#de350b', Icon: Bug },
};

export default function IssueTypeIcon({ type = 'TASK', showLabel = false }) {
  const cfg = ISSUE_TYPE_CONFIG[type] || ISSUE_TYPE_CONFIG.TASK;
  const { Icon, bg, label } = cfg;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded text-white"
        style={{ backgroundColor: bg }}
        title={label}
      >
        <Icon size={11} strokeWidth={2.6} />
      </span>
      {showLabel && <span className="text-xs font-semibold text-[#172b4d]">{label}</span>}
    </span>
  );
}