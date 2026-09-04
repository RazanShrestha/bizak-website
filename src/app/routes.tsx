import { HomePage } from "./components/HomePage"

import { createBrowserRouter,Outlet, useParams } from "react-router";

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
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";
import { TermsPage } from "./components/TermsPage";
import { CookiePolicyPage } from "./components/CookiePolicyPage";
import { SecurityPage } from "./components/SecurityPage";
import { PoliciesAndAgreementsPage } from "./components/PoliciesAndAgreementsPage";
import { SalesOrderListDesignPage } from "./components/SalesOrderListDesignPage";
import { SalesOrderRegisterDesignPage } from "./components/SalesOrderRegisterDesignPage";
import { SupportTicketListDesignPage } from "./components/SupportTicketListDesignPage";
import { CreateSupportTicketDesignPage } from "./components/CreateSupportTicketDesignPage";
import { SalesOrderDetailDesignPage } from "./components/SalesOrderDetailDesignPage";
import { SalesOrderRecordDesignPage } from "./components/SalesOrderRecordDesignPage";
import { SalesOrderFormDesignPage } from "./components/SalesOrderFormDesignPage";
import { CustomFieldsBuilderPage } from "./components/CustomFieldsBuilder";
import { FormBuilderDesignPage } from "./components/FormBuilderDesignPage";
import { TrialBalanceDesignPage } from "./components/TrialBalanceDesignPage";
import { BalanceSheetDesignPage, BalanceSheetDetailDesignPage } from "./components/BalanceSheetDesignPage";
import { RolePermissionDesignPage } from "./components/RolePermissionDesignPage";
import { TimesheetRecordDesignPage } from "./components/timesheet/TimesheetRecordDesignPage";
import { TimesheetEntryDesignPage } from "./components/timesheet/TimesheetEntryDesignPage";
import { TimesheetApprovalsDesignPage } from "./components/timesheet/TimesheetApprovalsDesignPage";
import { TimesheetRegisterDesignPage } from "./components/timesheet/TimesheetRegisterDesignPage";
import { ProjectCostRollupDesignPage } from "./components/timesheet/ProjectCostRollupDesignPage";
import { UnbilledTimeDesignPage } from "./components/timesheet/UnbilledTimeDesignPage";
import { PresenceReconciliationDesignPage } from "./components/timesheet/PresenceReconciliationDesignPage";
import { MyWorkDesignPage } from "./components/productivity/MyWorkDesignPage";
import { ProjectPortfolioDesignPage } from "./components/productivity/ProjectPortfolioDesignPage";
import { ProjectWorkspaceDesignPage } from "./components/productivity/ProjectWorkspaceDesignPage";
import { AutoNumberDesignPage } from "./components/AutoNumberDesignPage";
import { ItemFormDesignPage } from "./components/ItemFormDesignPage";
import { ItemDetailDesignPage } from "./components/ItemDetailDesignPage";
import { BankReconciliationDesignPage } from "./components/BankReconciliationDesignPage";
import { BankStatementImportDesignPage } from "./components/BankStatementImportDesignPage";
import { SubscriptionPlanFormDesignPage } from "./components/SubscriptionPlanFormDesignPage";
import { PreferencesDesignPage } from "./components/PreferencesDesignPage";
import { MetricCardConfigDesignPage } from "./components/MetricCardConfigDesignPage";
import { DashboardAttributesDesignPage } from "./components/DashboardAttributesDesignPage";
import { CompanyDetailDesignPage, CompanyListDesignPage } from "./components/CompanyDetailDesignPage";
import { PartyRouteMappingDesignPage } from "./components/PartyRouteMappingDesignPage";
import { CustomerSubscriptionsDesignPage } from "./components/CustomerSubscriptionsDesignPage";
import { SubscribePartyDesignPage } from "./components/SubscribePartyDesignPage";
import { PlanUpgradeDesignPage } from "./components/PlanUpgradeDesignPage";
import { SubscriptionRevenueDesignPage } from "./components/SubscriptionRevenueDesignPage";
import { MasterRecordFormDesignPage } from "./components/MasterRecordFormDesignPage";
import { PosTerminalDesignPage } from "./components/PosTerminalDesignPage";
import { PosSetupDesignPage } from "./components/PosSetupDesignPage";
import { PosSessionStartDesignPage } from "./components/PosSessionStartDesignPage";
import { WorkflowSetupDesignPage } from "./components/WorkflowSetupDesignPage";
import { CalendarDialogDesignPage } from "./components/CalendarDialogDesignPage";
import { TenantRoleSelectionDesignPage } from "./components/TenantRoleSelectionDesignPage";
import { FileCabinetDesignPage } from "./components/FileCabinetDesignPage";
import { OnboardingJourneyDesignPage } from "./components/OnboardingJourneyDesignPage";
import { AuthDesignPage } from "./components/AuthDesignPage";
import { AuthSpotlightDesignPage } from "./components/AuthSpotlightDesignPage";
import { BulkDataImportDesignPage } from "./components/BulkDataImportDesignPage";
import { BackToTop } from "./components/bz";

// ─── Root passthrough (lets each page own its full layout) ────────────────────
function RootLayout() {
  return (
    <>
      <Outlet />
      <BackToTop />
    </>
  );
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




function AboutPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <AboutPage />
      <Footer
        cta={{
          title: "Bring your whole business onto one system.",
          titleMuted: "See what Bizak can do.",
          description:
            "Finance, inventory, sales and operations on a single platform, built for South Asia.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
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




function TrainingAndCertificationPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <TrainingAndCertificate />
      <Footer
        cta={{
          title: "Get your whole team fluent in Bizak.",
          titleMuted: "Pick a path, earn the badge.",
          description:
            "Hands-on courses, live cohorts and three certification levels authored by the team that builds Bizak.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
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
            "One team, building the operating system for modern business across South Asia. Your next chapter starts here.",

          primaryLabel: "View roles",
          secondaryLabel: "Send application",

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


function FindAPartnerPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header dark />
      <FindAPartnerPage />
      <Footer
        cta={{
          title: "Run your business with a Bizak partner.",
          titleMuted: "Or talk to our team directly.",
          description:
            "Match with a certified partner in your country, or start a self-serve trial today our team will help you find the right fit, usually within a day.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
    </div>
  );
}


function ContactPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header dark />
      <ContactPage />
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


function HelpCenterPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header dark />
      <HelpCenter />
      <Footer
        isLightMode
        cta={{
          title: "Everything you need to get value from Bizak.",
          titleMuted: "Start today.",
          description:
            "Spin up your workspace in minutes, or let our team walk you through it. No installs, no credit card required.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
    </div>
  );
}


function OurMissionPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <OurMissionPage />
      <Footer
        cta={{
          title: "Be part of the mission.",
          titleMuted: "Run your business on Bizak.",
          description:
            "Every team that joins makes the platform sharper for the next. Start in a day, or talk to us about where you're headed.",
          primaryLabel: "Get Started",
          secondaryLabel: "Request Demo",
        }}
      />
    </div>
  );
}


function PressAndMediaPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <PressAndMediaPage />
      <Footer
        cta={{
          title: "See what the coverage is about.",
          titleMuted: "Run your business on Bizak.",
          description:
            "One platform for finance, sales, inventory and operations. Go live in a day, not a quarter.",
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


// ─── Legal & Trust pages dark header flows into the dark hero ────────────────

function PrivacyPolicyPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header dark />
      <PrivacyPolicyPage />
      <Footer hideCta />
    </div>
  );
}

function TermsPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header dark />
      <TermsPage />
      <Footer hideCta />
    </div>
  );
}

function CookiePolicyPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header dark />
      <CookiePolicyPage />
      <Footer hideCta />
    </div>
  );
}

function SecurityPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header dark />
      <SecurityPage />
      <Footer hideCta />
    </div>
  );
}

function PoliciesAndAgreementsPageLayout() {
  return (
    <div className="bz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header dark />
      <PoliciesAndAgreementsPage />
      <Footer hideCta />
    </div>
  );
}

function SalesOrderListDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SalesOrderListDesignPage />
    </div>
  );
}

function SalesOrderRegisterDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SalesOrderRegisterDesignPage />
    </div>
  );
}

function SupportTicketListDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SupportTicketListDesignPage />
    </div>
  );
}

function CreateSupportTicketDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <CreateSupportTicketDesignPage />
    </div>
  );
}

function SalesOrderDetailDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SalesOrderDetailDesignPage />
    </div>
  );
}

function SalesOrderRecordDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SalesOrderRecordDesignPage />
    </div>
  );
}

function SalesOrderCreateDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SalesOrderFormDesignPage mode="create" />
    </div>
  );
}

function SalesOrderEditDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SalesOrderFormDesignPage mode="edit" />
    </div>
  );
}

function CustomFieldsBuilderPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <CustomFieldsBuilderPage />
    </div>
  );
}

function FormBuilderDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <FormBuilderDesignPage />
    </div>
  );
}

function TrialBalanceDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <TrialBalanceDesignPage />
    </div>
  );
}

function BalanceSheetDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <BalanceSheetDesignPage />
    </div>
  );
}

// ── Productivity module (My Work · Portfolio · Project workspace) ───────
function MyWorkDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <MyWorkDesignPage />
    </div>
  );
}

function ProjectPortfolioDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <ProjectPortfolioDesignPage />
    </div>
  );
}

function ProjectWorkspaceDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <ProjectWorkspaceDesignPage />
    </div>
  );
}

// ── Timesheet module (7 surfaces of one flow) ──────────────────────────────
function TimesheetRecordDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <TimesheetRecordDesignPage />
    </div>
  );
}

function TimesheetEntryDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <TimesheetEntryDesignPage />
    </div>
  );
}

function TimesheetApprovalsDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <TimesheetApprovalsDesignPage />
    </div>
  );
}

function TimesheetRegisterDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <TimesheetRegisterDesignPage />
    </div>
  );
}

function ProjectCostRollupDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <ProjectCostRollupDesignPage />
    </div>
  );
}

function UnbilledTimeDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <UnbilledTimeDesignPage />
    </div>
  );
}

function PresenceReconciliationDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <PresenceReconciliationDesignPage />
    </div>
  );
}

function RolePermissionDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <RolePermissionDesignPage />
    </div>
  );
}

function BalanceSheetDetailDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <BalanceSheetDetailDesignPage />
    </div>
  );
}

function AutoNumberDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <AutoNumberDesignPage />
    </div>
  );
}

function ItemCreateDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <ItemFormDesignPage mode="create" />
    </div>
  );
}

function ItemDetailDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <ItemDetailDesignPage />
    </div>
  );
}

function ItemEditDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <ItemFormDesignPage mode="edit" />
    </div>
  );
}

function BankReconciliationDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <BankReconciliationDesignPage />
    </div>
  );
}

function BankStatementImportDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <BankStatementImportDesignPage />
    </div>
  );
}

function SubscriptionPlanCreateDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SubscriptionPlanFormDesignPage mode="create" />
    </div>
  );
}

function SubscriptionPlanEditDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SubscriptionPlanFormDesignPage mode="edit" />
    </div>
  );
}

function PreferencesDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <PreferencesDesignPage />
    </div>
  );
}

function MetricCardConfigDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <MetricCardConfigDesignPage />
    </div>
  );
}

function DashboardAttributesDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <DashboardAttributesDesignPage />
    </div>
  );
}

function CompanyListDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <CompanyListDesignPage />
    </div>
  );
}

function CompanyDetailDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <CompanyDetailDesignPage />
    </div>
  );
}

function PartyRouteMappingDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <PartyRouteMappingDesignPage />
    </div>
  );
}


function CustomerSubscriptionsDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <CustomerSubscriptionsDesignPage />
    </div>
  );
}

function SubscribePartyDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SubscribePartyDesignPage />
    </div>
  );
}

function PlanUpgradeDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <PlanUpgradeDesignPage />
    </div>
  );
}

function SubscriptionRevenueDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <SubscriptionRevenueDesignPage />
    </div>
  );
}

function MasterRecordFormDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <MasterRecordFormDesignPage />
    </div>
  );
}

function PosTerminalDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <PosTerminalDesignPage />
    </div>
  );
}

function PosSetupDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <PosSetupDesignPage />
    </div>
  );
}

function PosSessionStartDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <PosSessionStartDesignPage />
    </div>
  );
}

function WorkflowSetupDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <WorkflowSetupDesignPage />
    </div>
  );
}

function CalendarDialogDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <CalendarDialogDesignPage />
    </div>
  );
}

function TenantRoleSelectionDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <TenantRoleSelectionDesignPage />
    </div>
  );
}

function FileCabinetDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <FileCabinetDesignPage />
    </div>
  );
}

function OnboardingJourneyDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <OnboardingJourneyDesignPage />
    </div>
  );
}

function SignInDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthDesignPage mode="signin" />
    </div>
  );
}

function SignUpDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthDesignPage mode="signup" />
    </div>
  );
}

function ForgotPasswordDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthDesignPage mode="recover" />
    </div>
  );
}

function SignInSpotlightDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthSpotlightDesignPage mode="signin" />
    </div>
  );
}

function SignUpSpotlightDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthSpotlightDesignPage mode="signup" />
    </div>
  );
}

function ForgotPasswordSpotlightDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthSpotlightDesignPage mode="recover" />
    </div>
  );
}

function BulkDataImportDesignPageLayout() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <BulkDataImportDesignPage />
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
      { path: "about",         Component: AboutPageLayout     },
      { path: "contact",      Component: ContactPageLayout    },
      { path: "partners",                Component: PartnerPageLayout        },
      { path: "partners/resellers",      Component: ResellersPageLayout      },
      { path: "partners/consultants",    Component: ConsultantsPageLayout    },
      { path: "partners/technology",     Component: TechnologyPartnersPageLayout },
      { path: "partners/portal",         Component: PartnerPortalPageLayout  },
      { path: "partners/marketplace",    Component: MarketplacePage          },
      { path: "partners/find",           Component: FindAPartnerPageLayout   },
      { path: "partners/awards",         Component: PartnerAwardsPage        },
      { path: "partners/events",                          Component: PartnerEventsPage          },
      { path: "partners/events/register/:slug",           Component: PartnerEventRegisterPage   },
      { path: "partners/events/enroll/:slug",             Component: PartnerEventEnrollPage     },
      { path: "case-studies",   Component: CaseStudiesPageLayout },
      { path: "case-studies/:slug", Component: CaseStudyPageLayout },
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
      { path: "support",         Component: HelpCenterPageLayout },
      { path: "HelpCenter",      Component: HelpCenterPageLayout },
      { path: "OurMission",      Component: OurMissionPageLayout },
      { path: "LeadershipTeam",  Component: LeadershipTeamPage },
      { path: "leadership",      Component: LeadershipTeamPage },
      { path: "system-status",   Component: SystemStatusPage   },
      { path: "SystemStatus",    Component: SystemStatusPage   },
      { path: "documentation",   Component: DocumentationPage  },
      { path: "Documentation",   Component: DocumentationPage  },
    
      { path: "PressAndMedia",   Component: PressAndMediaPageLayout  },
      { path: "GuidesAndPlaybooks", Component: GuidesAndPlaybooksPageLayout },
      { path: "GuidesAndPlaybooks/:slug", Component: ResourceDetailPageLayout },
      { path: "TrainingAndCertification", Component: TrainingAndCertificationPageLayout },
      { path: "TrainingAndCertification/enrol/:slug", Component: EnrollmentPage },
      { path: "CommunityForum", Component: CommunityForum },
      { path: "WebinarsAndEvents", Component: WebinarsAndEvents },
      { path: "WebinarsAndEvents/save-seat/:eventId", Component: SaveSeatPage },
      { path: "privacy",   Component: PrivacyPolicyPageLayout },
      { path: "terms",     Component: TermsPageLayout },
      { path: "cookies",   Component: CookiePolicyPageLayout },
      { path: "security",  Component: SecurityPageLayout },
      { path: "policies",  Component: PoliciesAndAgreementsPageLayout },
      { path: "design/sales-order-list",            Component: SalesOrderListDesignPageLayout    },
      { path: "design/sales-order-register",        Component: SalesOrderRegisterDesignPageLayout },
      { path: "design/sales-order-list/new",        Component: SalesOrderCreateDesignPageLayout  },
      { path: "design/sales-order-list/:id",        Component: SalesOrderDetailDesignPageLayout  },
      { path: "design/sales-order-list/:id/edit",   Component: SalesOrderEditDesignPageLayout    },
      { path: "design/sales-order-record",          Component: SalesOrderRecordDesignPageLayout  },
      { path: "design/support-tickets",             Component: SupportTicketListDesignPageLayout },
      { path: "design/support-tickets/new",         Component: CreateSupportTicketDesignPageLayout },
      { path: "design/custom-fields",               Component: CustomFieldsBuilderPageLayout     },
      { path: "design/form-builder",                Component: FormBuilderDesignPageLayout       },
      { path: "design/trial-balance",               Component: TrialBalanceDesignPageLayout      },
      { path: "design/balance-sheet",               Component: BalanceSheetDesignPageLayout      },
      { path: "design/balance-sheet/detail",        Component: BalanceSheetDetailDesignPageLayout },
      { path: "design/roles",                       Component: RolePermissionDesignPageLayout    },
      { path: "design/work",                        Component: MyWorkDesignPageLayout            },
      { path: "design/work/projects",               Component: ProjectPortfolioDesignPageLayout  },
      { path: "design/work/project/:id",            Component: ProjectWorkspaceDesignPageLayout  },
      { path: "design/timesheet",                   Component: TimesheetRecordDesignPageLayout   },
      { path: "design/timesheet/mine",              Component: TimesheetRecordDesignPageLayout   },
      { path: "design/timesheet/entry",             Component: TimesheetEntryDesignPageLayout    },
      { path: "design/timesheet/approvals",         Component: TimesheetApprovalsDesignPageLayout },
      { path: "design/timesheet/register",          Component: TimesheetRegisterDesignPageLayout },
      { path: "design/timesheet/project-cost",      Component: ProjectCostRollupDesignPageLayout },
      { path: "design/timesheet/unbilled",          Component: UnbilledTimeDesignPageLayout      },
      { path: "design/timesheet/reconciliation",    Component: PresenceReconciliationDesignPageLayout },
      { path: "design/auto-number",                 Component: AutoNumberDesignPageLayout        },
      { path: "design/item/new",                    Component: ItemCreateDesignPageLayout        },
      { path: "design/item/:id",                    Component: ItemDetailDesignPageLayout        },
      { path: "design/item/:id/edit",               Component: ItemEditDesignPageLayout          },
      { path: "design/bank-reconciliation",         Component: BankReconciliationDesignPageLayout   },
      { path: "design/bank-import",                 Component: BankStatementImportDesignPageLayout  },
      { path: "design/subscription-plan/new",       Component: SubscriptionPlanCreateDesignPageLayout },
      { path: "design/subscription-plan/:id/edit",  Component: SubscriptionPlanEditDesignPageLayout },
      { path: "design/preferences",                 Component: PreferencesDesignPageLayout       },
      { path: "design/dashboard",                   Component: MetricCardConfigDesignPageLayout  },
      { path: "design/dashboard-attributes",        Component: DashboardAttributesDesignPageLayout },
      { path: "design/companies",                   Component: CompanyListDesignPageLayout       },
      { path: "design/companies/:id",               Component: CompanyDetailDesignPageLayout     },
      { path: "design/party-route-mapping",         Component: PartyRouteMappingDesignPageLayout },
      { path: "design/customer-subscriptions",      Component: CustomerSubscriptionsDesignPageLayout },
      { path: "design/subscribe-party",             Component: SubscribePartyDesignPageLayout    },
      { path: "design/plan-upgrade",                Component: PlanUpgradeDesignPageLayout       },
      { path: "design/subscription-revenue",        Component: SubscriptionRevenueDesignPageLayout },
      { path: "design/master-record",               Component: MasterRecordFormDesignPageLayout },
      { path: "design/pos-terminal",                Component: PosTerminalDesignPageLayout       },
      { path: "design/pos-setup",                   Component: PosSetupDesignPageLayout          },
      { path: "design/pos-session",                 Component: PosSessionStartDesignPageLayout   },
      { path: "design/workflow",                    Component: WorkflowSetupDesignPageLayout     },
      { path: "design/calendar",                    Component: CalendarDialogDesignPageLayout    },
      { path: "design/tenant-selection",            Component: TenantRoleSelectionDesignPageLayout },
      { path: "design/file-cabinet",                Component: FileCabinetDesignPageLayout       },
      { path: "design/onboarding",                  Component: OnboardingJourneyDesignPageLayout },
      { path: "design/sign-in",                     Component: SignInDesignPageLayout            },
      { path: "design/sign-up",                     Component: SignUpDesignPageLayout            },
      { path: "design/forgot-password",             Component: ForgotPasswordDesignPageLayout    },
      { path: "design/sign-in-alt",                 Component: SignInSpotlightDesignPageLayout   },
      { path: "design/sign-up-alt",                 Component: SignUpSpotlightDesignPageLayout   },
      { path: "design/forgot-password-alt",         Component: ForgotPasswordSpotlightDesignPageLayout },
      { path: "design/data-imports",                Component: BulkDataImportDesignPageLayout    },
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