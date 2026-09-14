import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { knowledgeService } from '@api/index';

interface CollaborationOptions {
  documentId: string;
  userName: string;
  userColor?: string;
  websocketUrl?: string;
  enableLocalStorage?: boolean;
  persistToApi?: boolean;
}

export const useDocumentCollaboration = ({
  documentId,
  userName,
  userColor = '#4f46e5',
  websocketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:1234',
  enableLocalStorage = true,
  persistToApi = true,
}: CollaborationOptions) => {
  const yDocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const indexeddbRef = useRef<IndexeddbPersistence | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Array<{ name: string; color: string; clientId: number }>>([]);

  useEffect(() => {
    if (!documentId) {
      setReady(true);
      return undefined;
    }

    const ydoc = new Y.Doc();
    yDocRef.current = ydoc;
    let provider: WebsocketProvider;
    try {
      provider = new WebsocketProvider(websocketUrl, documentId, ydoc, { connect: true });
    } catch {
      setReady(true);
      ydoc.destroy();
      yDocRef.current = null;
      return undefined;
    }
    providerRef.current = provider;

    provider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected');
    });

    const awareness = provider.awareness;
    awareness.setLocalStateField('user', { name: userName, color: userColor });
    const syncUsers = () => {
      const users: Array<{ name: string; color: string; clientId: number }> = [];
      awareness.getStates().forEach((state: any, clientId: number) => {
        if (state.user && clientId !== awareness.clientID) {
          users.push({
            name: state.user.name || '匿名用户',
            color: state.user.color || '#6b7280',
            clientId,
          });
        }
      });
      setOnlineUsers(users);
    };
    awareness.on('change', syncUsers);

    if (enableLocalStorage) {
      indexeddbRef.current = new IndexeddbPersistence(documentId, ydoc);
    }

    const persist = () => {
      if (!persistToApi) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const html = ydoc.getXmlFragment('default').toString() || ydoc.getXmlFragment('content').toString();
        knowledgeService.update(documentId, { content: html } as any).catch(() => undefined);
      }, 1500);
    };
    ydoc.on('update', persist);

    setReady(true);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      ydoc.off('update', persist);
      awareness.off('change', syncUsers);
      provider.destroy();
      indexeddbRef.current?.destroy();
      ydoc.destroy();
      yDocRef.current = null;
      providerRef.current = null;
      setReady(false);
      setIsConnected(false);
    };
  }, [documentId, websocketUrl, enableLocalStorage, persistToApi, userName, userColor]);

  const getCollaborationExtensions = useCallback(() => {
    // TipTap v3 不能再挂 v2 的 CollaborationCursor，且不能和 HTML content 同时初始化
    return [];
  }, []);

  return {
    ready,
    isConnected,
    onlineUsers,
    doc: yDocRef.current,
    provider: providerRef.current,
    getCollaborationExtensions,
  };
};
