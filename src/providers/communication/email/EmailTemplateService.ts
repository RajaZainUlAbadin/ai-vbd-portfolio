import { Lead_website } from '@/modules/lead/dto/website.dto';
import {
  OutreachEmailTemplate,
  OutreachTemplate,
} from './templates/outreach.template';

import { WebsiteLeadEmailTemplate } from './types/email-template.types';
import { ContactLeadTemplate } from './templates/webContactLead.template';
import { ConsultationLeadTemplate } from './templates/webConsultationLead.template';
import { DiagnosticLeadTemplate } from './templates/webDiagnosticLead.template';

export class EmailTemplateService {
  static outreach(data: OutreachEmailTemplate): string {
    return OutreachTemplate(data);
  }

  static fetchTemplate(data: Lead_website): WebsiteLeadEmailTemplate {
    switch (data.source) {
      case 'contact':
        return ContactLeadTemplate(data);

      case 'consultation':
        return ConsultationLeadTemplate(data);

      case 'diagnostic':
        return DiagnosticLeadTemplate(data);

      default:
        throw new Error(`Unsupported website lead source: ${data.source}`);
    }
  }
}

// const templates = {
//   diagnostic: DiagnosticLeadEmailTemplate,

//   consultation: ConsultationLeadEmailTemplate,

//   contact: ContactLeadEmailTemplate,
// };
