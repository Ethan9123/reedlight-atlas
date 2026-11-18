# 苇光手帖 · Reedlight Atlas

FIELD EDITION 03 · v2.0.0

原创离线观鸟轻策略游戏。保留单人挑战，新增同屏双人：两人共用九格湿地中的鸟踪、惊扰与天气，各自管理行动、安静、行囊和手帖。中文 / English、桌面 / 手机布局、撤销、固定路线、本地续局与可选合成音效均已提供。

本次重点阅读了用户提供的五本游戏设计书中的相关章节，将行动预算、共享机会、可预见的选择和明确反馈落实到玩法。阅读范围与设计取舍见 [设计说明](docs/DESIGN_NOTES.md)。没有把书籍原文、图片或第三方游戏资产放进交付包；未读取或复用旧《观鸟俱乐部》。十二种鸟均为虚构创作。

作品已准备好供体验与继续开发；**尚未正式提交 make.fun，也不代表已取得参赛资格**。具体障碍见 [赛事说明](docs/COMPETITION.md)。

## 直接玩

- 打开 `reedlight-offline.html`，或源码中的 `game/index.html`。全部游戏资源本地可用，无需安装依赖。
- 点击「开始观测」，选择「独自观鸟」或「双人同屏」。双人模式分别点苇青、暖砂，为两位玩家选行囊。
- 路线编号支持 0–999999；相同编号会生成相同鸟群、天气和换鸟机会，适合复盘。
- 也可在 Node.js 22.18+ 环境运行 `npm run dev`，访问终端输出的地址。无需 `npm install`。
- 声音默认关闭；点击声音按钮开启原创 WebAudio 合成音效。

浏览器本地存储用于续局和单人最高分；禁用存储仍能玩。不同文件或地址的存档可能分开。可读取旧单人存档并保留原路线天气。

## 核心玩法

六轮，每人每轮三次行动。移动到正交相邻格、静候、记录、循声换鸟均消耗一次行动。静候恢复两点安静，并减少所在栖地一点惊扰；观察消耗一点安静，也会提高该处后续观察难度。循声换鸟会提前显示哪种鸟离开、哪种鸟到来，每处每轮只可换一次。

一天还有两次「凝神」：恢复两点安静、清空所在地惊扰，不耗行动；须在仍有行动时使用。

| 行囊 | 能力 | 个人挑战（+12） |
|---|---|---|
| 轻步漫游者 · 软底行靴 | 每轮首次移动不减安静 | 在四个不同地点记录 |
| 稀羽追寻者 · 长焦镜筒 | 稀有鸟基础安静需求减一 | 三种不同稀有鸟 |
| 羽色收藏家 · 速写手帖 | 每轮首种新鸟额外加二 | 八种不同鸟 |

新鸟种获得卡面分数，重复鸟种仅一分。连续记录来自不同生境的新鸟，可获第二笔 +2、第三笔起 +4 的连章奖励。另有三类生境、三色连章、两种稀有鸟三项公共规则下的个人手帖目标。单人以 45 / 75 / 105 分争取三枚印章。

双人每花一次行动就交棒；凝神不交棒。鸟踪和惊扰共享，一方记录的鸟会从该处消失；换鸟或平复惊扰可能给对方留下机会。每轮交换先手，两人都用完行动才进入下一轮。六轮后比较总分，同分平局。没有淘汰、隐藏信息或限时。

快捷键：方向键选相邻地点，Enter 移动；1 / 2 记录；W 静候；C 换鸟；F 凝神；E 换轮；Z 撤销；J 手帖；? 规则；Esc 关闭弹窗。也可全程使用按钮。

## 开发与交付

```sh
npm test
npm run build
npm run validate
npm run package:source
npm run build
```

build 生成 `dist/` 网站与 `dist/downloads/reedlight-offline.html`。源码打包后再 build，会将 ZIP 放进网站下载区。源码 ZIP 是普通可复现交付包，**不是 AI 会话日志包或官方签名 Git bundle**。

比赛格式的本地输出：

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

未设置变量时默认写入 `/output`；请指定独立输出目录。PowerShell 可先执行 `$env:MAKEFUN_OUTPUT_DIR='out'`，再执行 `node main.ts`。该入口不联网、不提交。

- `game/`：六个独立静态运行文件，无第三方运行时。
- `main.ts` / `vendor/`：确定性输出与未修改的官方数据适配器。
- `screenshots/`：四张真实浏览器原始 JPEG。
- `tests/`：25 项规则与共享状态检查。
- `docs/DESIGN_NOTES.md`：书籍阅读范围、玩法变化与取舍。
- `docs/TESTING.md`、`validation.json`：实际测试、格式数据和测试局限。
- `scripts/solve.mjs` / `duel-playtest.mjs`：开发测试工具，不进入游戏运行时；其输出是游戏操作样例，不是 AI 会话记录。

原创代码 MIT 许可。官方适配器保留独立 MIT 许可，详见 `docs/THIRD_PARTY.md`。

## English

An original offline birdwatching strategy game for solo play or two players sharing one screen. Six rounds, three actions per player per round. Move, wait, record, or follow a new call; manage stillness and shared habitat disturbance. Choose one of three field kits, build habitat chains, and complete personal notebook goals. Players alternate actions and first player each round; birds are shared, notebooks are independent. Highest score wins; equal scores draw.

Open the self-contained HTML or `game/index.html`. No accounts, network services, dependencies, external art, or sampled audio are required. Includes seeded routes, undo, saves, Chinese/English, keyboard controls, responsive layout, and original synthesized sound. This release is playable and tested locally, but is not a registered competition entry.
