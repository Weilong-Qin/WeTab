import { DesignSystemPreview } from "../components/DesignSystemPreview";
import { useThemePreference } from "../hooks/useThemePreference";

export function DesignSystemPage() {
  useThemePreference();
  return <DesignSystemPreview />;
}
