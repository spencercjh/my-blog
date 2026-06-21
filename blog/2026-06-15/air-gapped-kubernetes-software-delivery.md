---
title: Air-Gapped Kubernetes 环境交付软件的那些事
description: 从手搓脚本到成熟工具到踩坑过程
slug: air-gapped-kubernetes-software-delivery
tags: [backend-dev]
hide_table_of_contents: false
authors: [spencercjh]
---

# Air-Gapped Kubernetes 环境交付软件的那些事

这次再来谈一个在 LLM Agent 普及的今天显得很难引人关注的事情。为什么说“再”呢，因为我上次在 4 月写的 blog 是讨论如何生成 API 文档（主要讨论的是 OpenAPI Spec）的。这对很多新项目来说都不是问题，但现实生活里存在非常多的现存项目和框架，问题就这么摆在那里需要有人去解决。这次讨论的问题在商用软件交付过程中也是非常经典—— air-gapped，无公网环境 Kubernetes 服务交付。本文讲述我使用 [Zarf](zarf.dev) 让公司的离线交付走出刀耕火种的困境。

**我之前的工作经历从来没有做过 Air-Gap 环境交付，有相关从业经历的朋友阅读本文还请多多指教。**

<!-- truncate -->

## 刀耕火种时期

HAMi 企业版最早的离线交付就是一份离线包和安装手册。这个方案非常“朴素”和“直观”：安装必需的工具、镜像、Chart 源码、说明文档。由于文档经过测试安装验证，现场工程师严格按照步骤操作，不会有太大的问题。

```bash
tar -xzf offline-installer.tar.gz
cd offline-installer

# 安装工具
bash tools/install-helm.sh
bash tools/install-nerdctl.sh

# 导入所有镜像
bash load-all-images.sh

# 依次安装基础组件
helm install prometheus ...
helm install gpu-operator ...
helm install hami ...
```

这个方案理论上肯定是可以工作的，事实上也确实在几家客户那边完成了交付。这套流程非常“土”，它把交付的复杂度和困难完整传递给了身处现场的工程师或者拿到压缩包的客户。这份大小 10GB 左右的压缩包的 <u> 全生命周期 </u> 都会伴随大大小小的问题。

### 构建

为了获取所有 Helm Charts 需要的容器镜像，前人用 AI 搓了一个脚本。可是我第一次出差去给用户交付就漏了 5、6 个镜像，导致 Helm Chart 安装失败，被迫 Ctrl+C 停下来排障。

> 至于为什么会漏，使用 zarf 都不能完全解决，还得再写点代码才能解决。此处不多展开，后面会详细介绍。

有些客户的机器在传统 HPC、IDC 环境，copy 一次内容需要刻录光盘并传输到可信设备后，再由内网传输到集群主节点。漏几次镜像以后，再碰上 mbp 无法识别 USB 光驱的破事，一下午的时间就浪费了。

### 分发

公司之前有 GCP 的 statup credit，离线包在 GCP 的 VM 上构建完成后，走内网上传到 GCP 对象存储。研发是爽了，身处中国大陆的客户就惨了。由于缺少经验，checksum 文件都没放一个。

### 安装

离线包经历“七七四十九天”抵达客户的集群主节点后，九九八十一难才走过一半。

镜像遗漏的问题前面已经提到，只要客户的 Kubernetes 集群节点数量大于一，我们就会为镜像犯难：我们得把镜像推送到集群使用的镜像仓库，再手动修改所有 charts 的 values，调整镜像仓库名称。

Helm Chart 更麻烦，HAMi 企业版套件包含以下必须组件：

1. HAMi enterprise 版本：kube-scheduler extender deployment 和 vgpu-device-plugin daemonset；
2. NVIDIA gpu-operator：operator deployment，dcgm exporter deployment 和一大堆可选的 Job（安装驱动、安装 container toolkit 等）；
3. 一个前后端 Web 项目，用于管理集群、GPU 设备、GPU 工作负载：前后端服务的 deployment，自有 CRD 和一大堆用于指标采集的 prometheus CRD（ServiceMonitor、Prometheus Rules 等）；
4. kube-prometheus-stack，监控指标实现：Prometheus operator、server、collector 等 deployment 和 monitor CRD；
5. envoy-gateway，expose service：Envoy operator、Envoy Gateway deployment。

很明显，1 依赖 2，3 依赖 4 和 5。Helm Charts 之间的顺序可以写进文档，但写进文档只是把复杂度转嫁给执行人。我们往往容易关注到组件的启动依赖关系，却容易忽略 templates 中的 CRD 依赖关系。5 依赖 Kubernetes Gateway API CRD，3 依赖 4 安装的 monitor CRD。

更让人“忍俊不禁”的，是 3、4 之间的强耦合和不可配置。这导致 Helm Chart release name、namespace 都不能较文档有一点出入，否则前端界面上会看不到显卡指标。

公司研发倒还好，平时就维护这些 charts。可一旦需要客户自己来操作，往往会出现连环错误：

- 解压命令不正确导致解压后的目录多了 macOS 特征文件，影响 Helm Charts 的安装；
- 不知道怎么写自定义的 Charts values，不了解 Helm Chats 多 values 的合并过程：错误修改 Charts 默认 values，错配漏配自定义必填 values 配置；
- 不看文档操作：安装顺序、release name 和 namespace 错误导致程序不能如预期工作；
- ……

### 思考

很多人以为离线交付的难点是 "没外网"。实际上从某种意义上来说，没有镜像加速的国内机器不都是 Air-Gap 环境？！我们在上面完全拉不了 GitHub 上的制品，只能从私有镜像仓库实例拉镜像。因此我觉得“没外网”只是一小部份困难，真正麻烦的不是怎么把镜像带进去，而是怎么把一整套能跑、能升级、能排障的环境稳定交出去。如何提升交付流程效率，降低过程中人工成本，就成了我亟需解决的问题。我们 **交付的不是代码，也不是 Helm Chart，而是一整套能落地的环境。** 目标定了，答案就不会是再补几段脚本或者把安装手册写得更细。**实践证明，无论文档写得多么详实，只要让人（客户或我们自己人）操作上述过程，都还是会出现各种各样的问题。只有把复杂度前置并对用户隐藏，才能真正提升效率，减少交付时对意外状况。**

> 让 LLM agent 来操作估计都不会有那么多事了，然而在 air-gap 环境，想复制点文字出来都不太容易。形形色色的客户也让我发现，看似成熟的 Harness Agent 实际上离广大开发还有一段距离。

## 差点“造轮子”

如果不选 Zarf，我们原本很可能会走向一套自定义 air-gap bundle：

- 外层还是一个 `tar.gz`
- 里面放一个 `registry/` 目录，直接做成 OCI image layout
- 再写一份 `manifest.yaml`，把 tier、Chart、镜像、digest 全部列清楚
- 包里自带 `oras`、`helm`、`zot`、`yq`
- 再配一套带编号为执行顺序的脚本：`00-preflight.sh`、`02-push-registry.sh`、`10-install-prereqs.sh`、`20-install-engine.sh`、`30-install-platform.sh`、`90-upgrade.sh`

这套设计其实已经很完整了。完整到连这些细节都快定完了：

- 包名怎么命名
- `manifest.yaml` 里哪些字段必须带 digest
- `checksums.txt` 怎么做双层校验
- 怎么用 `oras copy` 把整个 `registry/` 推到客户私仓
- 零私仓 demo 场景下怎么用 `zot serve` 顶一个本地 registry
- engine / full 两条安装流怎么编排
- 升级时怎么 backup、怎么 restore、怎么做 verify

这套方案是老板跟 AI 讨论出来的，评审会是大家一起过的。最后执行的人是我，然而我这个人是很不喜欢造轮子的，能有现成的东西 **绝对** 不会自己写一遍（哪怕是 `uber/ratelimit` 这样的组件我都不想自己维护）。

我记得开始干活的头两天，我用 cc + Deepseek V4 照着老板的方案手搓脚本，用 codex + GPT 5.4 探索 Zarf。两条线的差距越来越大，Zarf 线很快完成了基本工作，而手搓脚本方案在脚本的边缘 case 里苦苦挣扎。

后来我发了推特问朋友们，会不会采用 Zarf 这样的产品。结果是，真正干离线交付的人都在忙于手搓脚本，而我们没搞过的都感到很新奇酷炫，想尝鲜。

理性分析：如果手搓脚本，团队要维护的就不只是 HAMi 的离线包，而是一整套自研 air-gap 安装体系。出于“代码就是负债，软件维护成本大于开发成本”的考量，我放弃了老板的方案。我希望一次投入，以后不用再为交付本身写什么代码了，只修使用过程中出现的错误。

找替代方案时，我最核心的需求就是 **不手搓脚本、逻辑编排系统**，即所有操作的出入口、action 与 action 之间的衔接都不需要我来编写代码，而是使用工具自身的能力。展开来说，要求如下：

- 2、3 条命令完成整个套件的安装；
- 需要能够编排 Helm Charts 之间的依赖关系；
- 需要能够支持 pre、post hooks；
- 能够有比手搓更好的方式管理镜像。

接到这个需求之后，接触到 Zarf 之前，我的脑海里一直都有一个声音：helmfile。我在之前的工作经历里用 helmfile 做多集群 charts 交付，接上 GitHub Action workflows 后能够搓出半套 GitOps 系统出来（还差一半是因为不像 Argo CD，集群里没有组件来“调协”）。我想让 AI 写一套武装到牙齿的一系列 helmfile 相关文件，应该能实现上述 4 点吧。

但 GPT 5.5 High 在探索完 Zarf 后说 Zarf 已经能满足所有的需求了，helmfile 终归不适合 air-gap 环境。helmfile “就是”做多集群 charts 交付的，不要“强人所难”。主要体现在我们需要维护很多代码来处理镜像。

## Zarf

> 这里可能需要再用一两句话介绍一下 Zarf 到底是什么。

### 得到了什么

在 HAMi 企业版离线交付包的场景里，我们真正用上 Zarf 的是下面这些 feature。

- 把镜像、Helm Charts、配置文件和必需执行的 hooks 脚本打进一个包。

这个包以 `tar.zst` 为拓展名，用户全程不需要解压它。这样就能实现前文提到的，向用户隐藏技术细节和复杂度的目标。

- 用 Zarf `zarf.yaml`（声明包内容的定义文件，就像 `helmfile.yaml`）中的 `components` 表达安装的组件，用 `zarf package deploy --components` 来决定组件安装顺序。

我会在安装文档中提供一个 `zarf package deploy --components` 的可直接执行的命令，用户可以不关心具体细节，只管复制粘贴。尽管这里用户仍有可能不按要求操作，导致组件安装顺序不如预期。但我相信用户看到陌生的 `tar.zst` 包肯定一脸懵，一定会乖乖打开文档。读文档哪怕读得再不认真，看到简短到只有一行的安装命令，一定会乖乖复制粘贴并执行。`zarf.yaml` 并没有像 `helmfile.yaml` 那样有 `needs` 关键字来表达 Charts 依赖关系，但现在也够用了。

- `zarf.yaml` 中的 `components` 里的 `actions` 原生支持 `onDeploy.before`、`onDeploy.after`、`onDeploy.onFailure`。

这样一来就能把预检、等待、失败诊断写进包本身。这对应我前文提到的核心需求“不手搓脚本、逻辑编排系统”。

- `zarf init` 初始化后， `zarf package deploy` 自动导入镜像、部署 Charts。同样的命令可以做重装，用新的包也能做升级。

用户无感就能完成镜像的内网分发。compoents 中的 charts 安装失败后可以直接重新执行命令完成重装，升级也是如此，心智负担很低。

- 打包时顺带产出 SBOM，后续直接用 Grype 扫描

迟早有客户会有合规方面的审计要求。现在就能“免费”拥有这样的能力可以说超出预期了。

### 交付了什么

交付物大概长这样：

```bash
hami-ai-platform-v0.0.1-airgap-amd64.tar.gz
├── zarf-linux-amd64
├── zarf-init-amd64-v0.76.0.tar.zst
├── hami-ai-platform-v0.0.1-airgap-amd64.tar.zst
├── zarf-package-hami-example-vllm-qwen-amd64-v0.0.1.tar.zst
├── zarf-package-hami-example-gpu-burn-amd64-v0.0.1.tar.zst
├── DEPLOY.md
├── collect-cluster-info.sh
├── collect-hami-license-info.sh
└── override-values-examples/kantaloupe/
```

其中：

- `DEPLOY.md` 是实测可用的操作手册。
- `hami-ai-platform-v0.0.1-airgap-amd64.tar.zst`、`zarf-package-hami-example-vllm-qwen-amd64-v0.0.1.tar.zst`、`zarf-package-hami-example-gpu-burn-amd64-v0.0.1.tar.zst` 。这三个 `tar.zst` 文件是可以使用 `zarf package deploy` 部署的软件包。
- `zarf-init-amd64-v0.76.0.tar.zst` 是 `zarf init ...` 自举需要的包，具体细节后面再谈。
- `collect-cluster-info.sh` 和 `collect-hami-license-info.sh` 是安装前，后需要用户执行的脚本，用于收集必要的信息。
- `override-values-examples` 目录下是一些组件的 values 示例。尽管目标是尽可能少的命令完成安装，但由于有前后端服务，有时候总是需要做些配置。如何让默认配置足够好用，让用户需要配的东西尽可能的少也是我花了很多功夫做的事情。

安装仅需 2 个命令：

```bash
zarf init zarf-init-amd64-v0.76.0.tar.zst --confirm

zarf package deploy hami-ai-platform-v0.0.1-airgap-amd64.tar.zst \
  --components=tools,hami-deploy-scripts,hami,prometheus-crds,prometheus,gpu-operator,envoy-gateway,hami-ai-platform \
  --values=my-overrides.yaml \
  --confirm
```

### 收敛了什么

#### 镜像无感分发和使用

镜像的导入和分发现在是无感的，且完全不需要修改 values 文件。 `zarf init` 会安装一个 admission webhook，它会“拦截”所有的容器镜像，将其转化为私有镜像仓库地址。可以在 namespace 上打上 `zarf.dev/agent=ignore` 在某个 namespace 里禁用上述功能。

我是到后面才知道怎么替换 envoy 数据面 `docker.io/envoyproxy/envoy` 的镜像（CRD `EnvoyProxy` 中的 `spec.provider.kubernetes.envoyDeployment.container.image` ），在此之前都是 zarf 稳稳地接住了我 🤡。

#### hooks 自动执行

旧流程里，"部署之前检查什么、失败之后收什么" 往往是文档里的附加说明。这种说明的最大问题是：只有人记得执行，它才存在。现在，我们利用 `onDeploy.before`、`onDeploy.after`、`onDeploy.onFailure` actions，实现了“部署前预检”，“部署后等待与状态确认”和“失败后诊断信息收集”的自动化。

#### SBOM 是免费的

以前如果想把 SBOM、漏洞扫描报告一起交付，通常理解成另一套流程：先交付软件，再补安全材料。但在这个项目里，我们的目标是让安全材料也成为交付物的一部分（用户需要的话）。

### 踩坑

如果真有那么顺利，也不需要我了，Agent 就完成了上面的工作。

#### 构建时：镜像还是不全

最典型的是 GPU Operator。

一开始我以为，把 Chart 完整 render 一遍，再把里面的 `image:` 字段全抓出来，镜像清单基本就齐了。后来才发现这想法太乐观。问题不只是“有些镜像藏得深”，而是有些镜像从机制上就不是一次静态渲染能找全的。**这也是为什么前人的镜像搜索脚本一直漏镜像的原因。**

我写了一个比较复杂的脚本 `discover-images.sh` 来做镜像检测。最后它被我做成了四层保险，其中前三层是自动发现：

- **Pass 1：`zarf dev inspect manifests`**
  先把 `zarf.yaml` 里的 Helm Chart 完整 render 成最终 YAML，再从 render 结果里提取 `image:` 字段。这一步能抓到大部分已经落成资源对象的显式镜像。
- **Pass 2：`zarf dev find-images`**
  再做一次模板层面的静态扫描，把那些还没在最终 YAML 里展开、但已经出现在 Chart 模板里的镜像引用找出来，然后再写一个 Python 脚本来解析输出。
- **Pass 3：`update-gpu-operator-images.py`**
  这是专门给 GPU Operator 开的小灶。因为它的问题最复杂：有些 driver / gds / gdrcopy 镜像带 OS 后缀，要去 registry 查 tags API 才能枚举；有些组件版本没写在 values 里，而是默认继承 `Chart.appVersion`；还有些开关要按合并后的 values 判断，连内置的 NFD subchart 也要单独拆出来看。靠前两段静态扫描，根本抓不全。这部分工作参考 NVIDIA 的 [gpu-operator#2367](https://github.com/NVIDIA/gpu-operator/pull/2367)。它把完整的镜像清单加入到 GitHub release assets ，但它并不会为过去发布过的 release 补 assets。因此我把其中的代码 copy 了过来，为我使用的非最新 gpu-operator Chart 生成正确的镜像清单。

即便做完这三段，还不是结束。还有一类镜像压根不在 Helm 模板里，而是控制器运行时动态创建的。比如 `envoy-gateway` 的 Envoy 数据面镜像（藏得真的非常深），以及 `hami` 的 `mock-device-plugin`。这类镜像只能手工维护在 `known-images.txt` 里。我也不太想再写代码去做自动检测了，就做个手动名单覆盖这些 cases。

最后 `discover-images.sh --check` 会把结果和 `zarf.yaml`、`known-images.txt` 对起来：

- **MISSING**：脚本发现了，但 `zarf.yaml` 没写
- **MANUAL**：`zarf.yaml` 写了，但脚本自动发现不了
- **KNOWN-MISSING**：`known-images.txt` 列了，但 `zarf.yaml` 里漏了

只要 `MISSING` 非空，检查就直接失败。因为离线交付里最吓人的从来不是镜像多，而是你以为自己已经找全了，结果到了现场才发现包里少了一个。

#### 构建和分发的后续优化

当我解决了‘有没有“的问题后，我发现一个包 17G 实在不利于后续的 bug patch，此外有些用户不需要 vllm 和 gpu-burn 的 example。他们自己能做功能验收和试用。于是我开始尝试做制品优化分层和体积优化。结果一个版本有那么多东西需要上传到对象存储：

| 序号 |                            包                            | 大小 | 内容                                                                                                                                                                                      | 直接交付用户 |
| :--: | :------------------------------------------------------: | :--: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
|  1   |       hami-ai-platform-v0.0.2-airgap-amd64.tar.zst       | 6.0G | HAMi 平台版所有组件（hami, gpu-operator, kube-prometheus-stack, envoy-gateway, hami-ai-platform）                                                                                         | ❌           |
|  2   | zarf-package-hami-example-gpu-burn-amd64-v0.0.1.tar.zst  | 1.5G | gpu burn deployment example                                                                                                                                                               | ❌           |
|  3   | zarf-package-hami-example-vllm-qwen-amd64-v0.0.2.tar.zst | 8.7G | vllm-openai + Qwen3 0.6B（离线版）deployment example                                                                                                                                      | ❌           |
|  4   |             zarf-init-amd64-v0.76.0.tar.zst              | 388M | zarf 自举依赖（docker registery、K3s、git server 等）                                                                                                                                     | ❌           |
|  5   |       hami-ai-platform-v0.0.2-airgap-amd64.tar.gz        | 17G  | 1，2，3，4，DEPLOY-AI-PLATFORM.md，collect-cluster-info.sh，collect-hami-license-info.sh，kantaloupe example values，[zarf binary](https://github.com/zarf-dev/zarf/releases/tag/v0.76.0) | ✅           |
|  6   |       hami-enterprise-v0.0.2-airgap-amd64.tar.zst        | 5.1G | HAMi 企业版所有组件（hami, gpu-operator, kube-prometheus-stack）                                                                                                                          | ❌           |
|  7   |    hami-ai-platform-slim-v0.0.2-airgap-amd64.tar.zst     | 2.9G | HAMi 平台版所有组件（不含 example 和非主流 NVDIA 显卡驱动）                                                                                                                                | ❌           |
|  8   |     hami-enterprise-slim-v0.0.2-airgap-amd64.tar.zst     | 2.0G | HAMi 企业版所有组件（不含 example 和非主流 NVDIA 显卡驱动）                                                                                                                               | ❌           |
|  9   |     hami-ai-platform-slim-v0.0.2-airgap-amd64.tar.gz     | 3.3G | 4，7，DEPLOY-AI-PLATFORM.md，collect-cluster-info.sh，collect-hami-license-info.sh，kantaloupe example values，[zarf binary](https://github.com/zarf-dev/zarf/releases/tag/v0.76.0)       | ✅           |
|  10  |        hami-enterprise-v0.0.2-airgap-amd64.tar.gz        | 16G  | 2，3，4，6，DEPLOY-ENTERPRISE.md，collect-cluster-info.sh，collect-hami-license-info.sh，[zarf binary](https://github.com/zarf-dev/zarf/releases/tag/v0.76.0)                             | ✅           |
|  11  |     hami-enterprise-slim-v0.0.2-airgap-amd64.tar.gz      | 2.4G | 4，8，DEPLOY-ENTERPRISE.md，collect-cluster-info.sh，collect-hami-license-info.sh，[zarf binary](https://github.com/zarf-dev/zarf/releases/tag/v0.76.0)                                   | ✅           |

> 除此之外，还有 2 个版本的软件安装说明 PDF。

我的脑子肯定记不住那么多命令了，引入了一个复杂的 Makefile 来做构建。我希望在制作制品的过程中，尽可能避免浪费时间和带宽。更新版本时，确保 `zarf.yaml` 没有问题后，我只需要修改 Makefile 中的 `VERSION` 变量，然后执行 `make all` 就行了。

构建完了以后，我写了 `upload-to-oss/r2.sh` 来做一键上传，其中包括重试逻辑，确保我睡大觉的时候能把上传任务跑完。

上传完了以后，我还写了 `presign-oss.sh` 来做一键签发。使用 `ossutil` 签出有效时间长达一周的下载链接，用户应该能下完吧。🤡

> 阿里云 OSS web console 上只能 presign 有效时间 9 小时的下载链接，这样的表现差异，是什么用意呢？

#### 部署时：不支持 --values = componetX = valuesX.yaml

```bash
zarf package deploy hami-ai-platform-v0.0.1-airgap-amd64.tar.zst \
  --components=tools,hami-deploy-scripts,hami,prometheus-crds,prometheus,gpu-operator,envoy-gateway,hami-ai-platform \
  --values=my-overrides.yaml \
  --confirm
```

Zarf 现在并不支持为特定 component 指定 values 文件，`--values` 传入的文件是针对所有 components 的。也就是说，如果 2 个 component Charts 都有 `foo.bar` 的配置项，且在 `my-overrides.yaml` 里出现了， 可能会有不符预期的表现。最常见的 case 就是很多 Charts 都会有 `global.XXX` 的配置，如果都需要配，那完全用不了了。

所幸我们没有这样的需求。且我对企业版服务的 Helm Charts 持续迭代的目标是：

- 尽可能不配置；
- 如需配置，只做选择题，不让用户做填空题。

举个例子，如何为网站暴露服务 expose service。我们总结出了以下 3 种选项：

1. Envoy Gateway with NodePort envoyService。看起来比较土，但这对个位数 air-gap 节点的客户来说，这是最简单的方案。
2. Envoy Gateway with LoadBalance service。集群里有 LoadBlanace controller 时用户可以选择这个模式。
3. 禁用 Envoy Gateway，仅保留 Cluster IP service。

### 限制

Zarf 是一个用于 air-gap 环境交付 Kubernetes 软件的项目，它绝对不应该用于其他和 air-gap 无关的场景。对我们来说，Zarf 最合适的是：

- 无公网环境；
- 首次交付，定期可控升级；
- 全量迭代。

**三条必须全部满足才能使用 Zarf，这也就引出了 Zarf 的一些使用限制。**

#### 不能在同一个 namespace 里混用内外部镜像仓库

前文已经介绍，Zarf 使用 admission webhook 的方式悄悄地替换了掌控 namespace 中所有容器的镜像，将他们替换成私有仓库的版本。一个集群中可以做到部分 namespace 绕开 Zarf，正常访问其他镜像仓库，但不能在同一个 namespace 里再使用不同镜像仓库的镜像。

#### 不能再使用原生 Helm 管理同一批资源

一旦让 Zarf 接手了一批组件，再试图用另一套 Helm 流程去管理同一批资源，后面很容易遇到 ownership 冲突、升级打架或者状态难以判断的问题。这不是 Zarf 独有的毛病，是交付边界没划清时几乎必然会出现的结果。用 Zarf 可以很方便地拉起一套组件，但可不能想着装完以后就把 Zarf 一脚踢开，再用回 Helm 做日常迭代。**因此，开发环境哪怕是 air-gap 的，也没法用 Zarf。** 我也是踩了这个坑以后，又在公司了搞了个 helmfile repo。

#### 很难灵活迭代

Zarf 的设计决定了每次我们都在传输全量软件栈。这就注定和“灵活”不沾边。

## 总结

- 文档的字越多越没人看。
- 复杂度前置，以后自己出去交付就轻松。
- 多换位思考。
