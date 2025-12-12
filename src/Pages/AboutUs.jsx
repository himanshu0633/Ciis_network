import React from 'react';
import './AboutUs.css';
import Header from "../Components/CiisNavbar";
import Footer from "../Components/CiisFooter";
import { 
  CheckCircle, 
  Shield, 
  Users, 
  TrendingUp, 
  Award, 
  Target, 
  Clock, 
  UserCheck, 
  Layers, 
  Settings,
  Calendar,
  Briefcase,
  ListChecks,
  ClipboardCheck,
  BarChart3,
  Key,
  Building,
  UserCog,
  FolderOpen,
  FileText,
  Zap,
  Lock,
  PieChart,
  Bell,
  Globe,
  Smartphone,
  Database,
  Workflow,
  MessageSquare,
  Download
} from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="About-container">
      <Header />
      
      {/* Hero Section - Professional Employee Portal */}
      <section className="About-hero">
        <div className="About-hero-background">
          <div className="About-hero-radial-gradient"></div>
          <div className="About-hero-grid-overlay"></div>
        </div>
        
        <div className="About-heroContainer">
          <div className="About-heroContent">           
            <h1 className="About-heroTitle">
              <span className="About-heroMain">Streamlining Organizational Excellence</span>
              <span className="About-heroSubtitle">
                A comprehensive platform unifying workforce management across all levels
              </span>
            </h1>
            
            <p className="About-heroDescription">
              Our Employee Management Portal revolutionizes internal operations through automated workflows, 
              real-time tracking, and role-based dashboards. From daily attendance to complex approval processes, 
              we provide a seamless ecosystem for modern organizations to thrive.
            </p>
            
            <div className="About-hero-stats">
              <div className="About-hero-stat">
                <div className="About-hero-stat-number">3-Tier</div>
                <div className="About-hero-stat-label">Management System</div>
              </div>
              <div className="About-hero-stat-divider"></div>
              <div className="About-hero-stat">
                <div className="About-hero-stat-number">24/7</div>
                <div className="About-hero-stat-label">Real-time Access</div>
              </div>
              <div className="About-hero-stat-divider"></div>
              <div className="About-hero-stat">
                <div className="About-hero-stat-number">100%</div>
                <div className="About-hero-stat-label">Data Centralization</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Overview Section */}
      <section className="About-section About-company">
        <div className="About-sectionContainer">
          <div className="About-sectionHeader">
            <h2 className="About-sectionTitle">
              <span className="About-sectionTitle-accent">Complete</span> Workforce Management
            </h2>
            <p className="About-sectionDescription">
              An integrated platform connecting employees, team leads, managers, HR, and administrators
            </p>
          </div>
          
          <div className="About-companyContent">
            <div className="About-companyText">
              <p className="About-companyIntro">
                Our Employee Management Portal is engineered to transform how organizations operate internally. 
                By automating routine tasks, centralizing data, and providing role-specific interfaces, we enable 
                seamless collaboration across all organizational levels while maintaining complete transparency 
                and control.
              </p>
              
              <div className="About-companyHighlights">
                <div className="About-highlight">
                  <Zap className="About-highlight-icon" size={20} />
                  <span>Automated workflows for attendance, tasks, and approvals</span>
                </div>
                <div className="About-highlight">
                  <Database className="About-highlight-icon" size={20} />
                  <span>Centralized data management across all departments</span>
                </div>
                <div className="About-highlight">
                  <Lock className="About-highlight-icon" size={20} />
                  <span>Role-based access control with multi-level security</span>
                </div>
                <div className="About-highlight">
                  <Globe className="About-highlight-icon" size={20} />
                  <span>Seamless communication and transparent workflows</span>
                </div>
              </div>
            </div>
            
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

      {/* Role-Based Features Section */}
      <section className="About-section About-missionVision">
        <div className="About-sectionContainer">
          <div className="About-sectionHeader">
            <h2 className="About-sectionTitle">Role-Specific Capabilities</h2>
            <p className="About-sectionDescription">
              Tailored interfaces and tools for every organizational role
            </p>
          </div>
          
          <div className="About-cardsContainer"> 
            {/* Manager Card */}
            <div className="About-card About-card-manager">
              <div className="About-card-header">
                <div className="About-cardIcon">
                  <UserCog size={28} />
                </div>
                <h3 className="About-cardTitle">Managers</h3>
              </div>
              <p className="About-cardText">
                Supervise Team Leads, approve/reject leave requests, manage asset allocations, 
                analyze team performance metrics, oversee IT operations, and make strategic resource decisions.
              </p>
              <div className="About-card-footer">
                <span className="About-card-tag">Leave Approvals</span>
                <span className="About-card-tag">Asset Management</span>
                <span className="About-card-tag">Performance Analysis</span>
                <span className="About-card-tag">Team Supervision</span>
              </div>
            </div>         

            {/* HR & Admin Cards */}
            <div className="About-card About-card-hr">
              <div className="About-card-header">
                <div className="About-cardIcon">
                  <Building size={28} />
                </div>
                <h3 className="About-cardTitle">HR & Administration</h3>
              </div>
              <p className="About-cardText">
                Manage employee records, attendance history, leave policies, onboarding/offboarding processes, 
                compliance tracking, user management, department configuration, and system-wide settings.
              </p>
              <div className="About-card-footer">
                <span className="About-card-tag">Employee Data</span>
                <span className="About-card-tag">Compliance</span>
                <span className="About-card-tag">User Management</span>
                <span className="About-card-tag">System Control</span>
              </div>
            </div>

            {/* Team Lead Card */}
            <div className="About-card About-card-tl">
              <div className="About-card-header">
                <div className="About-cardIcon">
                  <Users size={28} />
                </div>
                <h3 className="About-cardTitle">Team Leads (TL)</h3>
              </div>
              <p className="About-cardText">
                Assign and monitor daily tasks, track team progress, manage workload distribution, 
                approve routine requests, and generate team performance reports for effective supervision.
              </p>
              <div className="About-card-footer">
                <span className="About-card-tag">Task Assignment</span>
                <span className="About-card-tag">Team Monitoring</span>
                <span className="About-card-tag">Work Distribution</span>
                <span className="About-card-tag">Progress Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="About-section About-coreValues">
        <div className="About-sectionContainer">
          <div className="About-sectionHeader">
            <h2 className="About-sectionTitle">Core Platform Features</h2>
            <p className="About-sectionDescription">
              Comprehensive tools for efficient organizational management
            </p>
          </div>
          
          <div className="About-valuesGrid">
            {/* Attendance Management */}
            <div className="About-valueCard">
              <div className="About-valueIcon">
                <Clock size={24} />
              </div>
              <h3 className="About-valueTitle">Attendance Tracking</h3>
              <p>Real-time attendance marking with geo-location verification, shift management, and comprehensive reporting for complete visibility</p>
              <div className="About-value-border"></div>
            </div>
            
            {/* Task Management */}
            <div className="About-valueCard">
              <div className="About-valueIcon">
                <ClipboardCheck size={24} />
              </div>
              <h3 className="About-valueTitle">Task Management</h3>
              <p>End-to-end task lifecycle management with assignment, tracking, priority levels, deadlines, and performance metrics</p>
              <div className="About-value-border"></div>
            </div>
            
            {/* Leave Management */}
            <div className="About-valueCard">
              <div className="About-valueIcon">
                <Calendar size={24} />
              </div>
              <h3 className="About-valueTitle">Leave Management</h3>
              <p>Automated leave workflow with multi-level approvals, balance tracking, policy enforcement, and calendar integration</p>
              <div className="About-value-border"></div>
            </div>
            
            {/* Asset Management */}
            <div className="About-valueCard">
              <div className="About-valueIcon">
                <Briefcase size={24} />
              </div>
              <h3 className="About-valueTitle">Asset Management</h3>
              <p>Complete asset lifecycle management from request to allocation, tracking, maintenance, and retirement</p>
              <div className="About-value-border"></div>
            </div>

            {/* Performance Tracking */}
            <div className="About-valueCard">
              <div className="About-valueIcon">
                <PieChart size={24} />
              </div>
              <h3 className="About-valueTitle">Performance Tracking</h3>
              <p>Comprehensive analytics and reporting on individual, team, and departmental performance metrics</p>
              <div className="About-value-border"></div>
            </div>    

            {/* Reports & Analytics */}
            <div className="About-valueCard">
              <div className="About-valueIcon">
                <BarChart3 size={24} />
              </div>
              <h3 className="About-valueTitle">Reports & Analytics</h3>
              <p>Real-time dashboards and detailed reports for data-driven decision making at all levels</p>
              <div className="About-value-border"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Automation Section */}
      <section className="About-section About-whyChoose">
        <div className="About-sectionContainer">
          <div className="About-sectionHeader">
            <h2 className="About-sectionTitle">Automated Workflows & Approvals</h2>
            <p className="About-sectionDescription">
              Streamlined processes that eliminate manual work and increase efficiency
            </p>
          </div>
          
          <div className="About-featuresGrid">
            {/* Multi-Level Approvals */}
            <div className="About-featureCard">
              <div className="About-featureIcon">
                <div className="About-featureIcon-bg"></div>
                <Layers size={24} />
              </div>
              <h3>Multi-Level Approvals</h3>
              <p>Configurable approval hierarchies for leaves, assets, and requests with escalation mechanisms</p>
            </div>
            
            {/* Real-Time Monitoring */}
            <div className="About-featureCard">
              <div className="About-featureIcon">
                <div className="About-featureIcon-bg"></div>
                <Target size={24} />
              </div>
              <h3>Real-Time Monitoring</h3>
              <p>Live dashboards showing attendance, task completion, leave status, and team performance metrics</p>
            </div>
            
            {/* Role-Based Dashboards */}
            <div className="About-featureCard">
              <div className="About-featureIcon">
                <div className="About-featureIcon-bg"></div>
                <PieChart size={24} />
              </div>
              <h3>Role-Based Dashboards</h3>
              <p>Customized interfaces showing relevant information and controls for each organizational role</p>
            </div>
            
            {/* Mobile Accessibility */}
            <div className="About-featureCard">
              <div className="About-featureIcon">
                <div className="About-featureIcon-bg"></div>
                <Smartphone size={24} />
              </div>
              <h3>Mobile Accessibility</h3>
              <p>Full functionality available on mobile devices for on-the-go management and updates</p>
            </div>

            {/* Security & Compliance */}
            <div className="About-featureCard">
              <div className="About-featureIcon">
                <div className="About-featureIcon-bg"></div>
                <Shield size={24} />
              </div>
              <h3>Security & Compliance</h3>
              <p>Enterprise-grade security with role-based permissions and audit trails for all activities</p>
            </div>

            {/* Integration Capabilities */}
            <div className="About-featureCard">
              <div className="About-featureIcon">
                <div className="About-featureIcon-bg"></div>
                <Settings size={24} />
              </div>
              <h3>Integration Capabilities</h3>
              <p>Seamless integration with existing HR systems, payroll, and other enterprise applications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="About-section About-cta">
        <div className="About-sectionContainer">
          <div className="About-sectionHeader">
            <h2 className="About-sectionTitle">Transform Your Organization</h2>
            <p className="About-sectionDescription">
              Key benefits of implementing our Employee Management Portal
            </p>
          </div>
          
          <div className="About-benefits-grid">
            <div className="About-benefit-card">
              <div className="About-benefit-icon">
                <TrendingUp size={24} />
              </div>
              <h3>Increased Productivity</h3>
              <p>Automation reduces administrative workload by up to 60%, allowing focus on strategic tasks</p>
            </div>

            <div className="About-benefit-card">
              <div className="About-benefit-icon">
                <MessageSquare size={24} />
              </div>
              <h3>Improved Communication</h3>
              <p>Seamless information flow across all management levels with automated notifications</p>
            </div>

            <div className="About-benefit-card">
              <div className="About-benefit-icon">
                <Database size={24} />
              </div>
              <h3>Centralized Records</h3>
              <p>Single source of truth for all employee data, activities, and organizational information</p>
            </div>

            <div className="About-benefit-card">
              <div className="About-benefit-icon">
                <Globe size={24} />
              </div>
              <h3>Transparent Workflows</h3>
              <p>Complete visibility into approval processes, task status, and team performance</p>
            </div>

            <div className="About-benefit-card">
              <div className="About-benefit-icon">
                <BarChart3 size={24} />
              </div>
              <h3>Data-Driven Decisions</h3>
              <p>Comprehensive analytics for informed strategic planning and resource allocation</p>
            </div>

            <div className="About-benefit-card">
              <div className="About-benefit-icon">
                <Shield size={24} />
              </div>
              <h3>Enhanced Compliance</h3>
              <p>Automated tracking of attendance, leaves, policies, and regulatory requirements</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;