import React from "react";
import "./AboutUs.css";

import Header from "../Components/CiisNavbar";
import Footer from "../Components/CiisFooter";

import {
  Shield,
  Users,
  TrendingUp,
  Target,
  Clock,
  Layers,
  Settings,
  Calendar,
  Briefcase,
  ClipboardCheck,
  BarChart3,
  Building,
  UserCog,
  PieChart,
  Globe,
  Smartphone,
  Database,
  MessageSquare,
  Zap,
  Lock,
} from "lucide-react";


const AboutUs = () => {
  return (
    <div className="About-container">
      <Header />

      {/* HERO SECTION */}
      <section className="About-hero">
        <div className="About-hero-background">
          <div className="About-hero-radial-gradient" />
          <div className="About-hero-grid-overlay" />
        </div>

        <div className="About-heroContainer">
          <div className="About-heroContent">
            <h1 className="About-heroTitle">
              <span className="About-heroMain">
                Streamlining Organizational Excellence
              </span>
              <span className="About-heroSubtitle">
                A comprehensive platform unifying workforce management across
                all levels
              </span>
            </h1>

            <p className="About-heroDescription">
              Our Employee Management Portal revolutionizes internal operations
              through automated workflows, real-time tracking, and role-based
              dashboards. From daily attendance to complex approval processes, we
              provide a seamless ecosystem for modern organizations to thrive.
            </p>

            <div className="About-hero-stats">
              <div className="About-hero-stat">
                <div className="About-hero-stat-number">3-Tier</div>
                <div className="About-hero-stat-label">Management System</div>
              </div>

              <div className="About-hero-stat-divider" />

              <div className="About-hero-stat">
                <div className="About-hero-stat-number">24/7</div>
                <div className="About-hero-stat-label">Real-time Access</div>
              </div>

              <div className="About-hero-stat-divider" />

              <div className="About-hero-stat">
                <div className="About-hero-stat-number">100%</div>
                <div className="About-hero-stat-label">Data Centralization</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY OVERVIEW */}
      <section className="About-section About-company">
        <div className="About-sectionContainer">
          <div className="About-sectionHeader">
            <h2 className="About-sectionTitle">
              <span className="About-sectionTitle-accent">Complete</span>{" "}
              Workforce Management
            </h2>
            <p className="About-sectionDescription">
              An integrated platform connecting employees, team leads, managers,
              HR, and administrators
            </p>
          </div>

          <div className="About-companyContent">
            <div className="About-companyText">
              <p className="About-companyIntro">
                Our Employee Management Portal is engineered to transform how
                organizations operate internally. By automating routine tasks,
                centralizing data, and providing role-specific interfaces, we
                enable seamless collaboration across all organizational levels
                while maintaining complete transparency and control.
              </p>

              <div className="About-companyHighlights">
                <div className="About-highlight">
                  <Zap className="About-highlight-icon" size={20} />
                  <span>
                    Automated workflows for attendance, tasks, and approvals
                  </span>
                </div>

                <div className="About-highlight">
                  <Database className="About-highlight-icon" size={20} />
                  <span>Centralized data management across departments</span>
                </div>

                <div className="About-highlight">
                  <Lock className="About-highlight-icon" size={20} />
                  <span>
                    Role-based access control with multi-level security
                  </span>
                </div>

                <div className="About-highlight">
                  <Globe className="About-highlight-icon" size={20} />
                  <span>Seamless communication and transparent workflows</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="About-companyStats">
              <div className="About-statCard">
                <div className="About-statCard-inner">
                  <div className="About-statIcon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="About-statContent">
                    <div className="About-statNumber">40%</div>
                    <div className="About-statLabel">Productivity Increase</div>
                  </div>
                </div>
              </div>

              <div className="About-statCard">
                <div className="About-statCard-inner">
                  <div className="About-statIcon">
                    <Clock size={24} />
                  </div>
                  <div className="About-statContent">
                    <div className="About-statNumber">70%</div>
                    <div className="About-statLabel">Time Saved</div>
                  </div>
                </div>
              </div>

              <div className="About-statCard">
                <div className="About-statCard-inner">
                  <div className="About-statIcon">
                    <BarChart3 size={24} />
                  </div>
                  <div className="About-statContent">
                    <div className="About-statNumber">100%</div>
                    <div className="About-statLabel">Real-time Tracking</div>
                  </div>
                </div>
              </div>

              <div className="About-statCard">
                <div className="About-statCard-inner">
                  <div className="About-statIcon">
                    <Shield size={24} />
                  </div>
                  <div className="About-statContent">
                    <div className="About-statNumber">99.9%</div>
                    <div className="About-statLabel">Data Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE BASED FEATURES */}
      <section className="About-section About-missionVision">
        <div className="About-sectionContainer">
          <div className="About-sectionHeader">
            <h2 className="About-sectionTitle">Role-Specific Capabilities</h2>
            <p className="About-sectionDescription">
              Tailored interfaces and tools for every organizational role
            </p>
          </div>

          <div className="About-cardsContainer">
            {/* Manager */}
            <div className="About-card About-card-manager">
              <div className="About-card-header">
                <div className="About-cardIcon">
                  <UserCog size={28} />
                </div>
                <h3 className="About-cardTitle">Managers</h3>
              </div>

              <p className="About-cardText">
                Supervise Team Leads, approve/reject leave requests, manage
                asset allocations, analyze team performance metrics, oversee IT
                operations, and make strategic resource decisions.
              </p>

              <div className="About-card-footer">
                <span className="About-card-tag">Leave Approvals</span>
                <span className="About-card-tag">Asset Management</span>
                <span className="About-card-tag">Performance Analysis</span>
                <span className="About-card-tag">Team Supervision</span>
              </div>
            </div>

            {/* HR Admin */}
            <div className="About-card About-card-hr">
              <div className="About-card-header">
                <div className="About-cardIcon">
                  <Building size={28} />
                </div>
                <h3 className="About-cardTitle">HR & Administration</h3>
              </div>

              <p className="About-cardText">
                Manage employee records, attendance history, leave policies,
                onboarding/offboarding processes, compliance tracking, user
                management, and system configurations.
              </p>

              <div className="About-card-footer">
                <span className="About-card-tag">Employee Data</span>
                <span className="About-card-tag">Compliance</span>
                <span className="About-card-tag">User Management</span>
                <span className="About-card-tag">System Control</span>
              </div>
            </div>

            {/* Team Lead */}
            <div className="About-card About-card-tl">
              <div className="About-card-header">
                <div className="About-cardIcon">
                  <Users size={28} />
                </div>
                <h3 className="About-cardTitle">Team Leads</h3>
              </div>

              <p className="About-cardText">
                Assign and monitor tasks, track team progress, manage workload
                distribution, approve routine requests, and generate performance
                reports.
              </p>

              <div className="About-card-footer">
                <span className="About-card-tag">Task Assignment</span>
                <span className="About-card-tag">Team Monitoring</span>
                <span className="About-card-tag">Work Distribution</span>
                <span className="About-card-tag">Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="About-section About-coreValues">
        <div className="About-sectionContainer">
          <div className="About-sectionHeader">
            <h2 className="About-sectionTitle">Core Platform Features</h2>
            <p className="About-sectionDescription">
              Comprehensive tools for efficient organizational management
            </p>
          </div>

          <div className="About-valuesGrid">
            <FeatureCard
              icon={<Clock size={24} />}
              title="Attendance Tracking"
              desc="Real-time marking, geolocation verification, shift management, and reporting."
            />

            <FeatureCard
              icon={<ClipboardCheck size={24} />}
              title="Task Management"
              desc="Assignment, tracking, priority levels, deadlines, and performance metrics."
            />

            <FeatureCard
              icon={<Calendar size={24} />}
              title="Leave Management"
              desc="Automated leave workflow with multi-level approvals and policy enforcement."
            />

            <FeatureCard
              icon={<Briefcase size={24} />}
              title="Asset Management"
              desc="End-to-end lifecycle tracking from request to allocation and retirement."
            />

            <FeatureCard
              icon={<PieChart size={24} />}
              title="Performance Tracking"
              desc="Analytics for individual, team, and department-level KPIs."
            />

            <FeatureCard
              icon={<BarChart3 size={24} />}
              title="Reports & Analytics"
              desc="Real-time dashboards for data-driven decisions."
            />
          </div>
        </div>
      </section>

      {/* WORKFLOW AUTOMATION */}
      <section className="About-section About-whyChoose">
        <div className="About-sectionContainer">
          <div className="About-sectionHeader">
            <h2 className="About-sectionTitle">Automated Workflows & Approvals</h2>
            <p className="About-sectionDescription">
              Streamlined processes that eliminate manual work and increase
              efficiency
            </p>
          </div>

          <div className="About-featuresGrid">
            <AutomateCard
              icon={<Layers size={24} />}
              title="Multi-Level Approvals"
              desc="Configurable hierarchies for leaves, assets, and requests."
            />

            <AutomateCard
              icon={<Target size={24} />}
              title="Real-Time Monitoring"
              desc="Live dashboards for attendance, task status, and performance."
            />

            <AutomateCard
              icon={<PieChart size={24} />}
              title="Role-Based Dashboards"
              desc="Custom dashboards for each role in the organization."
            />

            <AutomateCard
              icon={<Smartphone size={24} />}
              title="Mobile Accessibility"
              desc="Full functionality on mobile devices."
            />

            <AutomateCard
              icon={<Shield size={24} />}
              title="Security & Compliance"
              desc="Enterprise-grade security with audit trails."
            />

            <AutomateCard
              icon={<Settings size={24} />}
              title="Integration Capabilities"
              desc="Integrates with HR, payroll, and enterprise platforms."
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="About-section About-cta">
        <div className="About-sectionContainer">
          <div className="About-sectionHeader">
            <h2 className="About-sectionTitle">Transform Your Organization</h2>
            <p className="About-sectionDescription">
              Key benefits of implementing our Employee Management Portal
            </p>
          </div>

          <div className="About-benefits-grid">
            <BenefitCard
              icon={<TrendingUp size={24} />}
              title="Increased Productivity"
              desc="Automation reduces admin workload by up to 60%."
            />

            <BenefitCard
              icon={<MessageSquare size={24} />}
              title="Improved Communication"
              desc="Seamless information flow with automated notifications."
            />

            <BenefitCard
              icon={<Database size={24} />}
              title="Centralized Records"
              desc="Single source of truth for all employee data."
            />

            <BenefitCard
              icon={<Globe size={24} />}
              title="Transparent Workflows"
              desc="Complete visibility into approvals and performance."
            />

            <BenefitCard
              icon={<BarChart3 size={24} />}
              title="Data-Driven Decisions"
              desc="Comprehensive analytics for strategic planning."
            />

            <BenefitCard
              icon={<Shield size={24} />}
              title="Enhanced Compliance"
              desc="Automated tracking of policies and regulatory requirements."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* -------- REUSABLE COMPONENTS -------- */

const FeatureCard = ({ icon, title, desc }) => (
  <div className="About-valueCard">
    <div className="About-valueIcon">{icon}</div>
    <h3 className="About-valueTitle">{title}</h3>
    <p>{desc}</p>
    <div className="About-value-border" />
  </div>
);

const AutomateCard = ({ icon, title, desc }) => (
  <div className="About-featureCard">
    <div className="About-featureIcon">
      <div className="About-featureIcon-bg" />
      {icon}
    </div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const BenefitCard = ({ icon, title, desc }) => (
  <div className="About-benefit-card">
    <div className="About-benefit-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

export default AboutUs;
