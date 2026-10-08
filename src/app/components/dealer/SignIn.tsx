import * as React from "react";
import { Link } from "react-router";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "../ui/utils";
import { useStore } from "../sales/store";
import { customersStore, portalSettingsStore, typesStore } from "../salesforce/store";
import { TypeMark } from "../salesforce/ui";
import { LIME, SearchBox } from "./kit";
import { CUSTOMERS_SETUP_PATH, brandParts, notify, qualifies, signIn } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// SIGN IN — who is using the portal
//
// The prototype has no passwords: the tester picks a customer whose type opens
// the dealer portal, then one of the users the company invited. With none
// set up yet, the screen says in two lines how to get there.
// ════════════════════════════════════════════════════════════════════════════

export function DealerSignIn() {
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const settings = useStore(portalSettingsStore);
  const dealers = customers.filter((c) => qualifies(c, types)).sort((a, b) => a.name.localeCompare(b.name));
  const [customerId, setCustomerId] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const picked = dealers.find((c) => c.id === customerId) ?? null;
  const needle = q.trim().toLowerCase();
  const shown = dealers.filter((c) => !needle || `${c.name} ${c.code} ${c.city}`.toLowerCase().includes(needle));
  const b = brandParts(settings.brand);

  const pick = (id: string) => {
    setCustomerId(id);
    const c = dealers.find((x) => x.id === id);
    setUserName(c && c.portalUsers.length === 1 ? c.portalUsers[0].name : null);
  };
  const go = () => {
    if (!picked || !userName) return;
    signIn(picked.id, userName);
    notify(`Signed in as ${userName}`, "info");
  };

  return (
    <div className="mx-auto max-w-[520px]">
      <h1 className="m-0 text-[17px] font-semibold tracking-tight text-bz-text">Sign in to {b.name === "Dealer portal" ? "the dealer portal" : b.name}</h1>
      <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-bz-text-muted">{settings.welcome}</p>

      {dealers.length === 0 ? (
        <div className="mt-8 rounded-bz-lg border border-dashed border-bz-line px-6 py-8">
          <p className="m-0 text-[12.5px] text-bz-text">No dealer can sign in yet.</p>
          <p className="m-0 mt-1 text-[12px] leading-relaxed text-bz-text-muted">In Sales force, give a customer a type with the dealer portal, then use “Invite user” on the customer.</p>
          <Link to={CUSTOMERS_SETUP_PATH} className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-bz-text underline underline-offset-2 hover:opacity-75">
            Open Customers <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <>
          <p className="m-0 mb-2 mt-8 text-[11.5px] font-semibold text-bz-text">Your business</p>
          {dealers.length > 6 && (
            <div className="mb-2">
              <SearchBox value={q} onChange={setQ} placeholder="Search by name, code or city" />
            </div>
          )}
          <ul className="m-0 flex max-h-[360px] list-none flex-col divide-y divide-bz-line-soft overflow-y-auto border-y border-bz-line-soft p-0 [scrollbar-width:thin]" role="radiogroup" aria-label="Your business">
            {shown.map((c) => {
              const on = c.id === customerId;
              const t = types.find((x) => x.id === c.typeId);
              return (
                <li key={c.id}>
                  <button type="button" role="radio" aria-checked={on} onClick={() => pick(c.id)} className={cn("flex min-h-[56px] w-full items-center gap-3 px-2 py-2.5 text-left transition-colors", on ? "bg-bz-fire/10" : "hover:bg-bz-paper-warm/60")}>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[12.5px] text-bz-text", on ? "font-semibold" : "font-medium")}>{c.name}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] text-bz-text-soft">
                        {t && <TypeMark name={t.name} color={t.color} />}
                        {c.city && <span className="truncate">{c.city}</span>}
                      </span>
                    </span>
                    {on && <Check size={15} className="shrink-0 text-bz-text" />}
                  </button>
                </li>
              );
            })}
            {shown.length === 0 && <li className="px-2 py-4 text-[12px] text-bz-text-muted">Nothing matches “{q}”.</li>}
          </ul>

          {picked && (
            <>
              <p className="m-0 mb-2 mt-6 text-[11.5px] font-semibold text-bz-text">You are</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="You are">
                {picked.portalUsers.map((u) => {
                  const on = u.name === userName;
                  return (
                    <button key={u.name} type="button" role="radio" aria-checked={on} onClick={() => setUserName(u.name)} className={cn("flex h-11 items-center gap-2 rounded-bz-md border px-3.5 text-left text-[12.5px] transition-colors", on ? "border-bz-text bg-bz-fire/10 font-semibold text-bz-text" : "border-bz-line text-bz-text-muted hover:bg-bz-paper-warm")}>
                      {u.name}
                      <span className="text-[11px] font-normal text-bz-text-soft">{u.role}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="button" disabled={!picked || !userName} onClick={go} className={LIME}>
              Sign in
            </button>
            <span className="text-[11px] text-bz-text-soft">No passwords in this prototype — pick who you are.</span>
          </div>
        </>
      )}
    </div>
  );
}
