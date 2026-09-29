import * as React from "react";
import { cn } from "../ui/utils";
import { createStore, useStore } from "../sales/store";
import { ActivityList } from "../sales/record";
import { NoteFoot } from "../sales/parts";
import type { Comment } from "../sales/orders";
import { SF_NOW } from "./data";

// ════════════════════════════════════════════════════════════════════════════
// HISTORY + NOTES for the network and setup records (customers, territories,
// customer types, playbooks, modules, portal settings)
//
// Every record surface carries History and Notes (owner rule, 2026-09-27). The
// timeline and note line are the sales desk's own (`ActivityList`, `NoteFoot`);
// only the rows live here, keyed by subject: `customer:C-5001`,
// `territory:T-KTW`, `type:T-DIST`, `playbook:PB-RET`, `setup:modules`,
// `setup:portal`. "who" must be a PEOPLE id — ActivityList names people by it.
// ════════════════════════════════════════════════════════════════════════════

export const ME_ID = "EMP-101";
const STAMP = `Sep 4, ${SF_NOW}`;

type NetNote = Comment & { subject: string };
type NetChange = { id: string; subject: string; whoId: string; when: string; what: string };

export const netNotesStore = createStore<NetNote[]>([
  { id: "nn1", subject: "customer:C-5002", authorId: "EMP-118", when: "Sep 2, 16:05", body: "Bikash promised 3 lakh by the 10th. Hold new portal orders in review until then." },
  { id: "nn2", subject: "customer:C-5001", authorId: "EMP-101", when: "Aug 30, 11:20", body: "Wants a second warehouse in Bhairahawa — sign board request is in Branding." },
  { id: "nn3", subject: "type:T-DEAL", authorId: "EMP-101", when: "Aug 21, 10:12", body: "Dealers stay on a hard credit stop until the Dashain collections are in." },
  { id: "nn4", subject: "territory:T-KTE", authorId: "EMP-118", when: "Sep 1, 09:40", body: "Chabahil side is thin — Sujan covers it alone since Farah moved to merchandising." },
]);

export const netChangesStore = createStore<NetChange[]>([
  { id: "nc1", subject: "customer:C-5051", whoId: "EMP-118", when: "Aug 28, 16:20", what: "put the customer on hold — 22,000 overdue past 60 days" },
  { id: "nc2", subject: "customer:C-5001", whoId: "EMP-101", when: "Jul 17, 10:00", what: "invited Kiran Thapa to the dealer portal as Buyer" },
  { id: "nc3", subject: "customer:C-5002", whoId: "EMP-118", when: "Aug 12, 14:30", what: "raised the credit limit from 15,00,000 to 20,00,000" },
  { id: "nc4", subject: "customer:C-5023", whoId: "EMP-101", when: "Sep 3, 12:10", what: "added the customer — waiting for PAN and the signed agreement" },
  { id: "nc5", subject: "type:T-DIST", whoId: "EMP-101", when: "Jul 17, 09:00", what: "set the price list to 12% off list" },
  { id: "nc6", subject: "type:T-DEAL", whoId: "EMP-101", when: "Aug 21, 10:10", what: "changed the credit stop from warn to block" },
  { id: "nc7", subject: "playbook:PB-RET", whoId: "EMP-101", when: "Sep 1, 08:30", what: "added Photo of the shelf — during campaign" },
  { id: "nc8", subject: "setup:modules", whoId: "EMP-101", when: "Jul 17, 09:05", what: "switched on Dealer portal" },
  { id: "nc9", subject: "setup:modules", whoId: "EMP-101", when: "Aug 2, 11:40", what: "switched off Van sales" },
  { id: "nc10", subject: "setup:portal", whoId: "EMP-101", when: "Jul 17, 09:10", what: "set the order cut-off to 15:00" },
  { id: "nc11", subject: "territory:T-KTE", whoId: "EMP-118", when: "Aug 30, 17:15", what: "moved Farah Shah to Kathmandu Core as merchandiser" },
]);

let seq = 1;
const uid = (p: string) => `${p}-${seq++}`;

export function logChange(subject: string, what: string) {
  netChangesStore.set((cs) => [...cs, { id: uid("chg"), subject, whoId: ME_ID, when: STAMP, what }]);
}

/** History and Notes of one subject, interleaved by time (the sales desk's timeline). */
export function RecordActivity({ subject, className }: { subject: string; className?: string }) {
  const notes = useStore(netNotesStore);
  const changes = useStore(netChangesStore);
  return (
    <div className={cn("-mx-5 mt-8 border-t border-bz-line-soft", className)}>
      <ActivityList
        comments={notes.filter((n) => n.subject === subject)}
        history={changes.filter((c) => c.subject === subject).map((c) => ({ id: c.id, whoId: c.whoId, when: c.when, what: c.what }))}
      />
    </div>
  );
}

/** The note line at the foot of a record panel (sits inside SidePanel's `foot`); `inline` for a settings page. */
export function RecordNoteFoot({ subject, inline }: { subject: string; inline?: boolean }) {
  return (
    <div className={inline ? "mt-3 overflow-hidden rounded-bz-md border border-bz-line-soft [&>div]:border-t-0" : "-mx-6 -my-3 [&>div]:border-t-0"}>
      <NoteFoot onSend={(n) => netNotesStore.set((ns) => [...ns, { ...n, id: uid("note"), subject, authorId: ME_ID, when: STAMP }])} />
    </div>
  );
}
