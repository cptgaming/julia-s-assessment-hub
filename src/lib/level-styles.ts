import type { Level } from "./assessment-types";

export const levelClasses = (level: Level) => {
  switch (level) {
    case "critico":
      return {
        text: "text-[var(--level-critico)]",
        bg: "bg-[var(--level-critico-soft)]",
        border: "border-[var(--level-critico)]",
        dot: "bg-[var(--level-critico)]",
      };
    case "atencao":
      return {
        text: "text-[var(--level-atencao)]",
        bg: "bg-[var(--level-atencao-soft)]",
        border: "border-[var(--level-atencao)]",
        dot: "bg-[var(--level-atencao)]",
      };
    case "estavel":
      return {
        text: "text-[var(--level-estavel)]",
        bg: "bg-[var(--level-estavel-soft)]",
        border: "border-[var(--level-estavel)]",
        dot: "bg-[var(--level-estavel)]",
      };
    case "ideal":
      return {
        text: "text-[var(--level-ideal)]",
        bg: "bg-[var(--level-ideal-soft)]",
        border: "border-[var(--level-ideal)]",
        dot: "bg-[var(--level-ideal)]",
      };
  }
};
