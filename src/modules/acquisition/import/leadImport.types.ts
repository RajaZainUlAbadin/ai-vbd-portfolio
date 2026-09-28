export interface LeadImportRow {
  contact?: string;
  company_domain?: string;
  Email?: string;
  summary?: string;
  headline?: string;
  industry?: string;
  jobLevel?: string;
  jobTitle?: string;
  'Last Name'?: string;
  linkedIn?: string;
  location?: string;
  'First Name'?: string;
  department?: string;
  companyName?: string;
  subIndustry?: string;
  companyDomain?: string;
  companyWebsite?: string;
  companyHeadCount?: string;
  companyDescription?: string;
}

export interface LeadImportResult {
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}
