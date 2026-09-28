# AI-VBD Context Snapshot

Version: v0.1
Last Updated: 2026-06-16

---

## 1. SYSTEM OVERVIEW

AI-Virtual-Business_Developer (AI-VBD) is an AI-driven lead generation + outreach automation system.

Pipeline:

lead-acquisition → lead creation → qualification → scraping → AI analysis → outreach

---

## 2. CORE ARCHITECTURE

- Backend: Node.js + TypeScript
- DB: MongoDB, Redis
- Queue: BullMQ-style workers
- Pattern: Event-driven pipeline

---

## 3. CURRENT MODULES

### Lead System

- LeadModel
- AcquisitionBatch
- AcquisitionIdentity
- AcquisitionSearch

### Outreach System (ACTIVE WORK)

- Outreach
- OutreachMessage
- EmailUsage
- (planned) FollowUp
- (planned) OutreachCampaign

### Scraping

 - Scrape website data and look for service a business is offering.
 - SEO performance and lacks
 - Website loading time and responsiveness and CTAs
 - Technologies been used.
 - Scrapiing service has a website profile that generates data out of the scraping result.

### Qualification

- If website url is not available, scraping step is skipped.
- Analysis the lead quality based on scraping results using lead scroing method.
- Avoinf AI-Analysis if a lead doesn't qualify to maintian business cost.

### AI Layer

- AI Analysis service (scraped data → scoring → intent detection)

---

## 4. PIPELINE FLOW (IMPORTANT)

1. Acquisition job runs
2. Leads are created
3. Deduplication via hash
4. Website scraping
5. Lead qualification
   - lead score
6. AI analysis produces:
   - lead score
   - intent level
   - outreach recommendation
7. Outreach worker sends messages

---

## 5. RULES / CONSTRAINTS

- No duplicate models for same domain concept
- All async tasks must go through queue system
- Outreach must depend on AI analysis result
- No direct DB writes from controllers (services only)

---

## 6. CURRENT FOCUS

Feature branch: feature/outreach

Goal:

- Build outreach engine
- Email provider abstraction
- Message templates system
- Retry + tracking system

---

## 7. IMPORTANT FILE MAP

- src/models → DB schemas
- src/services → business logic
- src/queues → background jobs
- src/modules → feature domains

---

## 8. DECISIONS LOG

- Using queue-based architecture instead of direct processing
- AI analysis is async step before outreach
