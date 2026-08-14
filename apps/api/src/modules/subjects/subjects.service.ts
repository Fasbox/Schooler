import { subjectColors } from '@schooler/shared';

export function pickSubjectColor(usedColors: string[]) {
  const available = subjectColors.filter((color) => !usedColors.includes(color));
  const palette = available.length > 0 ? available : subjectColors;
  return palette[Math.floor(Math.random() * palette.length)] ?? subjectColors[0];
}
