import { useState, useEffect, useCallback } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

interface FirewallRule { number: number; to: string; action: string; from_: string }
interface FirewallStatus { enabled: boolean; status: string; rules: FirewallRule[]; default_incoming: string; default_outgoing: string }
interface NetworkConnection { proto: string; local_address: string; foreign_address: string; state: string; pid?: number; program?: string }
interface SSHConfig { port: number; permit_root_login: string; password_authentication: string; pubkey_authentication: string; max_auth_tries: number; hardened: boolean }
interface DiskEncryption { device: string; name: string; type: string; encrypted: boolean }
interface LogEntry { timestamp: string; level: string; unit: string; message: string }
interface SecurityCheck { id: string; label: string; pass: boolean; weight: number }
interface SecurityScore { score: number; max_score: number; grade: string; checks: SecurityCheck[] }
interface Port { address: string; program: string; state: string }

// ── Fetch helper ─────────────────────────────────────────────────────────────

async function api<T>(path: string, opts?: RequestInit): Promise<T | null> {
  try {
    const r = await fetch(`/api${path}`, opts)
    if (!r.ok) return null
    return r.json()
  } catch {
    return null
  }
}

// ── Interval hook ─────────────────────────────────────────────────────────────

function useInterval(cb: () => void, ms: number) {
  useEffect(() => {
    cb()
    const id = setInterval(cb, ms)
    return () => clearInterval(id)
  }, [])
}

// ── Grade badge ───────────────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: '#00ff88', B: '#00d4ff', C: '#c9a227', D: '#ff8c00', F: '#ff4444',
  }
  return (
    <span style={{
      fontSize: '3rem', fontFamily: 'JetBrains Mono', fontWeight: 700,
      color: colors[grade] || '#888',
      textShadow: `0 0 20px ${colors[grade] || '#888'}80`,
    }}>
      {grade}
    </span>
  )
}

// ── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 85 ? '#00ff88' : pct >= 60 ? '#c9a227' : '#ff4444'

  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#1e1e2e" strokeWidth="10" />
      <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '65px 65px' }}
      />
      <text x="65" y="58" textAnchor="middle" fill={color} fontSize="22" fontFamily="JetBrains Mono" fontWeight="700">{pct}</text>
      <text x="65" y="75" textAnchor="middle" fill="#8888a8" fontSize="11" fontFamily="Inter">/ 100</text>
    </svg>
  )
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV = [
  { id: 'overview', icon: '🛡', label: 'Overview' },
  { id: 'firewall', icon: '🔥', label: 'Firewall' },
  { id: 'connections', icon: '🌐', label: 'Connections' },
  { id: 'ssh', icon: '🔑', label: 'SSH Config' },
  { id: 'encryption', icon: '🔒', label: 'Encryption' },
  { id: 'ports', icon: '📡', label: 'Open Ports' },
  { id: 'logs', icon: '📋', label: 'System Logs' },
]

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState('overview')
  const [firewall, setFirewall] = useState<FirewallStatus | null>(null)
  const [connections, setConnections] = useState<NetworkConnection[]>([])
  const [ssh, setSsh] = useState<SSHConfig | null>(null)
  const [encryption, setEncryption] = useState<DiskEncryption[]>([])
  const [score, setScore] = useState<SecurityScore | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [ports, setPorts] = useState<Port[]>([])
  const [newRule, setNewRule] = useState('')
  const [ruleMsg, setRuleMsg] = useState('')

  const refresh = useCallback(async () => {
    const [fw, conn, s, enc, sc, pt] = await Promise.all([
      api<FirewallStatus>('/firewall'),
      api<NetworkConnection[]>('/connections'),
      api<SSHConfig>('/ssh'),
      api<DiskEncryption[]>('/encryption'),
      api<SecurityScore>('/score'),
      api<{ ports: Port[] }>('/ports'),
    ])
    if (fw) setFirewall(fw)
    if (conn) setConnections(conn)
    if (s) setSsh(s)
    if (enc) setEncryption(enc)
    if (sc) setScore(sc)
    if (pt) setPorts(pt.ports)
  }, [])

  useInterval(refresh, 8000)

  const fetchLogs = useCallback(async () => {
    const data = await api<LogEntry[]>('/logs?lines=100')
    if (data) setLogs(data)
  }, [])

  useEffect(() => {
    if (page === 'logs') fetchLogs()
  }, [page])

  const toggleFirewall = async () => {
    if (!firewall) return
    if (firewall.enabled) {
      await api('/firewall/disable', { method: 'POST' })
    } else {
      await api('/firewall/enable', { method: 'POST' })
    }
    const fw = await api<FirewallStatus>('/firewall')
    if (fw) setFirewall(fw)
  }

  const addRule = async () => {
    if (!newRule.trim()) return
    const res = await api<{ ok: boolean; output?: string; detail?: string }>(
      '/firewall/rule',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rule: newRule }) }
    )
    setRuleMsg(res?.ok ? '✓ Rule added' : (res as any)?.detail || 'Error')
    setNewRule('')
    const fw = await api<FirewallStatus>('/firewall')
    if (fw) setFirewall(fw)
  }

  const deleteRule = async (n: number) => {
    await api(`/firewall/rule/${n}`, { method: 'DELETE' })
    const fw = await api<FirewallStatus>('/firewall')
    if (fw) setFirewall(fw)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#0d0d14', borderRight: '1px solid #1e1e2e',
                      display: 'flex', flexDirection: 'column', padding: '24px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '1.8rem' }}>🛡</div>
          <div style={{ fontFamily: 'Cinzel', color: '#c9a227', fontSize: '0.85rem',
                        letterSpacing: '0.12em', marginTop: 4 }}>
            SECURITY CENTER
          </div>
        </div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            className={`nav-item${page === n.id ? ' active' : ''}`}
            style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
            <span>{n.icon}</span> {n.label}
          </button>
        ))}
        {score && (
          <div style={{ marginTop: 'auto', textAlign: 'center', padding: '16px 0' }}>
            <ScoreRing score={score.score} max={score.max_score} />
            <div style={{ color: '#8888a8', fontSize: '0.7rem', marginTop: 4 }}>Security Score</div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Cinzel', color: '#c9a227', fontSize: '1.4rem',
                       margin: 0, letterSpacing: '0.1em' }}>
            {NAV.find(n => n.id === page)?.icon} {NAV.find(n => n.id === page)?.label}
          </h1>
          <div style={{ color: '#8888a8', fontSize: '0.75rem', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
            HORUS OS — Security Center v1.0.0
          </div>
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        {page === 'overview' && score && (
          <div>
            {/* Score + Grade */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ScoreRing score={score.score} max={score.max_score} />
                <div>
                  <div style={{ color: '#8888a8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Security Score</div>
                  <GradeBadge grade={score.grade} />
                </div>
              </div>
              <div className={score.checks.find(c => c.id === 'firewall')?.pass ? 'glass-card-green' : 'glass-card-red'}
                   style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🔥</div>
                <div style={{ color: '#8888a8', fontSize: '0.7rem' }}>Firewall</div>
                <div style={{ color: firewall?.enabled ? '#00ff88' : '#ff4444', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                  {firewall?.enabled ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              <div className={ssh?.hardened ? 'glass-card-green' : 'glass-card'}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🔑</div>
                <div style={{ color: '#8888a8', fontSize: '0.7rem' }}>SSH</div>
                <div style={{ color: ssh?.hardened ? '#00ff88' : '#c9a227', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                  {ssh ? (ssh.hardened ? 'HARDENED' : 'DEFAULT') : '—'}
                </div>
              </div>
              <div className="glass-card">
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🌐</div>
                <div style={{ color: '#8888a8', fontSize: '0.7rem' }}>Connections</div>
                <div style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '1.4rem' }}>
                  {connections.length}
                </div>
              </div>
            </div>

            {/* Security Checks */}
            <div className="glass-card">
              <div className="sec-title" style={{ marginBottom: 16 }}>Security Audit</div>
              {score.checks.map(c => (
                <div key={c.id} className="data-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{c.pass ? '✅' : '❌'}</span>
                    <span style={{ fontFamily: 'Inter', fontSize: '0.85rem' }}>{c.label}</span>
                  </span>
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={c.pass ? 'badge-pass' : 'badge-fail'}>{c.pass ? 'PASS' : 'FAIL'}</span>
                    <span style={{ color: '#8888a8', fontSize: '0.7rem', fontFamily: 'JetBrains Mono' }}>
                      {c.weight}pts
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FIREWALL ─────────────────────────────────────────────────────── */}
        {page === 'firewall' && firewall && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="sec-title">UFW Firewall</div>
                <div style={{ color: '#8888a8', fontSize: '0.8rem', marginTop: 4 }}>
                  Default: Incoming <span className="badge-fail">{firewall.default_incoming}</span>{' '}
                  Outgoing <span className="badge-pass">{firewall.default_outgoing}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={firewall.enabled ? 'badge-pass' : 'badge-fail'}>
                  {firewall.enabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <button className={firewall.enabled ? 'btn-red' : 'btn-green'} onClick={toggleFirewall}>
                  {firewall.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Add Rule */}
            <div className="glass-card">
              <div className="sec-title" style={{ marginBottom: 12 }}>Add Rule</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={newRule} onChange={e => setNewRule(e.target.value)}
                  placeholder="e.g. allow 80/tcp  or  deny from 192.168.1.100"
                  style={{ flex: 1, background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: 8,
                           color: '#e8e8f0', padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}
                />
                <button className="btn-gold" onClick={addRule}>Add</button>
              </div>
              {ruleMsg && <div style={{ marginTop: 8, color: ruleMsg.startsWith('✓') ? '#00ff88' : '#ff4444',
                                        fontSize: '0.8rem', fontFamily: 'JetBrains Mono' }}>{ruleMsg}</div>}
            </div>

            {/* Rules Table */}
            <div className="glass-card">
              <div className="sec-title" style={{ marginBottom: 12 }}>
                Active Rules <span className="badge-warn" style={{ marginLeft: 8 }}>{firewall.rules.length}</span>
              </div>
              {firewall.rules.length === 0
                ? <div style={{ color: '#8888a8', fontSize: '0.85rem' }}>No rules configured.</div>
                : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ color: '#8888a8', borderBottom: '1px solid #1e1e2e' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>#</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>To</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Action</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>From</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {firewall.rules.map(r => (
                        <tr key={r.number} style={{ borderBottom: '1px solid #1e1e2e20' }}>
                          <td style={{ padding: '6px 8px', color: '#8888a8' }}>{r.number}</td>
                          <td style={{ padding: '6px 8px', color: '#00d4ff' }}>{r.to}</td>
                          <td style={{ padding: '6px 8px' }}>
                            <span className={r.action === 'ALLOW' ? 'badge-pass' : 'badge-fail'}>{r.action}</span>
                          </td>
                          <td style={{ padding: '6px 8px', color: '#e8e8f0' }}>{r.from_}</td>
                          <td style={{ padding: '6px 8px' }}>
                            <button onClick={() => deleteRule(r.number)}
                              style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.75rem' }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
            </div>
          </div>
        )}

        {/* ── CONNECTIONS ──────────────────────────────────────────────────── */}
        {page === 'connections' && (
          <div className="glass-card">
            <div className="sec-title" style={{ marginBottom: 16 }}>
              Active Connections <span className="badge-warn" style={{ marginLeft: 8 }}>{connections.length}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ color: '#8888a8', borderBottom: '1px solid #1e1e2e' }}>
                  {['Proto','Local','Foreign','State','Program'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {connections.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1e1e2e20' }}>
                    <td style={{ padding: '5px 8px', color: '#c9a227' }}>{c.proto}</td>
                    <td style={{ padding: '5px 8px', color: '#00d4ff' }}>{c.local_address}</td>
                    <td style={{ padding: '5px 8px', color: '#e8e8f0' }}>{c.foreign_address}</td>
                    <td style={{ padding: '5px 8px' }}>
                      <span className={c.state === 'ESTAB' ? 'badge-pass' : 'badge-warn'}>{c.state}</span>
                    </td>
                    <td style={{ padding: '5px 8px', color: '#8888a8' }}>{c.program || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── SSH ──────────────────────────────────────────────────────────── */}
        {page === 'ssh' && ssh && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div className={ssh.hardened ? 'glass-card-green' : 'glass-card'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="sec-title">SSH Configuration</div>
                <span className={ssh.hardened ? 'badge-pass' : 'badge-warn'}>
                  {ssh.hardened ? '🔒 HARDENED' : '⚠ DEFAULT'}
                </span>
              </div>
            </div>
            <div className="glass-card">
              {[
                { label: 'SSH Port', value: ssh.port.toString(), good: ssh.port !== 22 },
                { label: 'Root Login', value: ssh.permit_root_login, good: ssh.permit_root_login === 'no' },
                { label: 'Password Auth', value: ssh.password_authentication, good: ssh.password_authentication === 'no' },
                { label: 'PubKey Auth', value: ssh.pubkey_authentication, good: ssh.pubkey_authentication === 'yes' },
                { label: 'Max Auth Tries', value: ssh.max_auth_tries.toString(), good: ssh.max_auth_tries <= 3 },
              ].map(row => (
                <div key={row.label} className="data-row">
                  <span style={{ color: '#8888a8', fontSize: '0.85rem' }}>{row.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', color: row.good ? '#00ff88' : '#ff8c00', fontSize: '0.85rem' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            {!ssh.hardened && (
              <div className="glass-card-red" style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
                <div style={{ color: '#ff4444', fontFamily: 'JetBrains Mono', marginBottom: 8 }}>⚠ Recommendations</div>
                {ssh.permit_root_login !== 'no' && <div>• Set <code style={{color:'#c9a227'}}>PermitRootLogin no</code> in /etc/ssh/sshd_config</div>}
                {ssh.password_authentication !== 'no' && <div>• Set <code style={{color:'#c9a227'}}>PasswordAuthentication no</code> (use SSH keys)</div>}
                {ssh.port === 22 && <div>• Change default port 22 to a higher port (e.g. 2222)</div>}
                {ssh.max_auth_tries > 3 && <div>• Set <code style={{color:'#c9a227'}}>MaxAuthTries 3</code></div>}
              </div>
            )}
          </div>
        )}

        {/* ── ENCRYPTION ───────────────────────────────────────────────────── */}
        {page === 'encryption' && (
          <div className="glass-card">
            <div className="sec-title" style={{ marginBottom: 16 }}>Disk Encryption (LUKS)</div>
            {encryption.length === 0
              ? <div style={{ color: '#8888a8' }}>No block devices found.</div>
              : encryption.map((d, i) => (
                <div key={i} className="data-row">
                  <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ color: '#c9a227', fontFamily: 'JetBrains Mono' }}>{d.device}</span>
                    <span className="badge-warn">{d.type}</span>
                  </span>
                  <span className={d.encrypted ? 'badge-pass' : 'badge-fail'}>
                    {d.encrypted ? '🔒 ENCRYPTED' : '🔓 UNENCRYPTED'}
                  </span>
                </div>
              ))
            }
          </div>
        )}

        {/* ── PORTS ─────────────────────────────────────────────────────────── */}
        {page === 'ports' && (
          <div className="glass-card">
            <div className="sec-title" style={{ marginBottom: 16 }}>
              Listening Ports <span className="badge-warn" style={{ marginLeft: 8 }}>{ports.length}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ color: '#8888a8', borderBottom: '1px solid #1e1e2e' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>Address</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>Program</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>State</th>
                </tr>
              </thead>
              <tbody>
                {ports.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1e1e2e20' }}>
                    <td style={{ padding: '5px 8px', color: '#00d4ff' }}>{p.address}</td>
                    <td style={{ padding: '5px 8px', color: '#e8e8f0' }}>{p.program || '—'}</td>
                    <td style={{ padding: '5px 8px' }}>
                      <span className="badge-pass">{p.state}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── LOGS ─────────────────────────────────────────────────────────── */}
        {page === 'logs' && (
          <div className="glass-card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e2e',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="sec-title">System Journal</div>
              <button className="btn-gold" onClick={fetchLogs}>Refresh</button>
            </div>
            <div style={{ maxHeight: '65vh', overflowY: 'auto', padding: '8px 0' }}>
              {logs.map((l, i) => (
                <div key={i} className="log-line"
                  style={{ color: l.level === 'error' ? '#ff4444' : l.level === 'warning' ? '#ff8c00' : '#8888a8' }}>
                  <span style={{ color: '#c9a22780', marginRight: 8 }}>{l.timestamp}</span>
                  <span style={{ color: '#00d4ff', marginRight: 8 }}>[{l.unit}]</span>
                  <span style={{ color: l.level === 'error' ? '#ff4444' : l.level === 'warning' ? '#ff8c00' : '#e8e8f0' }}>
                    {l.message}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <div style={{ padding: 20, color: '#8888a8', textAlign: 'center', fontSize: '0.85rem' }}>
                  Click Refresh to load logs
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
