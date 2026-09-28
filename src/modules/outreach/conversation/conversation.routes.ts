import { Router } from 'express';
import { ConversationController } from './conversation.controller';

const router = Router();

// GET /api/conversations
router.get('/', ConversationController.getConversationList);
// GET /api/conversations/:id
// POST /api/conversations/:id/messages
router.get('/:id', ConversationController.getConversationDetails);

// POST /api/conversations/:id/gen-ai-reply
// router.post('/:id/ai-reply', OutreachController.__);

// POST /api/conversations/:id/send-message
// router.post('/:id/send-message', OutreachController.__);

export default router;
