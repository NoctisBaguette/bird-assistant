# 录音识别接入候选 · 未部署

小程序候选可用同一HTTPS入口逐段分析录音；这不代表公网服务已经恢复或BirdNET准确率已经验收。当前0.4.6体验版继续不变。

## 链路和边界

1. 本机读取文件大小与4字节头，超过10 MiB、空文件、OGG或示例在本机停止。
2. GET `/api/v1/audio/readyz`，未部署、502或模型未就绪时不登录、不上传录音。
3. 使用业务服务签发的短期微信会话，POST `/api/v1/audio/analyses`；multipart字段为`audio`和`client_reference`。服务仍做权威字节、格式和1–60秒时长检查。
4. 每份结果绑定原素材引用；取消、离页和迟到响应不能移到另一份素材。照片与声音分别呈现；BirdNET分数不称鉴定正确率，不把一段声音定位成照片内某只鸟。

音频进程新增MobileAuth校验，移动会话只允许`/api/v1/audio/*`，不能读取`/metrics`或旧运维模型路由。既有静态API调用仍可用。新增`/api/v1/audio/models`别名；小程序不会携带长期API密钥。

## 维护者部署条件

先确认当前课程机、运行目录和Caddy配置，勿把历史部署说明当作已核实的活动主机。下列文件只是评阅模板，不自动执行生产安装：

- `bird-audio.service`：复用`bird-business`系统用户，单进程监听`127.0.0.1:8201`，独立`audio.env`，状态目录`/var/lib/bird-audio`。
- `campus-8080.caddy`：仅转发三个音频路径到8201；录音请求体上限11 MiB，图片仍25 MiB，其余请求仍7 MB。
- Python环境需`audio`可选依赖、可用ffmpeg和真实BirdNET2.4模型/标签。将模型放在服务用户可读的`/opt`目录，固定并验证SHA-256；不要将密钥、模型或用户录音提交Git。
- `/etc/bird-assistant/audio.env`应为0600：`BIRD_AUDIO_ENVIRONMENT=production`、`BIRD_AUDIO_ENGINE_BACKEND=birdnet`、`BIRD_AUDIO_ALLOW_ANONYMOUS=false`、服务专用`BIRD_AUDIO_API_KEYS`、模型和标签路径及SHA-256、目录中已有的AviList路径、`BIRD_AUDIO_TEMP_DIR=/var/lib/bird-audio`。
- `BIRD_AUDIO_MOBILE_SIGNING_KEY`须与**当前业务服务**的`BIRD_BUSINESS_MOBILE_SIGNING_KEY`一致。通过服务器受限配置传递，不能填进小程序或文档。保留服务专用API密钥隔离。
- 验证systemd和Caddy配置后由维护者安排重载；本轮未执行。微信需为同一HTTPS入口配置request、uploadFile和downloadFile合法域名；新增上传与保存操作需要后两者。

## 验收

先本机`/readyz`、公网`/api/v1/audio/readyz`；生产必须是真实`ai-edge-litert`且模型/解码运行时均ready。再用真机有效会话测试一段**真实有授权鸟鸣**、静音/人声对照、错误格式、1秒以下/60秒以上/超过10 MiB、取消和切后台。测试录音回听与保存、未映射鸟名和候选资料按钮；双照片加两录音逐项核对，不能混合或覆盖结果。静音控制和mock验证协议，不证明真实鸟鸣识别质量。手机移动网络和校园外均需复测。

公开发帖的音频/视频附件及导出仍在独立队列；这条识别链路不把私人录音自动发布到社区。
