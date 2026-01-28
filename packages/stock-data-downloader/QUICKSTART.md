# Quick Start Guide

## 快速开始指南

### 步骤 1: 安装依赖

由于网络连接问题，请按以下方式安装：

```bash
# 进入目录
cd packages/stock-data-downloader

# 激活虚拟环境
source venv/bin/activate

# 方法1: 使用国内镜像源（推荐）
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 方法2: 逐个安装（如果批量安装失败）
pip install yfinance pandas pyarrow tqdm python-dotenv aiohttp asyncio-throttle tenacity aiofiles pydantic pydantic-settings alpha-vantage -i https://pypi.tuna.tsinghua.edu.cn/simple

# 方法3: 使用官方源（如果网络正常）
pip install -r requirements.txt
```

### 步骤 2: 验证安装

```bash
python3 test_simple.py
```

如果看到 "✅ All tests passed!"，说明安装成功。

### 步骤 3: 开始下载

#### 下载少量股票测试（推荐先测试）

```bash
# 下载几个热门股票
python main.py --symbols "AAPL,MSFT,GOOGL" --count 10000
```

#### 下载 S&P 500 股票

```bash
python main.py --source sp500 --count 1000000
```

#### 下载 1000 万条数据（完整下载）

```bash
python main.py --count 10000000
```

### 步骤 4: 查看下载的数据

数据保存在 `data/` 目录中，格式为 Parquet 文件：

```bash
ls -lh data/
```

### 常见问题

#### 1. 网络连接问题

如果 pip 安装失败，尝试：
- 使用国内镜像源（见步骤1）
- 检查网络连接
- 使用 VPN（如果在受限网络环境）

#### 2. 权限问题

```bash
# 使用用户目录安装
pip install --user -r requirements.txt
```

#### 3. Python 版本

确保使用 Python 3.7+：
```bash
python3 --version
```

#### 4. 内存不足

如果下载大量数据时内存不足：
- 减小 `BATCH_SIZE`（在 `.env` 文件中）
- 减小 `MAX_CONCURRENT_REQUESTS`
- 分批下载不同股票列表

### 配置说明

编辑 `.env` 文件可以调整：

```env
# 并发请求数（根据网络情况调整）
MAX_CONCURRENT_REQUESTS=50

# 批次大小
BATCH_SIZE=1000

# 请求速率限制（每秒请求数）
REQUESTS_PER_SECOND=10

# 输出格式（parquet/csv/json）
OUTPUT_FORMAT=parquet
```

### 性能优化建议

1. **提高并发数**：如果网络稳定，可以增加 `MAX_CONCURRENT_REQUESTS` 到 100-200
2. **使用 Parquet 格式**：比 CSV 更高效，占用空间更小
3. **分批下载**：如果下载中断，会自动跳过已下载的股票
4. **监控进度**：查看 `data/download_progress.json` 了解下载进度

### 下一步

- 查看 `README.md` 了解完整功能
- 查看 `example.py` 了解代码示例
- 查看 `INSTALL.md` 了解详细安装说明
