# 部署指南

## 服务器信息

- 服务器 IP：`129.212.216.187`
- 域名：`https://qinjian.tech`
- 项目目录：`/root/qinjian`
- 登录用户：`root`

## 快速部署

### 方式一：部署脚本

```bash
python deploy_current_workspace.py --host 129.212.216.187 --username root --password <密码>
```

如果本机已经配置可用的 root SSH key，也可以省略 `--password`；否则请先设置 `QJ_REMOTE_PASSWORD`，或通过 `--key-file` 指定私钥：

```bash
python deploy_current_workspace.py --host 129.212.216.187 --username root --key-file ~/.ssh/opencode_deploy
```

脚本会自动：

1. 在本地构建 `web-vue3/dist`
2. 打包 `backend`、`web-vue3`、`docker-compose.yml`、`nginx.conf`
3. 上传到服务器 `/root/qinjian`
4. 校正 `FRONTEND_ORIGIN`
5. 执行 `docker compose up -d --build`

### 方式二：手动部署

```bash
cd web-vue3
npm install
npm run build

ssh root@129.212.216.187
cd /root/qinjian
git pull
docker compose up -d --build
docker compose ps
```

## 服务器环境变量

在 `/root/qinjian/.env` 中至少配置：

```bash
DB_PASSWORD=<数据库密码>
SECRET_KEY=<32位以上随机字符串>
FRONTEND_ORIGIN=https://qinjian.tech

AI_API_KEY=
AI_BASE_URL=
SILICONFLOW_API_KEY=<可选，兼容旧配置>
QWEN_ASR_API_KEY=<DashScope API Key>

ASR_PROVIDER=qwen3
REALTIME_ASR_PROVIDER=qwen3
REALTIME_ASR_MAX_SESSION_SECONDS=60
QWEN_ASR_FILE_MODEL=qwen3-asr-flash
QWEN_ASR_REALTIME_MODEL=qwen3-asr-flash-realtime
AI_TEXT_MODEL=Pro/deepseek-ai/DeepSeek-V3.2
AI_MULTIMODAL_MODEL=moonshot/kimi-k2.6
PHONE_CODE_STORE=redis
REDIS_URL=redis://redis:6379/0
```

推荐直接从根目录 [.env.example](.env.example) 复制生成。

## 服务管理

```bash
cd /root/qinjian

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f
docker compose logs -f backend

# 重启
docker compose restart
docker compose restart backend

# 停止
docker compose down
```

## 健康检查

```bash
curl https://qinjian.tech/api/health
```

浏览器检查：

- Web：`https://qinjian.tech`
- 健康检查：`https://qinjian.tech/api/health`

## 说明

- Web 服务挂载的是 `web-vue3/dist`，不再使用旧 `web/` 静态前端目录。
- 上传文件默认不通过 Nginx 直接公开，需走后端签名访问接口。
- 生产环境默认通过 Compose 内置 Redis 承接验证码和登录风控，不再允许回退到内存。
- 如需本地调试 API 文档，可通过后端环境变量开启 `ENABLE_API_DOCS=true`。
- 接口总表、关键业务时序和测试覆盖矩阵见 [docs/项目说明与验证.md](docs/项目说明与验证.md)。
