export type PortfolioServiceType =
  | 'AC Repair'
  | 'AC Installation'
  | 'Heating Repair'
  | 'HVAC Maintenance'
  | 'Emergency AC Repair';

export interface PortfolioItem {
  id: number;
  title: string;
  serviceType: PortfolioServiceType | string;
  description?: string;
  problemDescription?: string;
  solutionDescription?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  wipPhotoUrl?: string;
  location?: string;
  completionDate?: string;
}
