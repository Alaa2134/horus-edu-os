import { useState, useRef, useEffect, useCallback } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  mode?: string
}

interface AIStatus {
  ollama_available: boolean
  openai_configured: boolean
  offline_mode: boolean
}

type Mode = 'student' | 'engineer' | 'debug' | 'demo'

const MODES: { id: Mode; label: string; emoji: string; desc: string }[] = [
  { id: 'student',  label: 'Student',  emoji: '🎓', desc: 'Learning-focused explanations' },
  { id: 'engineer', label: 'Engineer', emoji: '⚙️', desc: 'Technical depth' },
  { id: 'debug',    label: 'Debug',    emoji: '🔍', desc: 'Diagnostic assistant' },
  { id: 'demo',     label: 'Demo',     emoji: '🏆', desc: 'Competition showcase' },
]

const SUGGESTIONS = [
  'What is HORUS OS?',
  'What CPU is in this machine?',
  'How do I control GPIO with Python?',
  'Show me an I2C scanner example',
  'What makes HORUS OS special?',
  'How much RAM is being used?',
  'Explain the boot process',
  'How do I use Arduino CLI?',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function uid() {
  return Math.random().toString(36).slice(2)
}

// ── Markdown-lite renderer ────────────────────────────────────────────────────

function renderContent(text: string) {
  const lines = text.split('\n')
  const result: JSX.Element[] = []
  let codeBlock: string[] = []
  let inCode = false
  let key = 0

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        result.push(
          <pre key={key++} style={{
            background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: 8,
            padding: '10px 14px', overflowX: 'auto', margin: '8px 0',
            fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#00d4ff',
            lineHeight: 1.5,
          }}>
            <code>{codeBlock.join('\n')}</code>
          </pre>
        )
        codeBlock = []
        inCode = false
      } else {
        inCode = true
      }
      continue
    }

    if (inCode) {
      codeBlock.push(line)
      continue
    }

    if (line.startsWith('# ')) {
      result.push(<h3 key={key++} style={{ color: '#c9a227', fontFamily: 'Cinzel', fontSize: '1rem', margin: '12px 0 4px' }}>{line.slice(2)}</h3>)
    } else if (line.startsWith('## ')) {
      result.push(<h4 key={key++} style={{ color: '#00d4ff', fontSize: '0.9rem', margin: '10px 0 4px' }}>{line.slice(3)}</h4>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      result.push(
        <div key={key++} style={{ display: 'flex', gap: 8, margin: '2px 0' }}>
          <span style={{ color: '#c9a227' }}>•</span>
          <span>{line.slice(2)}</span>
        </div>
      )
    } else if (line.trim() === '') {
      result.push(<div key={key++} style={{ height: 6 }} />)
    } else {
      // inline code
      const parts = line.split(/(`[^`]+`)/)
      result.push(
        <p key={key++} style={{ margin: '2px 0', lineHeight: 1.6 }}>
          {parts.map((p, i) =>
            p.startsWith('`') && p.endsWith('`')
              ? <code key={i} style={{ background: '#1e1e2e', color: '#c9a227', padding: '1px 5px', borderRadius: 4, fontFamily: 'JetBrains Mono', fontSize: '0.82em' }}>{p.slice(1, -1)}</code>
              : p
          )}
        </p>
      )
    }
  }

  if (codeBlock.length > 0) {
    result.push(
      <pre key={key++} style={{
        background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: 8,
        padding: '10px 14px', overflowX: 'auto', margin: '8px 0',
        fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: '#00d4ff', lineHeight: 1.5,
      }}>
        <code>{codeBlock.join('\n')}</code>
      </pre>
    )
  }

  return <>{result}</>
}

// ── Message Bubble ─────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className="message-in" style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 10,
      alignItems: 'flex-start',
      marginBottom: 16,
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? 'rgba(26,115,232,0.2)' : 'rgba(201,162,39,0.15)',
        border: `1px solid ${isUser ? '#1a73e840' : '#c9a22740'}`,
        fontSize: '0.95rem',
      }}>
        {isUser ? '👤' : '𓂀'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '72%',
        background: isUser
          ? 'linear-gradient(135deg, rgba(26,115,232,0.15), rgba(26,115,232,0.08))'
          : 'rgba(18,18,26,0.95)',
        border: `1px solid ${isUser ? '#1a73e840' : '#1e1e2e'}`,
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        padding: '10px 14px',
        fontSize: '0.875rem',
        lineHeight: 1.6,
        backdropFilter: 'blur(8px)',
      }}>
        <div>{renderContent(msg.content)}</div>
        <div style={{
          marginTop: 6, fontSize: '0.65rem', color: '#8888a840',
          fontFamily: 'JetBrains Mono', textAlign: isUser ? 'left' : 'right',
        }}>
          {formatTime(msg.timestamp)}
          {msg.mode && <span style={{ marginLeft: 6, color: '#c9a22760' }}>[{msg.mode}]</span>}
        </div>
      </div>
    </div>
  )
}

// ── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(201,162,39,0.15)', border: '1px solid #c9a22740', fontSize: '0.95rem',
      }}>𓂀</div>
      <div style={{
        background: 'rgba(18,18,26,0.95)', border: '1px solid #1e1e2e',
        borderRadius: '4px 18px 18px 18px', padding: '12px 16px',
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: 'assistant',
      content: `# مرحباً — Welcome to HORUS AI\n\nI am the built-in intelligence of **HORUS OS**. I know this machine's hardware, the OS architecture, and embedded systems.\n\nAsk me anything — from GPIO control to system diagnostics.\n\n_Select a mode below to customize how I respond._`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('student')
  const [status, setStatus] = useState<AIStatus | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { id: uid(), role: 'user', content, timestamp: new Date(), mode }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, mode, history: [] }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: uid(),
        role: 'assistant',
        content: data.reply || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
        mode: data.mode,
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: uid(),
        role: 'assistant',
        content: '⚠ Could not reach HORUS AI backend. Make sure the service is running on port 8421.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, loading, mode])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const clearChat = () => {
    setMessages([{
      id: uid(),
      role: 'assistant',
      content: 'Chat cleared. How can I help you?',
      timestamp: new Date(),
    }])
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header style={{
        background: '#0d0d14', borderBottom: '1px solid #1e1e2e',
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.5rem' }}>𓂀</span>
          <div>
            <div style={{ fontFamily: 'Cinzel', color: '#c9a227', fontSize: '1rem', letterSpacing: '0.1em' }}>
              HORUS AI
            </div>
            <div style={{ fontSize: '0.65rem', color: '#8888a8', fontFamily: 'JetBrains Mono' }}>
              {status
                ? status.ollama_available
                  ? '● Ollama (offline AI active)'
                  : status.openai_configured
                    ? '● OpenAI fallback'
                    : '○ Offline keyword mode'
                : 'Connecting…'
              }
            </div>
          </div>
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 6 }}>
          {MODES.map(m => (
            <button key={m.id} className={`mode-btn${mode === m.id ? ' active' : ''}`}
              onClick={() => setMode(m.id)} title={m.desc}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        <button onClick={clearChat} style={{
          background: 'none', border: '1px solid #1e1e2e', color: '#8888a8',
          padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem',
          fontFamily: 'JetBrains Mono',
        }}>
          Clear
        </button>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
        {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} style={{ height: 20 }} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 20px 12px',
          flexShrink: 0,
        }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              background: 'rgba(201,162,39,0.08)', border: '1px solid #c9a22730',
              color: '#c9a227', padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
              fontSize: '0.75rem', fontFamily: 'Inter', transition: 'all 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,162,39,0.16)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(201,162,39,0.08)')}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 20px 16px',
        background: '#0d0d14', borderTop: '1px solid #1e1e2e',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: '#12121a', border: '1px solid #1e1e2e',
          borderRadius: 12, padding: '8px 10px 8px 14px',
          transition: 'border-color 0.2s',
        }}
          onFocus={() => {}}
          tabIndex={-1}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask HORUS AI anything about the OS, hardware, or embedded systems…"
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#e8e8f0', fontFamily: 'Inter', fontSize: '0.875rem',
              resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
            }}
            onInput={e => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: input.trim() && !loading ? '#c9a227' : '#1e1e2e',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s', fontSize: '1rem',
            }}
          >
            {loading ? '⋯' : '↑'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 6, fontSize: '0.65rem', color: '#8888a840', fontFamily: 'JetBrains Mono' }}>
          Enter to send · Shift+Enter for new line · Port 8421
        </div>
      </div>
    </div>
  )
}
