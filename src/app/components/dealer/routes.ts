import { DealerHomePage } from "./HomePage";
import { DealerOrderPage } from "./OrderPage";
import { DealerOrdersPage } from "./OrdersPage";
import { DealerAccountPage } from "./AccountPage";
import { DealerClaimsPage } from "./ClaimsPage";
import { DealerBusinessPage } from "./BusinessPage";
import { DealerOffersPage } from "./OffersPage";
import { DealerNewRequestPage, DealerRequestsPage } from "./RequestsPage";

// The dealer portal — register these in routes.tsx. Paths carry no leading slash. Every page signs in first
// (DealerShell shows the sign-in screen when nobody is signed in).
export const DEALER_ROUTES = [
  { path: "design/dealer", Component: DealerHomePage },
  { path: "design/dealer/order", Component: DealerOrderPage },
  { path: "design/dealer/orders", Component: DealerOrdersPage },
  { path: "design/dealer/orders/:id", Component: DealerOrdersPage },
  { path: "design/dealer/account", Component: DealerAccountPage },
  { path: "design/dealer/claims", Component: DealerClaimsPage },
  { path: "design/dealer/business", Component: DealerBusinessPage },
  { path: "design/dealer/offers", Component: DealerOffersPage },
  { path: "design/dealer/requests", Component: DealerRequestsPage },
  { path: "design/dealer/requests/new", Component: DealerNewRequestPage },
  { path: "design/dealer/requests/:id", Component: DealerRequestsPage },
  // Where "Quotations" lived before price requests (decision #27): saved links, and their ?id=, still open.
  { path: "design/dealer/quotes", Component: DealerRequestsPage },
];
