import { calculatePriority, effectiveActivityStatus, findCurrentClass, findNextClass, getBogotaContext, greetingForBogota, type Activity, type WeeklyClass } from '@schooler/shared';

export function buildDashboard(data: { period: { id: string; year: number; semester: number } | null; subjects: unknown[]; classes: WeeklyClass[]; activities: Activity[] }, now = new Date()) {
  const context = getBogotaContext(now);
  const activities = data.activities.map((activity) => ({ ...activity, effective_status: effectiveActivityStatus(activity, now), priority_score: calculatePriority(activity, now) }));
  const open = activities.filter((item) => !['COMPLETED', 'CANCELLED'].includes(item.status));
  const todayActivities = activities.filter((item) => item.due_date === context.date);
  const tomorrowActivities = activities.filter((item) => item.due_date === context.tomorrow);
  const overdue = activities.filter((item) => item.effective_status === 'OVERDUE').sort((a,b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
  const upcoming = open.filter((item) => item.due_date >= context.date && item.due_date <= context.weekEnd).sort((a,b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
  const urgent = upcoming.filter((item) => (item.priority_score ?? 0) >= 65 || (item.percentage ?? 0) >= 15).slice(0, 5);
  const todayClasses = data.classes.filter((item) => item.weekday === context.weekday).sort((a,b) => a.start_time.localeCompare(b.start_time));
  const tomorrowWeekday = context.weekday === 7 ? 1 : context.weekday + 1;
  const tomorrowClasses = data.classes.filter((item) => item.weekday === tomorrowWeekday).sort((a,b) => a.start_time.localeCompare(b.start_time));
  const weekActivities = activities.filter((item) => item.due_date >= context.weekStart && item.due_date <= context.weekEnd);
  return {
    generated_at: now.toISOString(), context, greeting: greetingForBogota(now), period: data.period,
    headline: { classes_today: todayClasses.length, pending: open.length, upcoming_exams: upcoming.filter((item) => item.type === 'EXAM').length },
    urgent, overdue,
    today: { activities: todayActivities, classes: todayClasses },
    tomorrow: { activities: tomorrowActivities, classes: tomorrowClasses, emphasized: context.afterFive },
    current_class: findCurrentClass(data.classes, now), next_class: findNextClass(data.classes, now),
    week: { classes: data.classes.length, tasks: weekActivities.filter((item) => item.type === 'TASK').length, quizzes: weekActivities.filter((item) => item.type === 'QUIZ').length, exams: weekActivities.filter((item) => item.type === 'EXAM').length, projects: weekActivities.filter((item) => item.type === 'PROJECT').length, study: weekActivities.filter((item) => item.type === 'STUDY').length },
    academic: { subjects: data.subjects.length, completed: activities.filter((item) => item.status === 'COMPLETED').length, pending: open.length },
  };
}
