# 基于官方 Node.js 20 镜像作为构建阶段
FROM node:20.16-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装编译依赖
RUN apk add --no-cache python3 make g++ git

# 复制依赖文件
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# 安装依赖
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm install; fi

# 复制全部源代码
COPY . .

# 构建 Next.js 应用
RUN npm run build

# 生产环境镜像
FROM node:20.16-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 只复制生产依赖和构建产物
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/.env* ./

EXPOSE 3000

CMD ["npm", "start"] 