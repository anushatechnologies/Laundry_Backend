import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { pool } from '../../lib/mysql';

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderType: 'CUSTOMER' | 'AGENT';
  message: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  attachmentUrl?: string;
  createdAt: string;
}

interface TypingStatus {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

// Store active connections
const activeUsers = new Map<string, { socketId: string; userId: string; userType: string; roomId?: string }>();
const roomParticipants = new Map<string, Set<string>>(); // roomId -> Set<socketId>

export function initializeSocket(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // In production, specify your frontend origins
      methods: ['GET', 'POST'],
    },
    path: '/socket.io/',
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', async (data: { userId: string; userType: 'CUSTOMER' | 'AGENT' }) => {
      const { userId, userType } = data;
      
      activeUsers.set(socket.id, { socketId: socket.id, userId, userType });
      
      console.log(`[Socket] User authenticated: ${userId} (${userType})`);
      
      socket.emit('authenticated', { success: true, socketId: socket.id });
    });

    // Handle joining a chat room
    socket.on('join_room', async (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      
      socket.join(roomId);
      
      // Update user's room
      const userData = activeUsers.get(socket.id);
      if (userData) {
        userData.roomId = roomId;
        activeUsers.set(socket.id, userData);
      }

      // Track room participants
      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Set());
      }
      roomParticipants.get(roomId)?.add(socket.id);

      console.log(`[Socket] User ${userId} joined room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user_joined', { userId, roomId });
      
      // Send current participants count
      const participantCount = roomParticipants.get(roomId)?.size || 0;
      io.to(roomId).emit('participants_update', { roomId, count: participantCount });
    });

    // Handle leaving a room
    socket.on('leave_room', (data: { roomId: string }) => {
      const { roomId } = data;
      
      socket.leave(roomId);
      
      const userData = activeUsers.get(socket.id);
      if (userData) {
        userData.roomId = undefined;
      }

      // Remove from room participants
      roomParticipants.get(roomId)?.delete(socket.id);
      
      const participantCount = roomParticipants.get(roomId)?.size || 0;
      io.to(roomId).emit('participants_update', { roomId, count: participantCount });
      
      console.log(`[Socket] User left room ${roomId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data: {
      roomId: string;
      senderId: string;
      senderType: 'CUSTOMER' | 'AGENT';
      message: string;
      messageType?: 'TEXT' | 'IMAGE' | 'FILE';
      attachmentUrl?: string;
    }) => {
      try {
        const { roomId, senderId, senderType, message, messageType = 'TEXT', attachmentUrl } = data;

        // Save message to database
        if (pool) {
          const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const createdAt = new Date().toISOString();

          await pool.query(
            `INSERT INTO chat_messages (id, room_id, sender_id, sender_type, message, message_type, attachment_url, is_read, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
            [messageId, roomId, senderId, senderType, message, messageType, attachmentUrl || null, createdAt]
          );

          // Update room's last message
          await pool.query(
            `UPDATE chat_rooms SET last_message = ?, last_message_at = ?, updated_at = ? WHERE id = ?`,
            [message.substring(0, 200), createdAt, createdAt, roomId]
          );

          const chatMessage: ChatMessage = {
            id: messageId,
            roomId,
            senderId,
            senderType,
            message,
            messageType,
            attachmentUrl,
            createdAt,
          };

          // Broadcast to all clients in the room (including sender for confirmation)
          io.to(roomId).emit('new_message', chatMessage);

          console.log(`[Socket] Message sent in room ${roomId} by ${senderId}`);
        }
      } catch (error) {
        console.error('[Socket] Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { roomId: string; userId: string; userName: string }) => {
      const { roomId, userId, userName } = data;
      
      const typingStatus: TypingStatus = {
        roomId,
        userId,
        userName,
        isTyping: true,
      };

      // Broadcast to others in the room (not sender)
      socket.to(roomId).emit('user_typing', typingStatus);
    });

    socket.on('typing_stop', (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      
      socket.to(roomId).emit('user_typing_stopped', { roomId, userId });
    });

    // Handle message read receipts
    socket.on('mark_read', async (data: { roomId: string; messageId: string }) => {
      try {
        const { roomId, messageId } = data;

        if (pool) {
          await pool.query(`UPDATE chat_messages SET is_read = 1 WHERE id = ?`, [messageId]);

          // Notify room about read status
          io.to(roomId).emit('message_read', { messageId, roomId });
        }
      } catch (error) {
        console.error('[Socket] Error marking message as read:', error);
      }
    });

    // Handle agent status updates
    socket.on('agent_status', (data: { agentId: string; status: 'ONLINE' | 'OFFLINE' | 'AWAY' }) => {
      const { agentId, status } = data;
      
      // Broadcast agent status to all connected clients
      io.emit('agent_status_update', { agentId, status, timestamp: new Date().toISOString() });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const userData = activeUsers.get(socket.id);
      
      if (userData && userData.roomId) {
        // Remove from room participants
        roomParticipants.get(userData.roomId)?.delete(socket.id);
        
        const participantCount = roomParticipants.get(userData.roomId)?.size || 0;
        io.to(userData.roomId).emit('participants_update', { 
          roomId: userData.roomId, 
          count: participantCount 
        });

        // Notify room that user left
        socket.to(userData.roomId).emit('user_left', { userId: userData.userId });
      }

      activeUsers.delete(socket.id);
      
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Socket.IO] WebSocket server initialized');

  return io;
}

export { SocketIOServer };
