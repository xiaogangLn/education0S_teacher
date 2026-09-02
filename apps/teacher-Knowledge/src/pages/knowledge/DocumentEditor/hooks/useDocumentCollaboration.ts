// hooks/useDocumentCollaboration.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Awareness } from 'y-protocols/awareness';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';

interface CollaborationOptions {
  documentId: string;
  userName: string;
  userColor?: string;
  websocketUrl?: string;
  enableLocalStorage?: boolean;
}

interface CollaborationState {
  isConnected: boolean;
  onlineUsers: Array<{ name: string; color: string; clientId: number }>;
  provider: WebsocketProvider | null;
  doc: Y.Doc | null;
  awareness: Awareness | null;
}

export const useDocumentCollaboration = ({
  documentId,
  userName,
  userColor = '#4f46e5',
  websocketUrl = 'ws://localhost:1234',
  enableLocalStorage = true,
}: CollaborationOptions) => {
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    onlineUsers: [],
    provider: null,
    doc: null,
    awareness: null,
  });

  const yDocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const indexeddbRef = useRef<IndexeddbPersistence | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);

  // 初始化 Yjs 文档和 Provider
  const initCollaboration = useCallback(() => {
    if (!documentId) return null;

    // 创建 Yjs 文档
    const ydoc = new Y.Doc();
    yDocRef.current = ydoc;

    // 创建 Awareness 实例
    const awareness = new Awareness(ydoc);
    awarenessRef.current = awareness;

    // 设置本地用户信息
    awareness.setLocalState({
      user: {
        name: userName,
        color: userColor,
      },
    });

    // 创建 WebSocket 提供者
    const provider = new WebsocketProvider(
      websocketUrl,
      documentId,
      ydoc,
      {
        awareness, // 传入 Awareness 实例
      }
    );
    providerRef.current = provider;

    // 本地存储持久化（可选）
    if (enableLocalStorage) {
      const indexeddb = new IndexeddbPersistence(documentId, ydoc);
      indexeddbRef.current = indexeddb;

      indexeddb.on('synced', () => {
        console.log('Local storage synced');
      });

      indexeddb.on('error', (error: any) => {
        console.error('IndexedDB error:', error);
      });
    }

    // 监听连接状态
    provider.on('status', (event: { status: string }) => {
      setState(prev => ({
        ...prev,
        isConnected: event.status === 'connected',
      }));
    });

    // 监听用户变化
    awareness.on('change', () => {
      const states = awareness.getStates();
      const users: Array<{ name: string; color: string; clientId: number }> = [];
      
      states.forEach((state: any, clientId: number) => {
        if (state.user && clientId !== awareness.clientID) {
          users.push({
            name: state.user.name || '匿名用户',
            color: state.user.color || '#6b7280',
            clientId,
          });
        }
      });

      setState(prev => ({
        ...prev,
        onlineUsers: users,
      }));
    });

    setState(prev => ({
      ...prev,
      doc: ydoc,
      provider,
      awareness,
    }));

    return { ydoc, provider, awareness };
  }, [documentId, websocketUrl, enableLocalStorage, userName, userColor]);

  // 获取协作扩展
  const getCollaborationExtensions = useCallback(() => {
    if (!yDocRef.current || !providerRef.current) return [];

    return [
      Collaboration.configure({
        document: yDocRef.current,
        field: 'content',
        fragment: yDocRef.current.getXmlFragment('content'),
      }),
      CollaborationCursor.configure({
        provider: providerRef.current,
        user: {
          name: userName,
          color: userColor,
        },
      }),
    ];
  }, [userName, userColor]);

  // 获取当前用户信息
  const getCurrentUser = useCallback(() => {
    return {
      name: userName,
      color: userColor,
    };
  }, [userName, userColor]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (indexeddbRef.current) {
      indexeddbRef.current.destroy();
      indexeddbRef.current = null;
    }
    if (awarenessRef.current) {
      // Awareness 会随 YDoc 一起销毁
      awarenessRef.current = null;
    }
    if (yDocRef.current) {
      yDocRef.current.destroy();
      yDocRef.current = null;
    }

    setState({
      isConnected: false,
      onlineUsers: [],
      provider: null,
      doc: null,
      awareness: null,
    });
  }, []);

  // 设置用户状态
  const setUserStatus = useCallback((status: string) => {
    if (awarenessRef.current) {
      const currentState = awarenessRef.current.getLocalState() || {};
      awarenessRef.current.setLocalState({
        ...currentState,
        status,
      });
    }
  }, []);

  // 设置用户光标位置
  const setUserCursor = useCallback((position: any) => {
    if (awarenessRef.current) {
      const currentState = awarenessRef.current.getLocalState() || {};
      awarenessRef.current.setLocalState({
        ...currentState,
        cursor: position,
      });
    }
  }, []);

  // 获取文档统计信息
  const getDocumentStats = useCallback(() => {
    if (!yDocRef.current) return null;

    const ydoc = yDocRef.current;
    const content = ydoc.getXmlFragment('content');
    const textLength = content.toString().length;
    const userCount = state.onlineUsers.length + 1;

    return {
      textLength,
      userCount,
      connected: state.isConnected,
    };
  }, [state.isConnected, state.onlineUsers]);

  useEffect(() => {
    const collab = initCollaboration();

    return () => {
      disconnect();
    };
  }, []);

  return {
    // 状态
    isConnected: state.isConnected,
    onlineUsers: state.onlineUsers,
    doc: state.doc,
    provider: state.provider,
    awareness: state.awareness,
    // 方法
    initCollaboration,
    getCollaborationExtensions,
    getCurrentUser,
    disconnect,
    setUserStatus,
    setUserCursor,
    getDocumentStats,
    // 当前用户
    currentUser: {
      name: userName,
      color: userColor,
    },
  };
};