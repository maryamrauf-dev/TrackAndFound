import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api, errMsg } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function ClaimChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    let socket;
    (async () => {
      try {
        const [c, m] = await Promise.all([api.get(`/claims/${id}`), api.get(`/claims/${id}/messages`)]);
        setInfo(c.data);
        setMessages(m.data.messages);
        socket = io('/', { auth: { token: localStorage.getItem('fnm_token') } });
        socketRef.current = socket;
        socket.on('connect', () => socket.emit('join', id, (r) => r?.error && setError(r.error)));
        socket.on('message', (msg) => setMessages((prev) => (prev.some((p) => p._id === msg._id) ? prev : [...prev, msg])));
      } catch (e) {
        setError(errMsg(e));
      }
    })();
    return () => socket?.disconnect();
  }, [id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit('message', text, (r) => r?.error && setError(r.error));
    setText('');
  };

  if (error && !info) return <p className="error">{error}</p>;
  if (!info) return <p className="muted">Opening chat...</p>;

  return (
    <section className="narrow wide stack">
      <div className="card pad">
        <h1>Handover with {info.other?.name}</h1>
        <p className="muted">
          {info.item?.title}
          {info.item?.custodyNote ? ` · Where it is now: ${info.item.custodyNote}` : ''}
        </p>
        <p className="hint">Meet somewhere public and busy, like the library or a main gate. Do not share your phone number unless you want to.</p>
      </div>

      <div className="card chat">
        <div className="chat-log" aria-live="polite">
          {messages.length === 0 && <p className="muted">Say hello and suggest a time and place.</p>}
          {messages.map((m) => (
            <div key={m._id} className={`bubble ${m.sender === user.id ? 'me' : 'them'}`}>{m.text}</div>
          ))}
          <div ref={endRef} />
        </div>
        <form className="chat-form" onSubmit={send}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" maxLength={1000} />
          <button className="btn btn-primary">Send</button>
        </form>
      </div>
      {error && <p className="error">{error}</p>}
      <Link to="/activity" className="link">Back to my activity</Link>
    </section>
  );
}
