import { BookmarkCard } from "./BookmarkCard";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { GlassPanel } from "./GlassPanel";
import { Sidebar } from "./Sidebar";
import { Tag } from "./Tag";
import { TopSearch } from "./TopSearch";
import { sampleBookmarks, sampleFolders } from "../data/sampleBookmarks";

const colorTokens = [
  ["background", "oklch(99% 0.005 240)"],
  ["surface-container-low", "oklch(97% 0.005 240)"],
  ["surface-container", "oklch(95% 0.005 240)"],
  ["surface-container-highest", "oklch(91% 0.01 240)"],
  ["on-surface", "oklch(20% 0.01 240)"],
  ["secondary", "oklch(50% 0.15 250)"],
  ["error", "oklch(55% 0.2 25)"],
  ["outline-variant", "oklch(85% 0.01 240)"]
];

export function DesignSystemPreview() {
  return (
    <div className="preview-page">
      <header className="preview-hero">
        <Tag tone="blue">Dev preview</Tag>
        <h1>Command Center Design System</h1>
        <p>High-density, technical interface tokens and components.</p>
      </header>

      <section className="preview-section">
        <h2>Color Tokens (OKLCH)</h2>
        <div className="swatch-grid">
          {colorTokens.map(([name, value]) => (
            <div className="token-swatch" key={name}>
              <span className="token-swatch__color" style={{ background: value }} />
              <strong>{name}</strong>
              <code>{value}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="preview-section preview-section--split">
        <GlassPanel>
          <h2>Typography</h2>
          <p className="type-display">Command Center</p>
          <p className="type-headline-lg">Precise Workspace</p>
          <p className="type-body-lg">A high-density technical interface for scanning, searching, and organizing saved URLs.</p>
          <p className="type-label-sm">LABEL SMALL / FOLDER PATH</p>
        </GlassPanel>
        <GlassPanel>
          <h2>Buttons and Tags</h2>
          <div className="preview-inline">
            <Button icon="sparkles" variant="primary">Process</Button>
            <Button icon="sliders" variant="glass">Config</Button>
            <Button icon="plus" variant="icon" />
          </div>
          <div className="preview-inline">
            <Tag tone="blue">System</Tag>
            <Tag tone="red">Critical</Tag>
            <Tag>Neutral</Tag>
          </div>
        </GlassPanel>
      </section>

      <section className="preview-section">
        <h2>Search and Navigation</h2>
        <div className="preview-nav-grid">
          <GlassPanel className="preview-sidebar-shell" padded={false}>
            <Sidebar folders={sampleFolders} onSelectFolder={() => undefined} selectedFolderId="all" />
          </GlassPanel>
          <GlassPanel>
            <TopSearch onChange={() => undefined} value="" />
          </GlassPanel>
        </div>
      </section>

      <section className="preview-section">
        <h2>Cards and Empty State</h2>
        <div className="bookmark-grid">
          <BookmarkCard bookmark={sampleBookmarks[0]!} />
          <BookmarkCard bookmark={sampleBookmarks[1]!} />
          <BookmarkCard bookmark={sampleBookmarks[2]!} />
        </div>
        <EmptyState
          title="Command Center Empty"
          description="Initialize your library by importing browser bookmarks or adding new nodes."
        />
      </section>
    </div>
  );
}
