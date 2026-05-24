import type { FormEvent } from "react";
import { Button } from "./Button";
import { GlassPanel } from "./GlassPanel";
import { Icon } from "./Icon";

export type BookmarkEditorMode = "bookmark" | "folder";

export interface BookmarkEditorValues {
  title: string;
  url: string;
}

export interface BookmarkEditorLabels {
  cancel: string;
  close: string;
  folderName: string;
  save: string;
  title: string;
  titleLabel: string;
  urlLabel: string;
}

export interface BookmarkEditorModalProps {
  errorMessage?: string | null;
  isSaving?: boolean;
  labels: BookmarkEditorLabels;
  mode: BookmarkEditorMode;
  onChange: (values: BookmarkEditorValues) => void;
  onClose: () => void;
  onSubmit: () => void;
  values: BookmarkEditorValues;
}

export function BookmarkEditorModal({
  errorMessage,
  isSaving = false,
  labels,
  mode,
  onChange,
  onClose,
  onSubmit,
  values
}: BookmarkEditorModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <GlassPanel aria-modal="true" className="bookmark-editor" role="dialog">
        <div className="bookmark-editor__heading">
          <h2>{labels.title}</h2>
          <Button aria-label={labels.close} icon="x" onClick={onClose} variant="icon" />
        </div>

        <form className="bookmark-editor__form" onSubmit={handleSubmit}>
          <label>
            <span>{mode === "folder" ? labels.folderName : labels.titleLabel}</span>
            <input
              autoFocus
              onChange={(event) => onChange({ ...values, title: event.target.value })}
              required
              type="text"
              value={values.title}
            />
          </label>

          {mode === "bookmark" ? (
            <label>
              <span>{labels.urlLabel}</span>
              <input
                onChange={(event) => onChange({ ...values, url: event.target.value })}
                required
                type="url"
                value={values.url}
              />
            </label>
          ) : null}

          {errorMessage ? (
            <p className="bookmark-editor__error">
              <Icon name="shield" size={16} />
              <span>{errorMessage}</span>
            </p>
          ) : null}

          <div className="bookmark-editor__actions">
            <Button disabled={isSaving} onClick={onClose} variant="subtle">
              {labels.cancel}
            </Button>
            <Button disabled={isSaving} icon={mode === "folder" ? "folderAdd" : "bookmarkAdd"} type="submit" variant="primary">
              {labels.save}
            </Button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
