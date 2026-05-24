import { BookmarkCard, FeatureCard } from "./BookmarkCard";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { GlassPanel } from "./GlassPanel";
import { Sidebar } from "./Sidebar";
import { Tag } from "./Tag";
import { TopSearch } from "./TopSearch";
import { sampleBookmarks, sampleFolders } from "../data/sampleBookmarks";

const colorTokens = [
  ["background", "#f9f9fb"],
  ["surface-container-low", "#f3f3f5"],
  ["surface-container", "#eeeef0"],
  ["surface-container-highest", "#e2e2e4"],
  ["on-surface", "#1a1c1d"],
  ["secondary", "#0058bc"],
  ["error", "#ba1a1a"],
  ["outline-variant", "#c4c7c7"]
];

export function DesignSystemPreview() {
  return (
    <div className="preview-page">
      <header className="preview-hero">
        <Tag tone="blue">Dev preview</Tag>
        <h1>Digital Air Design System</h1>
        <p>Reusable tokens and components extracted from the browser homepage mockup.</p>
      </header>

      <section className="preview-section">
        <h2>Color Tokens</h2>
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
          <p className="type-display">Digital Air</p>
          <p className="type-headline-lg">Bookmark workspace</p>
          <p className="type-body-lg">A calm frosted-glass interface for scanning, searching, and organizing saved URLs.</p>
          <p className="type-label-sm">LABEL SMALL / FOLDER PATH</p>
        </GlassPanel>
        <GlassPanel>
          <h2>Buttons and Tags</h2>
          <div className="preview-inline">
            <Button icon="sparkles" variant="primary">AI Organize</Button>
            <Button icon="sliders" variant="glass">Tune</Button>
            <Button icon="plus" variant="icon" />
          </div>
          <div className="preview-inline">
            <Tag tone="blue">Dev</Tag>
            <Tag tone="red">Inspo</Tag>
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
          <FeatureCard bookmark={sampleBookmarks[3]!} />
        </div>
        <EmptyState
          title="Expand your library"
          description="Click the plus icon to add a new bookmark or drag links directly into this space."
        />
      </section>
    </div>
  );
}
