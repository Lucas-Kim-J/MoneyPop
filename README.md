# MoneyPop

MoneyPop 是一个以本地记账为核心的前端应用，提供预算管理、收支记录与 AI 智能解析/点评功能（DeepSeek）。

## 功能概览

- 收入/支出记录与分类
- 预算与结余统计
- AI 智能识别记账文本
- AI 点评消费状态
- 订阅提醒（30 天周期，确认后入账）
- 本地数据存储（localStorage）

## 技术栈

- Vite + React
- Tailwind CSS
- GitHub Pages 部署（GitHub Actions）

## 本地运行

1) 安装依赖
```bash
npm install
```

2) 配置环境变量（不要提交）
在根目录创建 `.env`：
```env
VITE_DEEPSEEK_API_KEY=你的token
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com
```

3) 启动开发环境
```bash
npm run dev
```

## 构建与预览

```bash
npm run build
npm run preview
```

## GitHub Pages 部署

- `vite.config.js` 已设置 `base: '/MoneyPop/'`
- 推送到 `main` 会自动触发 `.github/workflows/deploy.yml`
- 需要在仓库 Settings → Secrets → Actions 中配置：
  - `VITE_DEEPSEEK_API_KEY`

## 数据存储说明

- 数据保存在浏览器 localStorage（key: `transactions`, `budget`, `subscriptions`, `subscriptionPending`）
- 本地与线上（GitHub Pages）数据不会互通

## 安全提示

当前前端直连 DeepSeek API，密钥会暴露在浏览器中，仅适合本地/内测。正式部署建议增加代理层。

## 目录结构

```
.
├── .github/workflows/deploy.yml
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src
    ├── App.jsx
    ├── components
    │   ├── BackgroundDecor.jsx
    │   ├── BudgetOverview.jsx
    │   ├── Button.jsx
    │   ├── Card.jsx
    │   ├── HeaderSnapshot.jsx
    │   ├── IncomeVault.jsx
    │   ├── QuickEntryCard.jsx
    │   ├── SubscriptionPanel.jsx
    │   ├── TransactionForm.jsx
    │   ├── TransactionList.jsx
    │   └── UndoSticker.jsx
    ├── data
    │   └── categories.jsx
    ├── main.jsx
    ├── services
    │   └── deepseek.js
    └── index.css
```
