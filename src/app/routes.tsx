import { HomePage } from "./components/HomePage"

import { createBrowserRouter,Outlet, useParams } from "react-router";
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
import { CaseStudyPage } from "./components/CaseStudyPage";
import { getCaseStudy } from "./components/caseStudyData";
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

function DistributionPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <DistributionPage />
      <Footer
        isLightMode
        cta={{
          title: "Ship more,",
          titleMuted: "faster with zero inventory surprises.",
          description:
            "Centralise purchasing, warehouses, and fulfillment on one ledger.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to sales",
        }}
      />
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
          // titleMuted: "",
          description:
            "Centralise vendors, auto-route approvals, and 3-way match every PO.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
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
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <CaseStudiesPage />
      <Footer
        cta={{
          title: "Ready to transform your operations?",
          description:
            "Begin your case-study backed journey with Bizak today. Join the world's most efficient enterprises and scale with confidence.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
    </div>
  );
}

function CaseStudyPageLayout() {
  const { slug } = useParams();
  const study = slug ? getCaseStudy(slug) : undefined;
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <CaseStudyPage study={study} />
      <Footer
        cta={{
          title: "Ready to write your own success story?",
          description:
            "Join the operators running finance, inventory and operations on one platform. See what Bizak can do for your team.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
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
            "One ledger, auto-posted journals, real-time P&L and a full audit trail behind every figure.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to sales",
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
            "Centralise leads, auto-route approvals, and post every sale straight to the ledger one connected pipeline, zero re-keying.",
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
          secondaryLabel: "Talk to sales",
        }}
      />
    </div>
  );
}

function ProfessionalServicePageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <ProfessionalServicePage />
      <Footer
        cta={{
          title: "Every billable minute,",
          titleMuted: "every engagement on the books.",
          description:
            "Unify time, talent and clients on Bizak and turn every hour worked into invoiced.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to sales",
        }}
      />
    </div>
  );
}

function ManufacturingPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <ManufacturingPage />
      <Footer
        cta={{
          title: "Built for the factory floor.",
          titleMuted: "From raw material to finished good.",
          description: "Plan production, track BOMs, and post costs to the ledger all in one place.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to sales",
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
          title: "Built for the factory floor.",
          titleMuted: "From raw material to finished good.",
          description: "Plan production, track BOMs, and post costs to the ledger all in one place.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to sales",
        }}
      />
    </div>
  );
}

function RetailAndEcommercePageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <RetailAndEcommercePage />
      <Footer
        cta={{
          title: "Sell everywhere, fulfil flawlessly.",
          titleMuted: "Every margin, always known.",
          description: "One platform for every channel, warehouse, and book.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
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
          title: "Take full control of",
          titleMuted: "every project's margin.",
          description: "Capture every PO, timesheet and material draw on a project code.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Talk to sales",
        }}
      />
    </div>
  );
}


function WorkFlowAutomationPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <WorkflowPage />
      <Footer
        cta={{
          title: "Automate every approval.",
          titleMuted: "Routed, escalated, and logged automatically.",
          description:
            "Bizak routes every request, escalates stalled approvals, and logs every decision.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Book a demo",
        }}
      />
    </div>
  );
}



function IntegrationsPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <Integrations />
      <Footer
        cta={{
          title: "Connect every system in your stack.",
          description:
            "200+ pre-built connectors, bidirectional sync, and audit-grade lineage all inside your ERP, not bolted on.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Book a demo",
        }}
      />
    </div>
  );
}

function DashboardAndReportingPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <DashboardAndReportingPage />
      <Footer
        cta={{
          title: "See every number in your business, live.",
          titleMuted: "40+ reports. Role-based dashboards. Auto-delivered.",
          description:
            "One platform, every metric live KPIs, drillable reports, and scheduled delivery to every stakeholder.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
    </div>
  );
}


function DocumentManagementPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <DocumentManagementPage />
      <Footer
        cta={{
          title: "Never lose a document again.",
          titleMuted: "Every file, every record, one system.",
          description:
            "Store, tag, and attach every document to the records it belongs to and find any file in seconds from anywhere in Bizak.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Book a demo",
        }}
      />
    </div>
  );
}

function MulticompanyAndBranchesPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <MulticompanyAndBranchesPage />
      <Footer
        cta={{
          title: "Run the whole group on one ERP.",
          titleMuted: "From new entity to live consolidation.",
          description:
            "Stop stitching subsidiaries in spreadsheets. Every entity gets its own books.",
          primaryLabel: "Start free trial",
          secondaryLabel: "Book a demo",
        }}
      />
    </div>
  );
}



function CareersPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <CareersPage />
      <Footer
        cta={{
          title: "Come build the operating system for modern business.",
          titleMuted: "We're growing fast so is the opportunity.",
          description:
            "50,000+ companies. 120+ countries. One team making enterprise software feel effortless. Your next chapter starts here.",
          primaryLabel: "View open roles",
          secondaryLabel: "Send a speculative application",
        }}
      />
    </div>
  );
}


function GuidesAndPlaybooksPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <GuidesAndPlaybooksPage />
      <Footer
        cta={{
          title: "Put the playbooks to work.",
          titleMuted: "Plan your Bizak rollout.",
          description:
            "Bring your timeline and the modules in scope. We'll match the right playbook and stay on call until you're live.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
    </div>
  );
}

function ResourceDetailPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header dark />
      <ResourceDetailPage />
      <Footer
        cta={{
          title: "Turn the playbook into a plan.",
          titleMuted: "Roll out Bizak with an expert.",
          description:
            "Bring your timeline and the modules in scope. We'll map the playbook to your team and stay on call until you're live.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
    </div>
  );
}


function ResellersPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <ResellersPage />
      <Footer
        cta={{
          title: "Own your territory.",
          titleMuted: "Compound your book.",
          description:
            "Join the Bizak reseller network. Protected territories, up to 35% margin, and recurring commission on every renewal.",
          primaryLabel: "Talk to Sales",
          primaryHref: "/contact",
          secondaryLabel: "Request Demo",
          secondaryHref: "/contact",
        }}
      />
    </div>
  );
}


function ConsultantsPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <ConsultantsPage />
      <Footer
        cta={{
          title: "Deliver Bizak.",
          titleMuted: "Build your practice.",
          description:
            "Join the Bizak consultant network. Architect Academy certification, routed pipeline, and the tooling to ship faster implementations.",
          primaryLabel: "Talk to Sales",
          primaryHref: "/contact",
          secondaryLabel: "Request Demo",
          secondaryHref: "/contact",
        }}
      />
    </div>
  );
}


function TechnologyPartnersPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <TechnologyPartnersPage />
      <Footer
        cta={{
          title: "Build on Bizak.",
          titleMuted: "Ship to every customer.",
          description:
            "Join the Bizak technology partner network.",
          primaryLabel: "Become a Partner",
          primaryHref: "/contact",
          secondaryLabel: "Task to Sales",
          secondaryHref: "/contact",
        }}
      />
    </div>
  );
}


function PartnerPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header dark />
      <PartnerPage />
      <Footer hideCta />
    </div>
  );
}


function PartnerPortalPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <PartnerPortalPage />
      <Footer
        cta={{
          title: "One login away",
          titleMuted: "from a sharper partner practice.",
          description:
            "Apply to the Bizak partner network and your Portal account is provisioned.",
          primaryLabel: "Sign in to Portal",
          primaryHref: "/contact",
          secondaryLabel: "Become a Partner",
          secondaryHref: "/partners",
        }}
      />
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

function StartupsAndSmesPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <StartupsAndSmes />
      <Footer
        cta={{
          title: "Still running your business on spreadsheets?",
          description:
            "One platform for finance, sales, and inventory. Go live in three days not three months.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
    </div>
  );
}


function MidMarketPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <MidMarket />
      <Footer
        cta={{
          title: "Still consolidating every entity by hand?",
          description:
            "One platform for every branch, currency, and approval.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
    </div>
  );
}


function EnterprisePageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <Enterprise />
      <Footer
        cta={{
          title: "Still running the group on a decade-old ERP?",
          description:
            "One platform for finance, operations, and consolidation across every entity.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
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
      { path: "purchasing",    Component: PurchasingPageLayout },
      { path: "distribution",  Component: DistributionPageLayout },
      { path: "about",         Component: AboutPage           },
      { path: "contact",      Component: ContactPage          },
      { path: "partners",                Component: PartnerPageLayout        },
      { path: "partners/resellers",      Component: ResellersPageLayout      },
      { path: "partners/consultants",    Component: ConsultantsPageLayout    },
      { path: "partners/technology",     Component: TechnologyPartnersPageLayout },
      { path: "partners/portal",         Component: PartnerPortalPageLayout  },
      { path: "partners/marketplace",    Component: MarketplacePage          },
      { path: "partners/find",           Component: FindAPartnerPage         },
      { path: "partners/awards",         Component: PartnerAwardsPage        },
      { path: "partners/events",                          Component: PartnerEventsPage          },
      { path: "partners/events/register/:slug",           Component: PartnerEventRegisterPage   },
      { path: "partners/events/enroll/:slug",             Component: PartnerEventEnrollPage     },
      { path: "case-studies",   Component: CaseStudiesPageLayout },
      { path: "case-studies/:slug", Component: CaseStudyPageLayout },
      { path: "workflow",      Component: WorkFlowAutomationPageLayout },
      { path: "FinancialManagement", Component: FinancialManagementPageLayout },
      { path: "SalesCrm", Component: SalesAndCrmPageLayout },
      { path: "InventoryAndWarehouse", Component: InventoryAndWarehousePageLayout },
      { path: "SalesForceManagement", Component: SalesForceManagementPageLayout },
      { path: "ProjectAndCosting", Component: ProjectAndCostingPageLayout },
      { path: "manufacturing",    Component: ManufacturingPageLayout     },
      { path: "manufacturingProduct",    Component: ManufacturingProductPageLayout           },
      { path: "Retail", Component: RetailAndEcommercePageLayout },
      { path: "ProfessionalService", Component: ProfessionalServicePageLayout },
      { path: "DashboardAndReporting", Component: DashboardAndReportingPageLayout },
      { path: "Integrations", Component: IntegrationsPageLayout },
      { path: "MulticompanyAndBranches", Component: MulticompanyAndBranchesPageLayout },
      { path: "DocumentManagement", Component: DocumentManagementPageLayout },
      { path: "careers", Component: CareersPageLayout },
      { path: "PointOfSales", Component: PointOfSalesPageLayout },
      { path: "StartupsAndSmes", Component: StartupsAndSmesPageLayout },
      { path: "MidMarket",       Component: MidMarketPageLayout },
      { path: "Enterprise",      Component: EnterprisePageLayout },
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
      { path: "GuidesAndPlaybooks", Component: GuidesAndPlaybooksPageLayout },
      { path: "GuidesAndPlaybooks/:slug", Component: ResourceDetailPageLayout },
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