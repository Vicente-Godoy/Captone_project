import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, doc, setDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebaseClient";
import { getAuth } from "firebase/auth";
import { getMatches } from "../../services/interactions";
import "./Chat.css";

function Chat() {
  const { id } = useParams(); // conversationId = matchId
  const navigate = useNavigate();
  const auth = getAuth();
  const me = auth.currentUser;

  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [conversations, setConversations] = useState([]); // listado con lastMessage
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [other, setOther] = useState(null); // para header de conversación
  const bottomRef = useRef(null);

  // Cargar lista de matches si no hay conversación seleccionada
  useEffect(() => {
    if (id) return;
    (async () => {
      try {
        setLoadingMatches(true);
        const ms = await getMatches();
        setMatches(ms || []);
      } finally {
        setLoadingMatches(false);
      }
    })();
  }, [id]);

  // Suscripción a conversaciones del usuario (para mostrar último mensaje en lista)
  useEffect(() => {
    if (id) return; // solo en lista
    if (!me) return;
    const q = query(collection(db, "conversations"), where("participants", "array-contains", me.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const ta = a.lastMessageAt?.toMillis?.() || 0;
        const tb = b.lastMessageAt?.toMillis?.() || 0;
        return tb - ta;
      });
      setConversations(list);
    });
    return () => unsub();
  }, [id, me]);

  // Suscribirse a mensajes si hay conversación
  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "conversations", id, "messages"),
      orderBy("sentAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [id]);

  // Obtener info del otro usuario para el header cuando hay conversación
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // buscar en matches el que coincide con id
        const ms = matches.length ? matches : await getMatches();
        const m = (ms || []).find((x) => x.id === id);
        if (m && m.other) setOther(m.other);
      } catch {}
    })();
  }, [id, matches]);

  // Auto-scroll al final cuando cambian mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canSend = useMemo(() => !!(me && id && text.trim()), [me, id, text]);

  const send = async () => {
    if (!canSend) return;
    const payload = {
      fromUid: me.uid,
      text: text.trim(),
      sentAt: serverTimestamp(),
    };
    await addDoc(collection(db, "conversations", id, "messages"), payload);
    // Denormalizar último mensaje en conversation
    await setDoc(doc(db, "conversations", id), {
      lastMessageText: payload.text,
      lastMessageAt: serverTimestamp(),
    }, { merge: true });
    setText("");
  };

  if (!id) {
    return (
      <div className="chat-list">
        <header className="chat-header">
          <div className="brand">S</div>
          <div className="title">CHATS</div>
        </header>
        {loadingMatches && <div className="info">Cargando...</div>}
        {!loadingMatches && conversations.length === 0 && (
          <div className="info">Aún no tienes conversaciones.</div>
        )}
        <div className="chat-items">
          {conversations.map((c) => {
            const m = matches.find((x) => x.id === c.id);
            const otherUser = m?.other;
            return (
              <div key={c.id} className="chat-item" onClick={() => navigate(`/chat/${c.id}`)}>
                <img className="avatar" src={otherUser?.fotoUrl || "https://via.placeholder.com/56"} alt={otherUser?.nombre || 'usuario'} />
                <div className="chat-item-body">
                  <div className="name">{otherUser?.nombre || 'Usuario'}</div>
                  <div className="preview">{c.lastMessageText || 'Sin mensajes aún'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-view">
      <header className="chat-topbar">
        <button className="back" onClick={() => navigate("/chat")}>‹</button>
        <img className="avatar" src={other?.fotoUrl || "https://via.placeholder.com/32"} alt={other?.nombre || 'usuario'} />
        <div className="name">{other?.nombre || 'Chat'}</div>
      </header>

      <div className="chat-messages">
        {messages.map((m) => {
          const mine = m.fromUid === me?.uid;
          return (
            <div key={m.id} className={`bubble ${mine ? 'right' : 'left'}`}>
              {!mine && <img className="bubble-avatar" src={other?.fotoUrl || "https://via.placeholder.com/28"} alt="avatar" />}
              <div className="text">{m.text}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <button className="plus">+</button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje"
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        />
        <button className="send" disabled={!canSend} onClick={send}>➤</button>
      </div>
    </div>
  );
}
export default Chat;
