# AWS SES Email Diagnostics Tests

## Purpose

These fixtures test inbound SES email handling.

Flow:

SNS Notification
|
↓
SES Received Event
|
↓
Webhook Controller
|
↓
OutreachWebhookService.handleSesNotification()
|
↓
EmailParser
|
↓
Generate AI Response

---

# Files

## sample-sns-payload.json

Complete SNS notification payload.

Use this when testing the actual webhook endpoint.

## fake-received-payload.json

Payload after:

```ts
JSON.parse(payload.Message);
```
