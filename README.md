# 班级日志管理系统

基于 Vue 3 + Vite 构建的课堂日志填报与审批管理系统，支持学生填报、辅导员审批、管理员数据管理三种角色。

## 功能概览

| 角色 | 功能 |
|------|------|
| 学生 | 填报日志、保存草稿、提交审批、撤回待审批日志、查看审批进度 |
| 辅导员 | 审批日志（通过/退回）、填写审批意见、查看班级日志 |
| 管理员 | 全局数据管理、导入导出 JSON 文件、恢复初始数据 |

### 核心页面

- **工作台** — 角色差异化首页，展示统计卡片、最近动态、待办提醒
- **记录库** — 日志列表，支持状态筛选和关键词搜索
- **日志填报** — 完整表单，含基础信息、课程信息、课堂情况、补充说明
- **日志详情** — 表单内容展示 + 审批流程时间线
- **审批管理** — 待审批日志处理，支持快捷意见模板
- **站内通知** — 审批结果通知、系统公告，支持已读/删除
- **数据文件** — JSON 数据导入导出、文件预览
- **个人资料** — 按角色展示不同字段，学生资料修改自动同步日志

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建**: Vite
- **路由**: Vue Router 4
- **图标**: Lucide Vue
- **数据**: JSON 文件 + 内存缓存（无后端依赖）
- **样式**: 纯 CSS，CSS 变量主题系统

## 项目结构

```
src/
├── components/          # 通用组件（导航、弹窗、状态、列表项、空状态等）
├── data/
│   ├── access.js        # 角色权限与可见数据过滤
│   ├── mockData.js      # 模拟数据（24条日志 + 12条通知）
│   └── storage.js       # 数据存储层（内存缓存 + JSON 文件）
├── layouts/
│   ├── ApprovalLayout.vue  # 审批模块二级布局
│   ├── DataFilesLayout.vue # 数据文件模块二级布局
│   └── LogsLayout.vue      # 日志模块二级布局
├── router/
│   └── index.js         # 路由配置 + 角色守卫
├── views/
│   ├── ApprovalHistoryView.vue # 审批历史
│   ├── ApprovalPendingView.vue # 待审批列表
│   ├── DataLogsView.vue        # 日志数据统计
│   ├── DataManageView.vue      # JSON 数据管理
│   ├── HomeView.vue            # 工作台
│   ├── LogCreateView.vue       # 日志填报
│   ├── LogDetailView.vue       # 日志详情
│   ├── LogListView.vue         # 记录库
│   ├── NotificationView.vue    # 站内通知
│   └── ProfileInfo.vue         # 个人资料
├── App.vue              # 根组件
├── main.js              # 入口
└── style.css            # 全局样式
public/
├── data/
│   ├── logs.json        # 日志数据
│   ├── notifications.json # 通知数据
│   └── users.json       # 当前用户资料
└── logo.jpg             # 网站图标
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 数据说明

系统使用 JSON 文件作为数据源，首次加载后缓存在内存中：

- `public/data/logs.json` — 日志记录（24 条，覆盖 5 名学生、3 个班级、5 种状态）
- `public/data/notifications.json` — 站内通知（12 条，含审批结果和系统公告）

管理员可通过「数据文件」页面导入导出数据，或恢复初始数据。

## 响应式适配

- **桌面端** (> 1024px) — 双栏布局，完整导航
- **平板端** (768px - 1024px) — 单栏布局，导航保持
- **手机端** (≤ 768px) — 汉堡菜单，全宽按钮，触摸友好 (44px)
- **小屏手机** (≤ 480px) — 紧凑间距，卡片纵向排列

## 许可证

MIT
