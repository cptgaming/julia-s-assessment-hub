import { LEVELS, type Level } from "@/lib/assessment-types";
import { levelClasses } from "@/lib/level-styles";
import { cn } from "@/lib/utils";

type Props = {
  value: Level;
  onChange: (v: Level) => void;
};

export function LevelPicker({ value, onChange }: Props) {
  return (
    <div className="inline-flex flex-wrap gap-1.5">
      {LEVELS.map((l) => {
        const cls = levelClasses(l.value);
        const active = value === l.value;
        return (
          <button
            key={l.value}
            type="button"
            onClick={() => onChange(l.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              active
                ? `${cls.bg} ${cls.text} ${cls.border}`
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <span className={cn("mr-1.5 inline-block h-2 w-2 rounded-full align-middle", cls.dot)} />
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
