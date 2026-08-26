import type { ReactNode } from "react";

export type EmptyStateProps = {
  action?: ReactNode;
  icon?: ReactNode;
  title: string;
};

export function EmptyState({ action, icon, title }: EmptyStateProps) {
  return (
    <section className="empty-state">
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <h2>{title}</h2>
      {action ? <div className="empty-state-action">{action}</div> : null}
    </section>
  );
}
