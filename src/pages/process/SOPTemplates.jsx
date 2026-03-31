import { useState, useEffect } from 'react'
import { Plus, Rocket, Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { createTask, createChecklist } from '../../lib/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal, { Field } from '../../components/Modal'

const DEFAULT_TEMPLATES = [
  {
    name: '新店開幕 SOP',
    category: '展店',
    description: '開設新分店的標準作業流程，包含場地、裝潢、設備、人員、開幕五大階段',
    steps: [
      { title: '場地簽約與法規確認', role: '主管', priority: '高', description: '確認租約簽訂、營業登記、消防安檢、衛生許可等法規文件' },
      { title: '裝潢工程與設備採購', role: '採購', priority: '高', description: '裝潢設計圖確認、發包施工、POS/監視器/冷藏設備採購安裝' },
      { title: '人員招募與教育訓練', role: 'HR', priority: '中', description: '張貼職缺、面試錄用、排定訓練課程、門市 SOP 教學' },
      { title: '庫存建置與供應商對接', role: '倉管', priority: '中', description: '初始庫存盤點入庫、供應商簽約、首批進貨、陳列上架' },
      { title: '試營運與正式開幕', role: '主管', priority: '高', description: '內部試營運 3 天、修正問題、行銷活動上線、正式開幕' },
    ],
  },
]

export default function SOPTemplates() {
  const [templates, setTemplates] = useState([])
  const [locations, setLocations] = useState([])
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [deployTemplate, setDeployTemplate] = useState(null)
  const [deploying, setDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState(null)
  const [deployForm, setDeployForm] = useState({ location: '', assignees: {} })
  const [newTemplate, setNewTemplate] = useState({ name: '', category: '展店', description: '', steps: [{ title: '', role: '', priority: '中', description: '' }] })

  useEffect(() => {
    Promise.all([
      supabase.from('sop_templates').select('*').order('id'),
      supabase.from('locations').select('*').order('name'),
      supabase.from('employees').select('id, name, department, position').eq('status', '在職').order('name'),
      supabase.from('departments').select('*').order('name'),
    ]).then(async ([t, l, e, d]) => {
      let tpls = t.data || []
      // If no templates in DB, seed defaults
      if (tpls.length === 0) {
        for (const tpl of DEFAULT_TEMPLATES) {
          const { data } = await supabase.from('sop_templates').insert({
            name: tpl.name,
            category: tpl.category,
            description: tpl.description,
            steps: tpl.steps,
          }).select().single()
          if (data) tpls.push(data)
        }
      }
      setTemplates(tpls)
      setLocations(l.data || [])
      setEmployees(e.data || [])
      setDepartments(d.data || [])
      setLoading(false)
    })
  }, [])

  // ── Deploy SOP ──
  const handleDeploy = async () => {
    if (!deployTemplate || !deployForm.location) return
    setDeploying(true)

    const steps = deployTemplate.steps || []
    const loc = deployForm.location
    const results = []

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const assignee = deployForm.assignees[i] || ''
      const { data } = await createTask({
        title: `【${loc}】${step.title}`,
        workflow: deployTemplate.name,
        assignee,
        priority: step.priority || '中',
        status: '未開始',
        due_date: '',
      })
      if (data) results.push(data)
    }

    // Also create a checklist
    await createChecklist({
      name: `${loc} — ${deployTemplate.name}`,
      category: deployTemplate.category || '展店',
      assignee: deployForm.assignees[0] || '',
      items: steps.length,
      completed: 0,
    })

    setDeployResult({ location: loc, count: results.length })
    setDeploying(false)
  }

  const openDeploy = (tpl) => {
    setDeployTemplate(tpl)
    setDeployForm({ location: '', assignees: {} })
    setDeployResult(null)
    setShowDeployModal(true)
  }

  // ── Create Template ──
  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.steps.some(s => s.title)) return
    const validSteps = newTemplate.steps.filter(s => s.title)
    const { data } = await supabase.from('sop_templates').insert({
      name: newTemplate.name,
      category: newTemplate.category,
      description: newTemplate.description,
      steps: validSteps,
    }).select().single()
    if (data) {
      setTemplates(prev => [...prev, data])
      setShowCreateModal(false)
      setNewTemplate({ name: '', category: '展店', description: '', steps: [{ title: '', role: '', priority: '中', description: '' }] })
    }
  }

  const addStep = () => setNewTemplate(t => ({ ...t, steps: [...t.steps, { title: '', role: '', priority: '中', description: '' }] }))
  const updateStep = (i, k, v) => setNewTemplate(t => ({ ...t, steps: t.steps.map((s, j) => j === i ? { ...s, [k]: v } : s) }))
  const removeStep = (i) => setNewTemplate(t => ({ ...t, steps: t.steps.filter((_, j) => j !== i) }))

  const handleDelete = async (id) => {
    if (!confirm('確定刪除此範本？')) return
    await supabase.from('sop_templates').delete().eq('id', id)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const deptBtnStyle = (active) => ({
    padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border-medium)',
    background: active ? 'var(--accent-cyan)' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer', fontSize: 12, fontWeight: 500
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2><span className="header-icon">📑</span> SOP 範本</h2>
            <p>標準作業流程範本，一鍵部署到新分店</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={14} /> 新增範本</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-cyan)', '--card-accent-dim': 'var(--accent-cyan-dim)' }}>
          <div className="stat-card-label">範本數</div>
          <div className="stat-card-value">{templates.length}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-green)', '--card-accent-dim': 'var(--accent-green-dim)' }}>
          <div className="stat-card-label">總步驟數</div>
          <div className="stat-card-value">{templates.reduce((s, t) => s + (t.steps?.length || 0), 0)}</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)', '--card-accent-dim': 'var(--accent-purple-dim)' }}>
          <div className="stat-card-label">分店數</div>
          <div className="stat-card-value">{locations.length}</div>
        </div>
      </div>

      {/* Template List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {templates.map(tpl => {
          const isExpanded = expanded === tpl.id
          const steps = tpl.steps || []
          return (
            <div key={tpl.id} className="card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setExpanded(isExpanded ? null : tpl.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{tpl.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span className="badge badge-cyan" style={{ marginRight: 8 }}>{tpl.category}</span>
                      {steps.length} 個步驟 · {tpl.description || ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-sm btn-primary" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => openDeploy(tpl)}>
                    <Rocket size={13} /> 部署
                  </button>
                  <button className="btn btn-sm btn-secondary" style={{ width: 'auto', padding: '6px 10px', color: 'var(--accent-red)' }} onClick={() => handleDelete(tpl.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 20px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>步驟清單</div>
                  {steps.map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                      background: 'var(--glass-light)', borderRadius: 10, marginBottom: 8,
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--accent-cyan-dim)', border: '1px solid var(--accent-cyan)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan)',
                      }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{step.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{step.description}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <span className="badge badge-purple">{step.role || '未指定'}</span>
                          <span className={`badge ${step.priority === '高' ? 'badge-danger' : step.priority === '中' ? 'badge-warning' : 'badge-info'}`}>
                            {step.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Deploy Modal */}
      {showDeployModal && deployTemplate && (
        <Modal
          title={`🚀 部署「${deployTemplate.name}」`}
          onClose={() => { setShowDeployModal(false); setDeployResult(null) }}
          onSubmit={deployResult ? () => { setShowDeployModal(false); setDeployResult(null) } : handleDeploy}
          submitText={deployResult ? '完成' : deploying ? '部署中...' : '確認部署'}
        >
          {deployResult ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>部署成功！</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                已為 <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{deployResult.location}</span> 建立
                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}> {deployResult.count} </span>
                個任務 + 1 個查核清單
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                員工可在 LINE 傳「任務」查看指派項目
              </div>
            </div>
          ) : (
            <>
              <Field label="部署到哪個分店 *">
                <select className="form-input" style={{ width: '100%' }} value={deployForm.location} onChange={e => setDeployForm(f => ({ ...f, location: e.target.value }))}>
                  <option value="">請選擇分店</option>
                  {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </Field>

              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: '16px 0 10px' }}>指派負責人</div>
              {(deployTemplate.steps || []).map((step, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'center',
                  padding: '10px 12px', borderRadius: 8, background: 'var(--glass-light)',
                  marginBottom: 6, border: '1px solid var(--border-subtle)',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Step {i + 1}：{step.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>預設角色：{step.role || '-'}</div>
                  </div>
                  <select className="form-input" style={{ width: '100%', fontSize: 12 }}
                    value={deployForm.assignees[i] || ''}
                    onChange={e => setDeployForm(f => ({ ...f, assignees: { ...f.assignees, [i]: e.target.value } }))}>
                    <option value="">請選擇</option>
                    {departments.map(d => (
                      <optgroup key={d.id} label={d.name}>
                        {employees.filter(e => e.department === d.name).map(e => (
                          <option key={e.id} value={e.name}>{e.name}｜{e.position}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              ))}
            </>
          )}
        </Modal>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <Modal title="新增 SOP 範本" onClose={() => setShowCreateModal(false)} onSubmit={handleCreateTemplate} submitText="建立範本">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Field label="範本名稱 *">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="例：新店開幕 SOP"
                value={newTemplate.name} onChange={e => setNewTemplate(t => ({ ...t, name: e.target.value }))} />
            </Field>
            <Field label="分類">
              <input className="form-input" type="text" style={{ width: '100%' }} placeholder="展店"
                value={newTemplate.category} onChange={e => setNewTemplate(t => ({ ...t, category: e.target.value }))} />
            </Field>
          </div>
          <Field label="說明">
            <input className="form-input" type="text" style={{ width: '100%' }} placeholder="範本說明"
              value={newTemplate.description} onChange={e => setNewTemplate(t => ({ ...t, description: e.target.value }))} />
          </Field>

          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: '12px 0 8px' }}>步驟</div>
          {newTemplate.steps.map((step, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'end',
              marginBottom: 8, padding: '10px', borderRadius: 8, background: 'var(--glass-light)', border: '1px solid var(--border-subtle)',
            }}>
              <Field label={`Step ${i + 1} 名稱`}>
                <input className="form-input" type="text" style={{ width: '100%' }} placeholder="步驟名稱"
                  value={step.title} onChange={e => updateStep(i, 'title', e.target.value)} />
              </Field>
              <Field label="角色">
                <input className="form-input" type="text" style={{ width: '100%' }} placeholder="主管"
                  value={step.role} onChange={e => updateStep(i, 'role', e.target.value)} />
              </Field>
              <Field label="優先度">
                <select className="form-input" style={{ width: '100%' }} value={step.priority} onChange={e => updateStep(i, 'priority', e.target.value)}>
                  <option>高</option><option>中</option><option>低</option>
                </select>
              </Field>
              <button onClick={() => removeStep(i)} style={{
                background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '8px',
              }}><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={addStep} style={{
            width: '100%', padding: '8px', borderRadius: 8, border: '1px dashed var(--border-medium)',
            background: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
          }}><Plus size={12} /> 新增步驟</button>
        </Modal>
      )}
    </div>
  )
}
