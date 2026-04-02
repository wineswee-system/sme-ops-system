-- ============================================================
--  SME Ops System — Supabase Schema + Seed Data
--  貼到 Supabase Dashboard > SQL Editor > New Query 執行
-- ============================================================

-- Employees
create table employees (
  id serial primary key,
  name text not null,
  name_en text,
  dept text,
  position text,
  store text,
  status text default '在職',
  email text unique,
  phone text,
  join_date date,
  avatar text,
  created_at timestamptz default now()
);

-- Attendance Records
create table attendance_records (
  id serial primary key,
  employee text not null,
  date date not null,
  clock_in time,
  clock_out time,
  status text,
  hours numeric(4,2) default 0,
  created_at timestamptz default now()
);

-- Leave Requests
create table leave_requests (
  id serial primary key,
  employee text not null,
  type text not null,
  start_date date not null,
  end_date date not null,
  days int not null,
  reason text,
  status text default '待審核',
  approver text default '-',
  created_at timestamptz default now()
);

-- Overtime Requests
create table overtime_requests (
  id serial primary key,
  employee text not null,
  date date not null,
  hours numeric(4,1) not null,
  reason text,
  status text default '待審核',
  created_at timestamptz default now()
);

-- Salary Records
create table salary_records (
  id serial primary key,
  employee text not null,
  base_salary int not null,
  allowance int default 0,
  overtime int default 0,
  deductions int default 0,
  insurance int default 0,
  net_salary int not null,
  month text not null,
  created_at timestamptz default now()
);

-- Schedule Data
create table schedule_data (
  id serial primary key,
  employee text not null,
  mon text default '休',
  tue text default '休',
  wed text default '休',
  thu text default '休',
  fri text default '休',
  sat text default '休',
  sun text default '休',
  week_start date
);

-- Holidays
create table holidays (
  id serial primary key,
  name text not null,
  date date not null,
  type text default '國定假日'
);

-- Performance Reviews
create table performance_reviews (
  id serial primary key,
  employee text not null,
  period text,
  overall_score int,
  goals int,
  goals_completed int,
  rating text,
  reviewer text,
  status text default '自評中',
  created_at timestamptz default now()
);

-- Recruitment Jobs
create table recruitment_jobs (
  id serial primary key,
  title text not null,
  dept text,
  location text,
  type text default '全職',
  applicants int default 0,
  status text default '招募中',
  posted date default current_date
);

-- Documents
create table documents (
  id serial primary key,
  name text not null,
  type text,
  size text,
  uploader text,
  upload_date date default current_date,
  category text
);

-- Business Trips
create table business_trips (
  id serial primary key,
  employee text not null,
  destination text,
  start_date date,
  end_date date,
  purpose text,
  budget int,
  status text default '待審核',
  created_at timestamptz default now()
);

-- Expenses
create table expenses (
  id serial primary key,
  employee text not null,
  category text,
  amount int not null,
  date date,
  description text,
  status text default '待審核',
  receipt boolean default false,
  created_at timestamptz default now()
);

-- Workflows
create table workflows (
  id serial primary key,
  name text not null,
  steps int default 1,
  active_instances int default 0,
  status text default '已啟用',
  description text,
  category text
);

-- Tasks
create table tasks (
  id serial primary key,
  title text not null,
  workflow text,
  status text default '未開始',
  assignee text,
  due_date date,
  priority text default '中',
  created_at timestamptz default now()
);

-- Checklists
create table checklists (
  id serial primary key,
  name text not null,
  items int default 0,
  completed int default 0,
  category text,
  assignee text
);

-- Companies
create table companies (
  id serial primary key,
  name text not null,
  short_name text,
  tax_id text,
  address text,
  phone text,
  stores int default 0,
  employees int default 0,
  status text default '營運中'
);

-- Stores
create table stores (
  id serial primary key,
  name text not null,
  company text,
  address text,
  phone text,
  manager text,
  employee_count int default 0,
  status text default '營運中',
  lat double precision,
  lng double precision,
  clock_radius int default 150,
  allowed_wifi text[]
);

-- Departments
create table departments (
  id serial primary key,
  name text not null,
  head text,
  member_count int default 0,
  description text
);

-- Triggers
create table triggers (
  id serial primary key,
  name text not null,
  type text,
  schedule text,
  status text default '啟用',
  last_run timestamptz,
  action text
);

-- Notifications
create table notifications (
  id serial primary key,
  type text,
  title text not null,
  read boolean default false,
  user_id text,
  created_at timestamptz default now()
);

-- Audit Logs
create table audit_logs (
  id serial primary key,
  "user" text not null,
  action text,
  target text,
  time timestamptz default now(),
  ip text
);

-- KPI Data
create table kpi_data (
  id serial primary key,
  metric text not null,
  value numeric,
  target numeric,
  unit text,
  trend text default 'stable'
);

-- Inquiries (demo contact form)
create table inquiries (
  id serial primary key,
  company_name text,
  contact_name text,
  phone text,
  email text,
  company_size text,
  interested_modules text[],
  created_at timestamptz default now()
);

-- ============================================================
--  Seed Data（初始測試資料）
-- ============================================================

insert into employees (name, name_en, dept, position, store, status, email, phone, join_date, avatar) values
('王小明', 'Xiaoming Wang', '研發部', '資深工程師', '台北總部', '在職', 'xiaoming@company.com', '0912-345-678', '2022-03-15', '#3b82f6'),
('林美麗', 'Meili Lin', '行銷部', '行銷經理', '台北總部', '在職', 'meili@company.com', '0923-456-789', '2021-08-20', '#a78bfa'),
('陳大偉', 'Dawei Chen', '業務部', '業務主管', '台中分店', '在職', 'dawei@company.com', '0934-567-890', '2020-11-10', '#f472b6'),
('張雅婷', 'Yating Zhang', '人資部', 'HR 專員', '台北總部', '在職', 'yating@company.com', '0945-678-901', '2023-01-05', '#34d399'),
('黃志強', 'Zhiqiang Huang', '研發部', '前端工程師', '台北總部', '在職', 'zhiqiang@company.com', '0956-789-012', '2023-06-12', '#fb923c'),
('劉佳玲', 'Jialing Liu', '財務部', '財務主管', '台北總部', '在職', 'jialing@company.com', '0967-890-123', '2019-04-20', '#22d3ee'),
('吳建宏', 'Jianhong Wu', '業務部', '業務代表', '高雄分店', '在職', 'jianhong@company.com', '0978-901-234', '2024-02-14', '#f87171'),
('蔡心怡', 'Xinyi Cai', '客服部', '客服組長', '台中分店', '在職', 'xinyi@company.com', '0989-012-345', '2022-09-08', '#fbbf24'),
('鄭宇翔', 'Yuxiang Zheng', '研發部', '後端工程師', '台北總部', '離職', 'yuxiang@company.com', '0990-123-456', '2021-12-01', '#64748b');

insert into attendance_records (employee, date, clock_in, clock_out, status, hours) values
('王小明', '2026-03-27', '08:52', '18:15', '正常', 8.38),
('林美麗', '2026-03-27', '09:05', '18:30', '遲到', 8.42),
('陳大偉', '2026-03-27', '08:30', '17:45', '正常', 8.25),
('張雅婷', '2026-03-27', '08:58', '18:20', '正常', 8.37),
('黃志強', '2026-03-27', '09:15', '19:00', '遲到', 8.75),
('劉佳玲', '2026-03-27', '08:45', '18:00', '正常', 8.25),
('吳建宏', '2026-03-27', null, null, '未打卡', 0),
('蔡心怡', '2026-03-27', '08:55', '18:10', '正常', 8.25);

insert into leave_requests (employee, type, start_date, end_date, days, reason, status, approver) values
('王小明', '特休', '2026-04-01', '2026-04-03', 3, '家庭旅遊', '已核准', '劉佳玲'),
('林美麗', '病假', '2026-03-28', '2026-03-28', 1, '身體不適', '待審核', '-'),
('黃志強', '事假', '2026-04-05', '2026-04-05', 1, '私人事務', '待審核', '-'),
('陳大偉', '特休', '2026-03-20', '2026-03-21', 2, '個人安排', '已核准', '劉佳玲'),
('蔡心怡', '婚假', '2026-05-10', '2026-05-17', 8, '結婚', '已核准', '劉佳玲'),
('吳建宏', '公假', '2026-03-30', '2026-03-30', 1, '教育訓練', '已核准', '陳大偉');

insert into overtime_requests (employee, date, hours, reason, status) values
('王小明', '2026-03-25', 2, '專案趕工', '已核准'),
('黃志強', '2026-03-26', 3, '系統上線準備', '已核准'),
('鄭宇翔', '2026-03-24', 1.5, 'Bug 修復', '待審核');

insert into salary_records (employee, base_salary, allowance, overtime, deductions, insurance, net_salary, month) values
('王小明', 65000, 5000, 3200, 2800, 3500, 66900, '2026-03'),
('林美麗', 72000, 6000, 0, 3200, 4100, 70700, '2026-03'),
('陳大偉', 80000, 8000, 5000, 4000, 4800, 84200, '2026-03'),
('張雅婷', 52000, 3000, 0, 2200, 2800, 50000, '2026-03'),
('黃志強', 58000, 4000, 4800, 2600, 3200, 61000, '2026-03'),
('劉佳玲', 85000, 8000, 0, 4500, 5200, 83300, '2026-03'),
('吳建宏', 45000, 3000, 1600, 1800, 2400, 45400, '2026-03'),
('蔡心怡', 55000, 4000, 0, 2400, 3000, 53600, '2026-03');

insert into holidays (name, date, type) values
('兒童節', '2026-04-04', '國定假日'),
('清明節', '2026-04-05', '國定假日'),
('勞動節', '2026-05-01', '國定假日'),
('端午節', '2026-05-31', '國定假日'),
('公司週年慶', '2026-06-15', '公司假日'),
('中秋節', '2026-10-06', '國定假日');

insert into performance_reviews (employee, period, overall_score, goals, goals_completed, rating, reviewer, status) values
('王小明', '2026 Q1', 92, 4, 3, 'A', '劉佳玲', '已完成'),
('林美麗', '2026 Q1', 88, 5, 4, 'A', '劉佳玲', '已完成'),
('陳大偉', '2026 Q1', 85, 6, 5, 'B+', '劉佳玲', '評核中'),
('張雅婷', '2026 Q1', 78, 4, 3, 'B', '劉佳玲', '評核中'),
('黃志強', '2026 Q1', 95, 3, 3, 'A+', '王小明', '已完成'),
('蔡心怡', '2026 Q1', 82, 5, 3, 'B+', '陳大偉', '自評中'),
('吳建宏', '2026 Q1', 70, 4, 2, 'B-', '陳大偉', '自評中');

insert into recruitment_jobs (title, dept, location, type, applicants, status, posted) values
('資深前端工程師', '研發部', '台北總部', '全職', 12, '招募中', '2026-03-10'),
('行銷專員', '行銷部', '台北總部', '全職', 8, '招募中', '2026-03-15'),
('門市店員', '業務部', '台中分店', '兼職', 25, '已關閉', '2026-02-20'),
('AI 工程師', '研發部', '台北總部', '全職', 5, '招募中', '2026-03-20');

insert into documents (name, type, size, uploader, upload_date, category) values
('員工手冊 v3.2', 'PDF', '2.4 MB', '張雅婷', '2026-03-01', '制度規章'),
('2026 Q1 技術報告', 'PDF', '5.1 MB', '王小明', '2026-03-26', '報告'),
('保密協議範本', 'DOCX', '340 KB', '張雅婷', '2026-01-15', '合約範本'),
('出差報銷表', 'XLSX', '128 KB', '劉佳玲', '2026-02-10', '表單'),
('資安政策 2026', 'PDF', '1.8 MB', '王小明', '2026-03-05', '制度規章');

insert into business_trips (employee, destination, start_date, end_date, purpose, budget, status) values
('陳大偉', '台中', '2026-04-10', '2026-04-12', '客戶拜訪', 15000, '已核准'),
('林美麗', '東京', '2026-05-05', '2026-05-08', '展覽參訪', 80000, '待審核'),
('王小明', '新竹', '2026-03-28', '2026-03-28', '技術交流', 3000, '已核准');

insert into expenses (employee, category, amount, date, description, status, receipt) values
('陳大偉', '交通', 2800, '2026-03-20', '高鐵來回台中', '已核銷', true),
('林美麗', '住宿', 12000, '2026-03-15', '出差住宿兩晚', '待審核', true),
('王小明', '餐飲', 650, '2026-03-26', '客戶會議午餐', '已核銷', true),
('黃志強', '設備', 18500, '2026-03-22', '外接螢幕採購', '已核銷', true);

insert into workflows (name, steps, active_instances, status, description, category) values
('新人到職流程', 8, 2, '已啟用', '涵蓋帳號開通、設備領取、部門報到等流程', '人資'),
('開店流程', 45, 1, '已啟用', '依據 Google Sheet 任務清單產生（共 45 步）', '營運'),
('請假審批流程', 4, 3, '已啟用', '員工提交 → 主管審核 → HR確認 → 通知', '人資'),
('採購申請流程', 6, 0, '已啟用', '需求提出 → 報價比較 → 主管核准 → 採購 → 驗收 → 付款', '財務'),
('績效考核流程', 5, 0, '草稿', '自評 → 主管評核 → 跨部門校準 → 面談 → 結果確認', '人資');

insert into tasks (title, workflow, status, assignee, due_date, priority) values
('Step1', '開店流程', '已完成', 'Zoey', '2026-03-25', '高'),
('Step1', '開店流程', '已完成', 'Snow', '2026-03-25', '高'),
('Step2', '開店流程', '進行中', 'Snow', '2026-03-28', '中'),
('Step2', '開店流程', '未開始', 'Dave', '2026-03-30', '中'),
('Step3', '開店流程', '未開始', '學文', '2026-04-01', '低'),
('Step3', '開店流程', '已完成', 'Aska', '2026-03-26', '高'),
('Step4', '開店流程', '未開始', 'Snow', '2026-04-05', '低'),
('補貨', '日常營運', '未開始', 'Snow', '2026-03-28', '中'),
('testtask1', '測試', '已完成', 'Snow', '2026-03-20', '低');

insert into checklists (name, items, completed, category, assignee) values
('每日開店檢查', 12, 8, '門市營運', '蔡心怡'),
('新進員工報到檢核表', 15, 15, '人資', '張雅婷'),
('月底盤點清單', 20, 5, '庫存', '吳建宏'),
('設備安全檢查', 8, 0, '安全', '陳大偉');

insert into companies (name, short_name, tax_id, address, phone, stores, employees, status) values
('Master AI 科技有限公司', 'Master AI', '12345678', '台北市信義區信義路五段7號', '02-2345-6789', 3, 9, '營運中');

insert into stores (name, company, address, phone, manager, employee_count, status, lat, lng, clock_radius, allowed_wifi) values
('台北總部', 'Master AI', '台北市信義區信義路五段7號', '02-2345-6789', '劉佳玲', 5, '營運中', 25.0330, 121.5654, 150, '{"203.69.180.0/24","61.220.45.0/24"}'),
('台中分店', 'Master AI', '台中市西屯區台灣大道三段99號', '04-2345-6789', '陳大偉', 2, '營運中', 24.1628, 120.6395, 150, '{"114.32.100.0/24"}'),
('高雄分店', 'Master AI', '高雄市前鎮區中華五路789號', '07-2345-6789', '吳建宏', 1, '籌備中', 22.6127, 120.3016, 150, NULL);

insert into departments (name, head, member_count, description) values
('研發部', '王小明', 3, '負責產品研發與技術創新'),
('行銷部', '林美麗', 1, '品牌推廣與市場策略'),
('業務部', '陳大偉', 2, '客戶開發與業務推展'),
('人資部', '張雅婷', 1, '人力資源管理與發展'),
('財務部', '劉佳玲', 1, '財務管理與會計作業'),
('客服部', '蔡心怡', 1, '客戶服務與售後支援');

insert into triggers (name, type, schedule, status, last_run, action) values
('每日考勤統計', '排程', '每日 00:05', '啟用', '2026-03-27 00:05:00+08', '統計前日出勤並發送報表'),
('遲到通知', '事件', '09:10 觸發', '啟用', '2026-03-27 09:10:00+08', '遲到員工發送 LINE 提醒'),
('月薪計算', '排程', '每月 25 號', '啟用', '2026-02-25 02:00:00+08', '計算當月薪資並通知財務'),
('合約到期提醒', '排程', '每週一 09:00', '停用', '2026-03-17 09:00:00+08', '提醒 HR 即將到期合約');

insert into notifications (type, title, read, created_at) values
('leave', '林美麗 提交了病假申請', false, now() - interval '10 minutes'),
('task', '「開店流程 Step2」已逾期', false, now() - interval '30 minutes'),
('system', '系統已自動產生 3 月份考勤報表', true, now() - interval '1 hour'),
('performance', '2026 Q1 績效考核已開始', true, now() - interval '2 hours'),
('hr', '蔡心怡 婚假申請已核准', true, now() - interval '1 day');

insert into audit_logs ("user", action, target, time, ip) values
('劉佳玲', '核准請假', '王小明的特休申請', '2026-03-27 10:30:00+08', '192.168.1.105'),
('張雅婷', '新增員工', '吳建宏', '2026-03-27 09:15:00+08', '192.168.1.102'),
('Snow', '更新流程', '開店流程 Step2 狀態變更', '2026-03-26 16:45:00+08', '192.168.1.110'),
('系統', '自動觸發', '每日考勤統計', '2026-03-27 00:05:00+08', '-'),
('王小明', '上傳文件', '2026 Q1 技術報告.pdf', '2026-03-26 14:20:00+08', '192.168.1.101');

insert into kpi_data (metric, value, target, unit, trend) values
('營收達成率', 94, 100, '%', 'up'),
('客戶滿意度', 4.6, 5.0, '分', 'up'),
('員工留任率', 89, 90, '%', 'stable'),
('專案交付率', 85, 95, '%', 'down'),
('品質合格率', 97, 98, '%', 'up'),
('培訓完成率', 72, 80, '%', 'up');
