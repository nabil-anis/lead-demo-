export interface RawCsvRow {
  categoryName: string;
  city: string;
  phone: string;
  phoneUnformatted: string;
  title: string;
  url: string;
  whatsapps: string;
  [key: string]: string; // To handle dynamic emails/0, linkedIns/0 etc
}

export interface Company {
  id: string;
  name: string;
  category: string;
  city: string;
  emails: string[];
  phones: string[];
  linkedIns: string[];
  whatsapps: string[];
  website: string;
  googleMapsUrl: string;
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  isStaff: boolean; // True for Recruiters, Caterers, AV, etc. False for Venues/Clients
}

export interface DashboardMetrics {
  totalCompanies: number;
  withEmailCount: number;
  withPhoneCount: number;
  completeness: number; // Percentage
  locationCount: number;
  emailCoverage: number;
  phoneCoverage: number;
  linkedInCoverage: number;
  distribution: {
    emailOnly: number;
    phoneOnly: number;
    linkedInOnly: number;
    multiple: number;
  };
  topCategories: { name: string; value: number }[];
  topLocations: { name: string; value: number }[];
}
