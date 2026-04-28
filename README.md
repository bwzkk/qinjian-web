# 亲健

基于生成式 AI 的泛亲密关系智能感知与维系平台。

## 核心能力

- 多身份入口：支持账号密码、手机号验证码、资料更新与演示模式入口。
- 关系空间协作：支持创建邀请、加入预览、待确认加入请求、关系类型切换、备注名、关系树能量收集与解绑挽留留痕。
- 多模态记录与简报：围绕文字、图片、语音记录生成日报/周报/月报，并沉淀趋势回看。
- 智能陪伴与干预：提供助手会话、消息预演、双视角叙事对齐、修复协议、实时语音转写与会话记忆。
- 任务与回看：支持系统任务、手动任务、任务优先级、刷新冷却、反馈回收和时间轴归档。
- 多场景扩展：覆盖单人整理、朋友关系、异地关系、里程碑、关系体检、依恋类型、社群提示等延伸功能。
- 隐私与安全：内置隐私中心、删除申请、审计留痕、签名访问、上传归属校验、隐私运行时与基础安全响应头。
- 答辩演示友好：前端内置独立样例数据和 `demo` 入口，适合现场快速演示关系空间、简报、预演、修复、回看与隐私链路。

## 技术栈

- 前端：Vue 3 + Vite + Vue Router + Pinia
- 后端：FastAPI + SQLAlchemy + Pydantic v2
- 数据层：PostgreSQL / SQLite
- 部署：Docker Compose + Nginx

## 默认模型配置

| 功能 | 默认模型 | 服务商 |
| --- | --- | --- |
| 语音识别 | `qwen3-asr-flash` | 阿里云 DashScope |
| 实时语音 | `qwen3-asr-flash-realtime` | 阿里云 DashScope |
| 文本分析 | `Pro/deepseek-ai/DeepSeek-V3.2` | 硅基流动兼容网关 |
| 多模态 | `moonshot/kimi-k2.6` | 硅基流动兼容网关 |

以上默认值与 [docker-compose.yml](docker-compose.yml)、[backend/app/core/config.py](backend/app/core/config.py)、[.env.example](.env.example) 保持一致，并允许通过环境变量覆盖。

## 目录结构

```text
qinjian/
├── backend/                    # FastAPI 后端与测试
├── web-vue3/                   # Vue 3 前端源码
│   ├── src/                    # 页面、组件、状态管理
│   ├── public/                 # 静态资源
│   └── dist/                   # Vite 构建产物（部署时挂载）
├── docker-compose.yml          # 容器编排
├── nginx.conf                  # Nginx 反向代理与安全响应头
├── deploy_current_workspace.py # 一键部署脚本
├── docs/                       # 项目说明、答辩与演示材料
└── .env.example                # Docker / 服务器环境变量模板
```

## 本地开发

### 1. 启动后端

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 2. 启动前端

```bash
cd web-vue3
npm install
npm run dev
```

默认前端开发地址为 `http://localhost:5173`。如需让后端放行该来源，可在 `backend/.env` 中设置：

```bash
FRONTEND_ORIGIN=http://localhost:5173
ADDITIONAL_FRONTEND_ORIGINS=http://localhost:3000
```

### 3. 本地全栈容器运行

```bash
copy .env.example .env
cd web-vue3
npm install
npm run build
cd ..
docker compose up -d --build
```

启动后：

- Web：`http://localhost`
- API 健康检查：`http://localhost/api/health`

## 演示模式

项目内置了独立样例数据，适合答辩或汇报时避开真实账号与实时生成波动。

- 关系管理入口：`http://localhost:5173/demo?route=/pair`
- 关系空间详情：`http://localhost:5173/demo?route=/relationship-space/22222222-2222-4222-8222-222222222222`
- 页面入口：`http://localhost:5173/demo?route=/`
- 指定页面直达：`http://localhost:5173/demo?route=/report`
- 纯静态跳转入口：`http://localhost:5173/preview-demo.html?route=/message-simulation`

演示模式会自动注入 `demo-mode` token 和样例关系数据，可直接展示关系空间、今日安排、简报、双视角、修复协议、时间轴归档与隐私安全页面。

## 工程验证

- 后端当前复核 `python -m pytest --collect-only -q` 可收集 `223` 条自动化测试。
- 前端工具层当前复核 `npm test -- --run` 为 `101/101` 自动化测试通过。
- 前端生产构建当前复核 `npm run build` 通过，可生成正式部署产物。
- 真实环境冒烟与轻量压测脚本保留在 `output/`，最终提交或答辩前可重新运行生成当天证据。

## 环境变量

### 根目录 `.env`

用于 Docker Compose 和服务器部署，模板见 [.env.example](.env.example)。

关键项：

```bash
DB_PASSWORD=your_secure_password_here
SECRET_KEY=your_random_secret_key_min_32_chars
FRONTEND_ORIGIN=https://your-domain.com
AI_API_KEY=
AI_BASE_URL=
SILICONFLOW_API_KEY=
QWEN_ASR_API_KEY=
AI_TEXT_MODEL=Pro/deepseek-ai/DeepSeek-V3.2
AI_MULTIMODAL_MODEL=moonshot/kimi-k2.6
QWEN_ASR_FILE_MODEL=qwen3-asr-flash
QWEN_ASR_REALTIME_MODEL=qwen3-asr-flash-realtime
```

### `backend/.env`

用于本地直接运行 FastAPI，模板见 [backend/.env.example](backend/.env.example)。

## 安全与隐私

- 上传目录默认不对公网直接暴露，Nginx 会拦截 `/uploads/` 直链访问。
- 本地上传文件通过签名访问接口发放短期访问地址，而不是裸露静态资源路径。
- Web 层默认附带基础安全响应头，包括 `X-Content-Type-Options`、`X-Frame-Options` 和 `Content-Security-Policy`。
- 隐私审计、删除申请与留存治理能力已经进入后端接口与测试链路。

## 系统边界

- 系统用于关系记录、风险提示和沟通辅助，不替代真实沟通。
- 模型输出属于辅助建议，不作为医疗、法律或心理诊断依据。
- 遇到高风险冲突、持续升级或安全顾虑时，应优先暂停冲突、联系可信支持网络，并转向专业帮助。

## 部署

部署说明见 [DEPLOY.md](DEPLOY.md)。

## 文档导航

- 接口总表、关键业务时序、测试覆盖矩阵、隐私安全说明见 [docs/项目说明与验证.md](docs/项目说明与验证.md)。
- 比赛提交用的主设计和开发文档底稿见 [docs/设计和开发文档-当前实现版.md](docs/设计和开发文档-当前实现版.md)。
- 10 分钟答辩 PPT 大纲与逐页讲稿见 [docs/10分钟答辩PPT大纲与讲稿.md](docs/10分钟答辩PPT大纲与讲稿.md)。
- 10 分钟功能演示脚本见 [docs/10分钟演示脚本.md](docs/10分钟演示脚本.md)。
- 可直接放进 PPT 的验证页文案见 [docs/PPT验证页-当前证据版.md](docs/PPT验证页-当前证据版.md)。
- 数据库 E-R 图说明见 [docs/database-er.md](docs/database-er.md)，图片产物见 [output/qinjian-database-er.png](output/qinjian-database-er.png)。
- 数据资产构成、演示样例与测试数据边界见 [docs/数据集说明.md](docs/数据集说明.md)。
- 当前仓库对应的本地开发、容器部署和环境变量配置见 [docs/安装配置说明.md](docs/安装配置说明.md)。
- 面向演示与日常使用流程的操作说明见 [docs/用户手册.md](docs/用户手册.md)。
