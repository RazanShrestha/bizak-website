import { RepTodayPage } from "./TodayPage";
import { RepVisitPage } from "./VisitPage";

// The rep app — a phone-first surface for reps in the field. Register these in routes.tsx. Paths carry no leading slash.
export const REP_ROUTES = [
  { path: "design/rep", Component: RepTodayPage },
  { path: "design/rep/visit/:id", Component: RepVisitPage },
];
