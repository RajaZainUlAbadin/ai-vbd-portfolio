# AI-VBD — AI Business Development Platform

A portfolio representation of the backend architecture behind an AI-driven business development platform for automated lead acquisition, web scraping, AI analysis, outreach, and conversation management.

> **Portfolio Note**
>
> This repository is a sanitized representation of the production system. Private infrastructure, credentials, customer data, proprietary prompts, business rules, and selected production implementations have been removed or simplified. The repository focuses on demonstrating architecture, engineering practices, integrations, and system design.

## Architecture

The platform is organized around independent modules and asynchronous processing pipelines:

```text
Lead Acquisition
      ↓
Normalization
      ↓
AI Analysis
      ↓
Qualification
      ↓
Outreach
      ↓
Follow-ups
      ↓
Conversations
```

Background processing is handled through queue-based workers, while provider abstractions isolate external services from the core application.

## Technology

* Node.js
* TypeScript
* Express
* MongoDB
* Redis
* BullMQ
* Playwright
* OpenAI
* AWS SES
* WhatsApp integrations
* Docker

## Key Engineering Areas

* Modular backend architecture
* Controllers, services, repositories and DTOs
* Provider abstraction for external services
* Asynchronous job processing with BullMQ
* Redis-backed queues and workers
* Browser automation and resilient web scraping
* AI provider integration
* Email and messaging integrations
* Conversation and outreach domain modeling
* Retry and failure handling
* Structured API responses and validation
* Operational logging and error handling

## Portfolio Scope

The public repository intentionally preserves the overall architecture and representative implementation while excluding:

* Production credentials and environment configuration
* Real customer/lead data
* Private infrastructure details
* Proprietary AI prompts and business rules
* Sensitive production workflows

The goal is to provide a technical view of how the platform was structured and engineered without exposing private production logic.
