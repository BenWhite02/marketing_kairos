// src/pages/enterprise/BrandingPage.tsx

import React from 'react';
import { BrandCustomizer } from '../../components/enterprise/Branding/BrandCustomizer';

export const BrandingPage: React.FC = () => {
  return <BrandCustomizer />;
};

// src/pages/enterprise/SecurityPage.tsx

import React from 'react';
import { SecurityDashboard } from '../../components/enterprise/Security/SecurityDashboard';

export const SecurityPage: React.FC = () => {
  return <SecurityDashboard />;
};

// src/pages/enterprise/CompliancePage.tsx

import React from 'react';
import { ComplianceManager } from '../../components/enterprise/Compliance/ComplianceManager';

export const CompliancePage: React.FC = () => {
  return <ComplianceManager />;
};

// src/pages/enterprise/OrganizationsPage.tsx

import React from 'react';
import { OrganizationManager } from '../../components/enterprise/Organizations/OrganizationManager';

export const OrganizationsPage: React.FC = () => {
  return <OrganizationManager />;
};

// src/pages/enterprise/index.ts

export { BrandingPage } from './BrandingPage';
export { SecurityPage } from './SecurityPage';
export { CompliancePage } from './CompliancePage';
export { OrganizationsPage } from './OrganizationsPage';