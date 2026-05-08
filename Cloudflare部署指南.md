# 微课项目 Cloudflare Pages 部署指南

这份指南用于把当前的新项目单独部署成一个新的网址，同时保证旧项目不受影响。

---

## 一、目标

- 旧项目继续保留原来的页面和原来的网址
- 新项目单独部署为一个新的 Cloudflare Pages 项目
- 新项目的视频放在阿里云 OSS，不占用 Cloudflare Pages 的存储和流量

---

## 二、当前目录结构

新项目已经独立放在这个目录内：

- index.html
- 微课互动答题.html
- functions/api/chat.js
- netlify.toml
- vercel.json
- 微课.mp4

你后续部署时，Cloudflare Pages 只需要指向这个文件夹，不要指向整个旧项目根目录作为站点内容。

---

## 三、部署前先改成阿里云 OSS 视频地址

因为你准备把视频上传到阿里云 OSS，建议部署前先把新项目中的本地视频路径改成 OSS 直链。

当前新项目里有 2 处视频地址需要替换：

1. 页面主视频 source
2. 清晰度切换用的 VIDEO_SOURCES

你可以直接在 微课互动答题.html 中把下面内容：

```html
<source src="./微课.mp4" type="video/mp4" />
```

改成：

```html
<source src="https://你的-bucket.oss-cn-xxx.aliyuncs.com/微课.mp4" type="video/mp4" />
```

再把下面内容：

```javascript
const VIDEO_SOURCES = {
  '720p': './微课.mp4',
  '480p': './微课.mp4'
};
```

改成：

```javascript
const VIDEO_SOURCES = {
  '720p': 'https://你的-bucket.oss-cn-xxx.aliyuncs.com/微课.mp4',
  '480p': 'https://你的-bucket.oss-cn-xxx.aliyuncs.com/微课.mp4'
};
```

如果你后面会提供两个不同清晰度的视频，也可以分别填不同的 OSS 链接。

---

## 四、阿里云 OSS 上传步骤

### 1. 上传视频

登录阿里云 OSS 控制台，新建或进入已有 Bucket，把 微课.mp4 上传进去。

### 2. 设置为可访问

如果只是课程展示，一般需要让这个视频可以被网页直接访问。

常见做法：

- Bucket 读权限设置为公共读
- 或者使用带签名的临时链接

如果你希望页面长期稳定播放，建议使用公共读直链。

### 3. 配置 CORS

为了让 Cloudflare Pages 页面能正常请求 OSS 视频，建议在 OSS 的 CORS 中至少允许：

- 来源 Origin：
  - https://你的新项目.pages.dev
  - 你的自定义域名（如果有）
- 方法 Method：GET, HEAD, OPTIONS
- Allowed Headers：*

如果你还没拿到最终域名，测试阶段也可以先临时放宽为：

- Origin：*
- Method：GET, HEAD, OPTIONS

正式上线后再收紧到你的实际域名。

---

## 五、Cloudflare Pages 新建项目步骤

### 1. 推送代码到 GitHub

先把当前代码推到一个 GitHub 仓库。

如果你想和旧项目共用同一个仓库，也可以，但部署配置时一定要把根目录指到 微课项目。

### 2. 创建新的 Pages 项目

进入 Cloudflare Pages：

- 打开 https://pages.cloudflare.com
- 点击 Create a project
- 连接 GitHub 仓库
- 选择你的仓库

### 3. 关键配置

如果你是从同一个仓库里部署新项目，配置时这样填：

- Framework preset：None
- Build command：留空
- Build output directory：留空
- Root directory：微课项目

这里最关键的是 Root directory 必须填写 微课项目。

这样 Cloudflare 只会把这个新文件夹当成一个独立站点来部署，不会动旧项目。

### 4. 部署

点击 Save and Deploy，等待部署完成。

部署成功后，你会拿到一个新的 Cloudflare Pages 默认域名，例如：

```text
https://your-new-course.pages.dev
```

这就是新项目的新网址。

---

## 六、AI 助手配置

如果你希望新网址上的 AI 助手也正常使用，还要在 Cloudflare Pages 项目里配置环境变量。

进入新 Pages 项目后台，添加环境变量：

- 变量名：DEEPSEEK_API_KEY
- 值：你的 DeepSeek API Key

因为当前项目里已经有 functions/api/chat.js，所以只要 Root directory 指向 微课项目，Pages Functions 会跟着这个新项目一起部署。

---

## 七、为什么旧项目不会被影响

这次我没有改旧项目里的主文件，旧项目目前仍然保持原状：

- 旧入口 index.html 仍然跳转到 栈微课互动答题.html
- 旧页面仍然使用原来的栈微课视频地址
- 旧页面文件检查无报错

你只要在 Cloudflare Pages 里新建一个独立项目，并把 Root directory 指向 微课项目，新项目和旧项目就是两套独立部署。

换句话说：

- 旧网址继续指向旧项目
- 新网址只指向 微课项目

两者不会互相覆盖。

---

## 八、部署后检查清单

新网址部署完成后，检查以下项目：

- 首页能否正常打开
- 视频能否从阿里云 OSS 正常播放
- 时间轴弹题是否正常触发
- AI 助手是否正常回复
- 编程练习是否正常运行
- 笔记是否能正常保存

---

## 九、推荐做法

最稳妥的方式是：

1. 保留旧项目不动
2. 继续把新项目放在 微课项目 目录
3. 视频改为阿里云 OSS 链接
4. Cloudflare Pages 新建一个独立项目
5. Root directory 填 微课项目

这样你就会得到一个新的独立网址，而且不会影响旧站。