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
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <PurchasingPage />
      </div>
      <Footer />
    </div>
  );
}


function DistributionPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <DistributionPage />
      </div>
      <Footer />
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



function PartnerPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <PartnerPage />
      </div>
      <Footer />
    </div>
  );
}


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
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <FinancialManagementPage />
      </div>
      <Footer />
    </div>
  );
}

function SalesAndCrmPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <SalesAndCrmPage />
      </div>
      <Footer />
    </div>
  );
}




function InventoryAndWarehousePageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <InventoryAndWarehousePage />
      </div>
      <Footer />
    </div>
  );
}

function ManufacturingProductPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <ManufacturingProductPage />
      </div>
      <Footer />
    </div>
  );
}





function SalesForceManagementPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <SalesForceManagementPage />
      </div>
      <Footer />
    </div>
  );
}

function ProjectAndCostingPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <ProjectAndJobCostingPage />
      </div>
      <Footer />
    </div>
  );
}


function RetailAndEcommercePageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <RetailAndEcommercePage />
      </div>
      <Footer />
    </div>
  );
}



function WorkFlowAutomationPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <WorkflowPage />
      </div>
      <Footer />
    </div>
  );
}



function DashboardAndReportingPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <DashboardAndReportingPage />
      </div>
      <Footer />
    </div>
  );
}


function MulticompanyAndBranchesPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <MulticompanyAndBranchesPage />
      </div>
      <Footer />
    </div>
  );
}



function CareersPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <CareersPage />
      </div>
      <Footer />
    </div>
  );
}


function PointOfSalesPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ paddingTop: 76 }}>
        <PointOfSalesPage />
      </div>
      <Footer />
    </div>
  );
}


function HomeLayout() {
  return <HomePage />;
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
      { path: "partners",     Component: PartnerPage          },
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
      { path: "PointOfSales", Component: PointOfSalesPage },
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