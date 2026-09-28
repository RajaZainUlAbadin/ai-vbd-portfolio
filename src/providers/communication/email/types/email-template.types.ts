import { Lead_website } from '@/modules/lead/dto/website.dto';

export interface WebsiteLeadEmailTemplate {
  subject: string;
  html: string;
}
export type WebsiteLeadTemplateData = Lead_website;
