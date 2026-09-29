import { DealerHomePage } from "./HomePage";
import { DealerOrderPage } from "./OrderPage";
import { DealerOrdersPage } from "./OrdersPage";
import { DealerAccountPage } from "./AccountPage";
import { DealerClaimsPage } from "./ClaimsPage";
import { DealerBusinessPage } from "./BusinessPage";
import { DealerOffersPage } from "./OffersPage";
import { DealerQuotesPage } from "./QuotesPage";

// The Dealer Sales Portal (DSP-PLAN.md) — register these in routes.tsx. Paths carry no leading slash.
export const DEALER_ROUTES = [
  { path: "design/dealer", Component: DealerHomePage },
  { path: "design/dealer/order", Component: DealerOrderPage },
  { path: "design/dealer/orders", Component: DealerOrdersPage },
  { path: "design/dealer/orders/:id", Component: DealerOrdersPage },
  { path: "design/dealer/account", Component: DealerAccountPage },
  { path: "design/dealer/claims", Component: DealerClaimsPage },
  { path: "design/dealer/business", Component: DealerBusinessPage },
  { path: "design/dealer/offers", Component: DealerOffersPage },
  { path: "design/dealer/quotes", Component: DealerQuotesPage },
];
