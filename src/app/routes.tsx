import { HomePage } from "./components/HomePage"

import { createBrowserRouter,Outlet } from "react-router";
import { ProductPage } from "./components/ProductPage";
import { PurchasingPage } from "./components/PurchasingPage";
import { DistributionPage } from "./components/DistributionPage";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { ModulesSection } from "./components/ModulesSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { EnterpriseSection } from "./components/EnterpriseSection";
import { IndustrySection } from "./components/IndustrySection";
import { TestimonialSection } from "./components/TestimonialSection";
import { StatsSection } from "./components/StatsSection";
import { CTASection } from "./components/CTASection";
import { AboutPage } from "./components/AboutPage";
import { BlogPage } from "./components/BlogPage";
import { BlogSinglePage } from "./components/BlogSinglePage";
 import { ContactPage } from "./components/ContactPage";
import { PartnerPage } from "./components/PartnerPage";
import { ResellersPage } from "./components/partners/ResellersPage";
import { ConsultantsPage } from "./components/partners/ConsultantsPage";
import { TechnologyPartnersPage } from "./components/partners/TechnologyPartnersPage";
import { PartnerPortalPage } from "./components/partners/PartnerPortalPage";
import { MarketplacePage } from "./components/partners/MarketplacePage";
import { FindAPartnerPage } from "./components/partners/FindAPartnerPage";
import { PartnerAwardsPage } from "./components/partners/PartnerAwardsPage";
import { PartnerEventsPage } from "./components/partners/PartnerEventsPage";
import { PartnerEventRegisterPage } from "./components/partners/PartnerEventRegisterPage";
import { PartnerEventEnrollPage } from "./components/partners/PartnerEventEnrollPage";
import { CaseStudiesPage } from "./components/CaseStudiesPage";
import { WhyBizakPage } from "./components/WhyBizakPage";
import { WorkflowPage } from "./components/WorkflowPage";
import { FinancialManagementPage } from "./components/FinancialManagement";
import { SalesAndCrmPage } from "./components/SalesCrm";
import { InventoryAndWarehousePage } from "./components/InventoryAndWarehouse";
import { ManufacturingPage } from "./components/ManufacturingPage";
import { ManufacturingProductPage } from "./components/ManufacturingProductPage";
import { SalesForceManagementPage } from "./components/SalesForceManagement";
import { ProjectAndJobCostingPage } from "./components/ProjectAndJobCosting";
import { RetailAndEcommercePage } from "./components/RetailAndEcommercePage";
import { ProfessionalServicePage } from "./components/ProfessionalServicePage";
import { DashboardAndReportingPage } from "./components/DashboardAndReportingPage";
import { Integrations } from "./components/Integrations";
import { MulticompanyAndBranchesPage } from "./components/MulticompanyAndBranchesPage";
import { DocumentManagementPage } from "./components/DocumentManagementPage";
import { CareersPage } from "./components/CarrersPage";
import { PointOfSalesPage } from "./components/PointOfSales";
import { StartupsAndSmes } from "./components/StartupsAndSmes";
import { MidMarket } from "./components/MidMarket";
import { Enterprise } from "./components/Enterprise";
import { HelpCenter } from "./components/HelpCenter";
import { OurMissionPage } from "./components/OurMissionPage";
import { LeadershipTeamPage } from "./components/LeadershipTeamPage";
import { SystemStatusPage } from "./components/SystemStatusPage";
import { DocumentationPage } from "./components/DocumentationPage";
import { PressAndMediaPage } from "./components/PressAndMediaPage";
import { GuidesAndPlaybooksPage } from "./components/GuidesAndPlaybooksPage";
import { ResourceDetailPage } from "./components/ResourceDetailPage";
import { TrainingAndCertificate } from "./components/TrainingAndCertificate";
import { EnrollmentPage } from "./components/EnrollmentPage";
import { CommunityForum } from "./components/CommunityForum";
import { WebinarsAndEvents } from "./components/WebinarsAndEvents";
import { SaveSeatPage } from "./components/SaveSeatPage";

// ─── Root passthrough (lets each page own its full layout) ────────────────────
function RootLayout() {
  return <Outlet />;
}

// ─── Global error fallback ────────────────────────────────────────────────────
function ErrorBoundaryPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        background: "#F8F9F7",
        gap: 16,
        padding: 40,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "#7A826D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        B
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", margin: 0 }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 15, color: "#666", margin: 0 }}>
        Please refresh the page and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 8,
          padding: "10px 24px",
          background: "#7A826D",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Reload
      </button>
    </div>
  );
}





function ProductPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <ProductPage />
      </div>
      <Footer />
    </div>
  );
}






function PurchasingPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <PurchasingPage />
      <Footer
        cta={{
          title: "Take full control of your procurement operations.",
          titleMuted: "From RFQ to receipt, all on one ledger.",
          description:
            "Centralise vendors, auto-route approvals, and 3-way match every PO straight to the ledger — zero re-keying, full audit trail.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to procurement team",
        }}
      />
    </div>
  );
}




function AboutUsPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <AboutPage />
      </div>
      <Footer />
    </div>
  );
}




function BlogPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <BlogPage />
      </div>
      <Footer />
    </div>
  );
}

/*
function BlogSinglePageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <BlogSinglePage />
      </div>
      <Footer />
    </div>
  );
}

*/



function CaseStudiesPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <CaseStudiesPage />
      </div>
      <Footer />
    </div>
  );
}

function WhyBizakPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <WhyBizakPage />
      </div>
      <Footer />
    </div>
  );
}

function FinancialManagementPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <FinancialManagementPage />
      <Footer
        cta={{
          title: "Take full control of your financial operations.",
          titleMuted: "Close month-end in hours, not weeks.",
          description:
            "One ledger, auto-posted journals, real-time P&L — and a full audit trail behind every figure.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to finance team",
        }}
      />
    </div>
  );
}

function SalesAndCrmPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <SalesAndCrmPage />
      <Footer
        cta={{
          title: "Take full control of your sales pipeline.",
          titleMuted: "From first lead to final payment.",
          description:
            "Centralise leads, auto-route approvals, and post every sale straight to the ledger — one connected pipeline, zero re-keying.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to sales",
        }}
      />
    </div>
  );
}




function InventoryAndWarehousePageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <InventoryAndWarehousePage />
      <Footer
        isLightMode
        cta={{
          title: "Take full control of your",
          titleMuted: "inventory and warehouse.",
          description: "Track every SKU in real time, automate replenishment.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to operations team",
        }}
      />
    </div>
  );
}

function ManufacturingProductPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <ManufacturingProductPage />
      <Footer
        cta={{
          title: "Run your factory floor with complete precision.",
          titleMuted: "From raw material to finished good, on time, every run.",
          description:
            "Plan production, manage BOMs, schedule work orders and post manufacturing cost straight to the ledger — one connected operating system, zero re-keying.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to ops team",
        }}
      />
    </div>
  );
}





function SalesForceManagementPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <SalesForceManagementPage />
      <Footer />
    </div>
  );
}

function ProjectAndCostingPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <ProjectAndJobCostingPage />
      <Footer
        cta={{
          title: "Take full control of every project's margin.",
          titleMuted: "From estimate to final billing, on one ledger.",
          description:
            "Capture every PO, timesheet and material draw on a project code the moment it's committed — and watch margin update the same day.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to projects team",
        }}
      />
    </div>
  );
}


function WorkFlowAutomationPageLayout() {
  return <WorkflowPage />;
}



function DashboardAndReportingPageLayout() {
  return <DashboardAndReportingPage />;
}


function MulticompanyAndBranchesPageLayout() {
  return <MulticompanyAndBranchesPage />;
}



function CareersPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <CareersPage />
      <Footer />
    </div>
  );
}


function PointOfSalesPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <PointOfSalesPage />
      <Footer />
    </div>
  );
}


function HomeLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <HomePage />
      <Footer />
    </div>
  );
}



 

// function HomeLayout() {
//   return (
//     <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen">
//       <Header />
//       <main>
//         <HeroSection />
//         <ModulesSection /> 
//         <HowItWorksSection />   
//         <EnterpriseSection />
//         <IndustrySection />
//         <TestimonialSection />
//         <StatsSection />
//         <CTASection />
//       </main>
//       <Footer />
//     </div>
//   );
// }











/*

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeLayout,
  },
  {
    path: "/product",
    Component: ProductPageLayout,
  },
  {
    path: "/purchasing",
    Component: PurchasingPageLayout,
  },


 {
    path: "/distribution",
    Component: DistributionPage,
  },



 {
    path: "/about",
    Component: AboutPage,
  },


      {
        path: "blog",
        Component: () => <Outlet />,
        children: [
          { index: true,                       Component: BlogPage       },
          { path: "why-replace-spreadsheets",  Component: BlogSinglePage },
        ],
      },







]);

*/













// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorBoundaryPage />,
    children: [
      { index: true,           Component: HomeLayout          },
      { path: "product",       Component: ProductPageLayout   },
      { path: "purchasing",    Component: PurchasingPageLayout },
      { path: "distribution",  Component: DistributionPage    },
      { path: "about",         Component: AboutPage           },
      { path: "contact",      Component: ContactPage          },
      { path: "partners",                Component: PartnerPage              },
      { path: "partners/resellers",      Component: ResellersPage            },
      { path: "partners/consultants",    Component: ConsultantsPage          },
      { path: "partners/technology",     Component: TechnologyPartnersPage   },
      { path: "partners/portal",         Component: PartnerPortalPage        },
      { path: "partners/marketplace",    Component: MarketplacePage          },
      { path: "partners/find",           Component: FindAPartnerPage         },
      { path: "partners/awards",         Component: PartnerAwardsPage        },
      { path: "partners/events",                          Component: PartnerEventsPage          },
      { path: "partners/events/register/:slug",           Component: PartnerEventRegisterPage   },
      { path: "partners/events/enroll/:slug",             Component: PartnerEventEnrollPage     },
      { path: "case-studies",   Component: CaseStudiesPage      },
            { path: "why-bizak",     Component: WhyBizakPage        },

      { path: "workflow",      Component: WorkflowPage        },
      { path: "FinancialManagement", Component: FinancialManagementPageLayout },
      { path: "SalesCrm", Component: SalesAndCrmPageLayout },
      { path: "InventoryAndWarehouse", Component: InventoryAndWarehousePageLayout },
      { path: "SalesForceManagement", Component: SalesForceManagementPageLayout },
      { path: "ProjectAndCosting", Component: ProjectAndCostingPageLayout },
      { path: "manufacturing",    Component: ManufacturingPage           },
      { path: "manufacturingProduct",    Component: ManufacturingProductPageLayout           },
      { path: "Retail", Component: RetailAndEcommercePage    },
      { path: "ProfessionalService", Component: ProfessionalServicePage    },
      { path: "DashboardAndReporting", Component: DashboardAndReportingPage    },
      { path: "Integrations", Component: Integrations    },
      { path: "MulticompanyAndBranches", Component: MulticompanyAndBranchesPage },
      { path: "DocumentManagement", Component: DocumentManagementPage },
      { path: "careers", Component: CareersPageLayout },
      { path: "PointOfSales", Component: PointOfSalesPageLayout },
      { path: "StartupsAndSmes", Component: StartupsAndSmes },
      { path: "MidMarket",       Component: MidMarket       },
      { path: "Enterprise",      Component: Enterprise       },
      { path: "support",         Component: HelpCenter       },
      { path: "HelpCenter",      Component: HelpCenter       },
      { path: "OurMission",      Component: OurMissionPage   },
      { path: "LeadershipTeam",  Component: LeadershipTeamPage },
      { path: "leadership",      Component: LeadershipTeamPage },
      { path: "system-status",   Component: SystemStatusPage   },
      { path: "SystemStatus",    Component: SystemStatusPage   },
      { path: "documentation",   Component: DocumentationPage  },
      { path: "Documentation",   Component: DocumentationPage  },
    
      { path: "PressAndMedia",   Component: PressAndMediaPage  },
      { path: "GuidesAndPlaybooks", Component: GuidesAndPlaybooksPage },
      { path: "GuidesAndPlaybooks/:slug", Component: ResourceDetailPage },
      { path: "TrainingAndCertification", Component: TrainingAndCertificate },
      { path: "TrainingAndCertification/enrol/:slug", Component: EnrollmentPage },
      { path: "CommunityForum", Component: CommunityForum },
      { path: "WebinarsAndEvents", Component: WebinarsAndEvents },
      { path: "WebinarsAndEvents/save-seat/:eventId", Component: SaveSeatPage },
      {
        path: "blog",
        Component: () => <Outlet />,
        children: [
          { index: true,                       Component: BlogPage       },
          { path: "why-replace-spreadsheets",  Component: BlogSinglePage },
        ],
      },




    ],
  },
]);