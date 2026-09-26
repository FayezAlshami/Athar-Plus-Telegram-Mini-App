import { GameController, Palette, PlayCircle, Sparkle, SquaresFour, type Icon } from "@phosphor-icons/react";

/** Maps backend icon keys to the single app icon family. Unknown keys fall back gracefully. */
const CATEGORY_ICONS: Record<string, Icon> = {
  palette: Palette,
  play: PlayCircle,
  game: GameController,
  sparkle: Sparkle,
};

export function CategoryIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = (name && CATEGORY_ICONS[name]) || SquaresFour;
  return <Icon className={className} weight="duotone" />;
}
