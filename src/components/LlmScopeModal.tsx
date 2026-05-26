import { useState, type FormEvent } from "react";
import { Button } from "./Button";
import { GlassPanel } from "./GlassPanel";

export type LlmScopeChoice = "selected" | "visible";

export interface LlmScopeModalLabels {
  cancel: string;
  close: string;
  currentViewDescription: string;
  currentViewLabel: string;
  selectedDescription: string;
  selectedLabel: string;
  submit: string;
  title: string;
}

export interface LlmScopeModalProps {
  defaultScope: LlmScopeChoice;
  isSubmitting?: boolean;
  labels: LlmScopeModalLabels;
  onClose: () => void;
  onSubmit: (scope: LlmScopeChoice) => void;
  selectedCount: number;
  visibleCount: number;
}

export function LlmScopeModal({
  defaultScope,
  isSubmitting = false,
  labels,
  onClose,
  onSubmit,
  selectedCount,
  visibleCount
}: LlmScopeModalProps) {
  const [scope, setScope] = useState<LlmScopeChoice>(defaultScope);
  const canSubmit = scope === "selected" ? selectedCount > 0 : visibleCount > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canSubmit) {
      onSubmit(scope);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <GlassPanel aria-modal="true" className="llm-scope-modal" role="dialog">
        <div className="llm-scope-modal__heading">
          <h2>{labels.title}</h2>
          <Button aria-label={labels.close} icon="x" onClick={onClose} variant="icon" />
        </div>

        <form className="llm-scope-modal__form" onSubmit={handleSubmit}>
          <label className="llm-scope-option">
            <input
              checked={scope === "selected"}
              disabled={!selectedCount || isSubmitting}
              name="llm-scope"
              onChange={() => setScope("selected")}
              type="radio"
            />
            <span>
              <strong>{labels.selectedLabel}</strong>
              <small>{labels.selectedDescription}</small>
            </span>
          </label>

          <label className="llm-scope-option">
            <input
              checked={scope === "visible"}
              disabled={!visibleCount || isSubmitting}
              name="llm-scope"
              onChange={() => setScope("visible")}
              type="radio"
            />
            <span>
              <strong>{labels.currentViewLabel}</strong>
              <small>{labels.currentViewDescription}</small>
            </span>
          </label>

          <div className="llm-scope-modal__actions">
            <Button disabled={isSubmitting} onClick={onClose} variant="subtle">
              {labels.cancel}
            </Button>
            <Button disabled={isSubmitting || !canSubmit} icon="sparkles" type="submit" variant="primary">
              {labels.submit}
            </Button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
