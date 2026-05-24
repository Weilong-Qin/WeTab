import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import {
  DEFAULT_SIDEBAR_WIDTH,
  loadSidebarWidth,
  normalizeSidebarWidth,
  saveSidebarWidth
} from "../services/layoutPreferenceService";
import { cx } from "../utils/classNames";

export interface AppShellProps {
  sidebar: ReactNode;
  topSearch?: ReactNode;
  children: ReactNode;
  fab?: ReactNode;
  closeNavigationLabel?: string;
  openNavigationLabel?: string;
  resizeSidebarLabel?: string;
}

export function AppShell({
  sidebar,
  topSearch,
  children,
  fab,
  closeNavigationLabel = "Close navigation",
  openNavigationLabel = "Open navigation",
  resizeSidebarLabel = "Resize sidebar"
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  useEffect(() => {
    let isMounted = true;

    void loadSidebarWidth().then((width) => {
      if (isMounted) {
        setSidebarWidth(width);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleResizeStart(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const pointerId = event.pointerId;
    const target = event.currentTarget;

    target.setPointerCapture(pointerId);

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      setSidebarWidth(normalizeSidebarWidth(moveEvent.clientX));
    };

    const handleEnd = (endEvent: globalThis.PointerEvent) => {
      const nextWidth = normalizeSidebarWidth(endEvent.clientX);
      setSidebarWidth(nextWidth);
      void saveSidebarWidth(nextWidth);
      target.releasePointerCapture(pointerId);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleEnd);
      window.removeEventListener("pointercancel", handleEnd);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleEnd);
    window.addEventListener("pointercancel", handleEnd);
  }

  return (
    <div
      className={cx("app-shell", sidebarOpen && "is-sidebar-open")}
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <Button
        aria-label={sidebarOpen ? closeNavigationLabel : openNavigationLabel}
        className="app-shell__mobile-toggle"
        icon={sidebarOpen ? "x" : "menu"}
        onClick={() => setSidebarOpen((value) => !value)}
        variant="icon"
      />
      <aside className="app-shell__sidebar">
        {sidebar}
        <div
          aria-label={resizeSidebarLabel}
          aria-valuemax={420}
          aria-valuemin={240}
          aria-valuenow={sidebarWidth}
          className="app-shell__sidebar-resizer"
          onPointerDown={handleResizeStart}
          role="separator"
        />
      </aside>
      <button
        aria-label={closeNavigationLabel}
        className="app-shell__scrim"
        onClick={() => setSidebarOpen(false)}
        type="button"
      />
      {topSearch ? <header className="app-shell__topbar">{topSearch}</header> : null}
      <main className="app-shell__main">{children}</main>
      {fab ? <div className="app-shell__fab">{fab}</div> : null}
    </div>
  );
}
