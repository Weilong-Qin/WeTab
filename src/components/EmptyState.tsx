import type { IconName } from "./Icon";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: IconName;
  hideAction?: boolean;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel = "Add bookmark",
  icon = "plus",
  hideAction = false,
  onAction
}: EmptyStateProps) {
  return (
    <section className="empty-state">
      {hideAction ? null : (
        <Button aria-label={actionLabel} icon={icon} onClick={onAction} variant="icon" />
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  );
}
