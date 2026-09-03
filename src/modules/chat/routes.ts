import { Router, Request, Response } from 'express';
import { pool } from '../../lib/mysql';

const router = Router();

// GET /api/chat/rooms - Get customer's chat rooms OR all rooms for agents
router.get('/rooms', async (req: Request, res: Response) => {
  try {
    const { customerId, agentId, status } = req.query;

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    let query = 'SELECT cr.*, c.name as customer_name, c.phone as customer_phone FROM chat_rooms cr LEFT JOIN customers c ON cr.customer_id = c.id';
    const params: any[] = [];
    const conditions: string[] = [];

    if (customerId) {
      conditions.push('cr.customer_id = ?');
      params.push(customerId);
    }

    if (agentId) {
      conditions.push('cr.agent_id = ?');
      params.push(agentId);
    }

    if (status) {
      conditions.push('cr.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY cr.updated_at DESC';

    const [rooms]: any = await pool.query(query, params);

    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (error: any) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat rooms', error: error.message });
  }
});

// POST /api/chat/rooms - Create or get existing chat room
router.post('/rooms', async (req: Request, res: Response) => {
  try {
    const { customerId, subject } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'customerId is required' });
    }

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    // Check if active room exists
    const [existingRooms]: any = await pool.query(
      `SELECT * FROM chat_rooms WHERE customer_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`,
      [customerId]
    );

    if (existingRooms.length > 0) {
      return res.json({ success: true, data: existingRooms[0], isNew: false });
    }

    // Create new room
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await pool.query(
      `INSERT INTO chat_rooms (id, customer_id, status, subject, created_at, updated_at)
       VALUES (?, ?, 'ACTIVE', ?, ?, ?)`,
      [roomId, customerId, subject || 'Customer Support', now, now]
    );

    const [newRoom]: any = await pool.query(`SELECT * FROM chat_rooms WHERE id = ?`, [roomId]);

    res.status(201).json({ success: true, data: newRoom[0], isNew: true });
  } catch (error: any) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ success: false, message: 'Failed to create chat room', error: error.message });
  }
});

// GET /api/chat/messages/:roomId - Get chat messages for a room
router.get('/messages/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    const [messages]: any = await pool.query(
      `SELECT * FROM chat_messages 
       WHERE room_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [roomId, parseInt(limit as string), parseInt(offset as string)]
    );

    // Reverse to get chronological order
    const sortedMessages = messages.reverse();

    res.json({ success: true, count: messages.length, data: sortedMessages });
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
});

// POST /api/chat/messages - Save a message (used for persistence)
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const { roomId, senderId, senderType, message, messageType = 'TEXT', attachmentUrl } = req.body;

    if (!roomId || !senderId || !senderType || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'roomId, senderId, senderType, and message are required' 
      });
    }

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await pool.query(
      `INSERT INTO chat_messages (id, room_id, sender_id, sender_type, message, message_type, attachment_url, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [messageId, roomId, senderId, senderType, message, messageType, attachmentUrl || null, now]
    );

    // Update room's last message
    await pool.query(
      `UPDATE chat_rooms SET last_message = ?, last_message_at = ?, updated_at = ? WHERE id = ?`,
      [message.substring(0, 200), now, now, roomId]
    );

    const [savedMessage]: any = await pool.query(`SELECT * FROM chat_messages WHERE id = ?`, [messageId]);

    res.status(201).json({ success: true, data: savedMessage[0] });
  } catch (error: any) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ success: false, message: 'Failed to save message', error: error.message });
  }
});

// PUT /api/chat/messages/:messageId/read - Mark message as read
router.put('/messages/:messageId/read', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    await pool.query(
      `UPDATE chat_messages SET is_read = 1 WHERE id = ?`,
      [messageId]
    );

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark message as read', error: error.message });
  }
});

// PUT /api/chat/rooms/:roomId/close - Close a chat room
router.put('/rooms/:roomId/close', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    await pool.query(
      `UPDATE chat_rooms SET status = 'CLOSED', updated_at = ? WHERE id = ?`,
      [new Date().toISOString(), roomId]
    );

    res.json({ success: true, message: 'Chat room closed successfully' });
  } catch (error: any) {
    console.error('Error closing chat room:', error);
    res.status(500).json({ success: false, message: 'Failed to close chat room', error: error.message });
  }
});

// PUT /api/chat/rooms/:roomId/assign - Assign agent to chat room
router.put('/rooms/:roomId/assign', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { agentId, agentName } = req.body;

    if (!agentId) {
      return res.status(400).json({ success: false, message: 'agentId is required' });
    }

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    await pool.query(
      `UPDATE chat_rooms SET agent_id = ?, updated_at = ? WHERE id = ?`,
      [agentId, new Date().toISOString(), roomId]
    );

    res.json({ success: true, message: 'Agent assigned successfully' });
  } catch (error: any) {
    console.error('Error assigning agent:', error);
    res.status(500).json({ success: false, message: 'Failed to assign agent', error: error.message });
  }
});

export default router;
