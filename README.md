<div align="center">

# 班级日志管理系统 · Class Log System

**面向学生、辅导员和管理员的课堂日志流程演示**<br>
*A frontend workflow demo for class logs and approvals*

[![Status](https://img.shields.io/badge/Status-Demo-f0ad4e?style=for-the-badge)](https://github.com/kerntau/class-log-system)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://github.com/kerntau/class-log-system)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://github.com/kerntau/class-log-system)

</div>

---

## 01. 项目定位 // POSITIONING

这是一个基于 Vue 3 + Vite 的前端课堂日志填报与审批演示系统。它用示例 JSON 数据呈现学生、辅导员和管理员的页面与流程，不包含后端鉴权、并发控制或生产级数据库。

## 02. 功能与边界 // SCOPE

| 角色 | 能力 |
| --- | --- |
| 学生 | 填报日志、保存草稿、提交审批、撤回待审批日志、查看进度 |
| 辅导员 | 审批日志、填写意见、查看班级日志 |
| 管理员 | 管理日志和通知、导入/导出 JSON、恢复初始数据 |

页面包括工作台、记录库、日志填报与详情、审批管理、通知、数据文件和个人资料。示例数据只用于演示，不能用于真实学生信息。

## 03. 技术矩阵 // TECHNICAL MATRIX

| 模块 | 技术 | 责任 |
| --- | --- | --- |
| 应用 | Vue 3、Vue Router 4 | 页面、路由和角色守卫 |
| 构建 | Vite 8 | 开发和生产构建 |
| 图标 | Lucide Vue | 导航和状态图标 |
| 数据 | public/data/*.json | 示例日志、通知和用户资料 |
| 样式 | 原生 CSS 变量 | 主题、响应式和状态样式 |

~~~mermaid
flowchart LR
  STUDENT[学生] --> FORM[日志表单]
  FORM --> PENDING[待审批]
  PENDING --> COUNSELOR[辅导员审核]
  COUNSELOR -->|通过| APPROVED[已通过]
  COUNSELOR -->|退回| DRAFT[修改后再提交]
  ADMIN[管理员] --> DATA[JSON 导入 / 导出]
  DATA --> FORM
~~~

## 04. 目录拓扑 // REPOSITORY TOPOLOGY

~~~text
src/
├── components/           # 导航、弹窗、状态、列表等组件
├── data/                 # 权限过滤、模拟数据和存储层
├── layouts/              # 审批、数据文件、日志模块布局
├── router/               # 路由配置与角色守卫
├── views/                # 工作台、日志、审批、通知和数据页面
├── App.vue
├── main.js
└── style.css
public/data/
├── logs.json
├── notifications.json
└── users.json
~~~

## 05. 快速开始 // QUICK START

环境要求：Node.js 18+、npm。

~~~bash
npm install
npm run dev
# 按终端提示打开本地地址
~~~

## 06. 部署与验证 // DEPLOYMENT & VALIDATION

~~~bash
npm run build
npm run preview
~~~

构建产物可部署到静态托管服务。提交前验证角色切换、日志草稿、审批通过/退回、JSON 导入导出和四种响应式断点。仓库没有固定线上演示地址。



## 09. 许可证 // LICENSE

仓库当前未附带 LICENSE 文件。使用或再分发前，请先补充许可证并同步更新本节。
