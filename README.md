# soccer-sister

## 前言
第一次做微信小程序，想了想做什么：网上有不少足球网站，但是似乎还没有针对女球迷的，所以我就做这个吧:)参考了一些足球网站，配色大多是绿色、蓝色，既然是给女球迷用的，就做个粉色的吧。还有其它想做的功能，以后我再陆续加上去。

## 路由设计及功能
- Index: 首页，展示焦点图、最近的两场比赛预告、新闻列表，其中焦点图、新闻列表没有链接。点击比赛预告可以跳转到比赛页，新闻列表有触底无限加载功能。点击右下角的向上箭头，不但能回到顶部，也能获取到最新的新闻。
- Match: 比赛页，顶部显示这场比赛的概览信息，包括两队名称、队标、比赛类型等。如果是为开始的比赛，显示到开始时间的倒计时。如果是进行中的比赛，则显示当前比赛时间、比分、进球提示音开关，每分钟更新信息，当出现进球时播放提示音。如果是已结束的比赛，则显示比赛的开始时间和比分。下方选项卡分为**赛事数据、相关资讯**，默认显示赛事数据。其中包括球队对比、数据王、近期交战、近期战绩，对于正在进行和已结束的比赛，还有数据对比、技术统计、两队球员，前两项每分钟进行更新。相关资讯里显示本场比赛的相关新闻，可跳转到新闻页。
- News: 新闻页，点击文中图片有放大效果，由于不知道怎么解析 *swf* 格式的视频，所以没有展示。点赞数前三的评论作为精彩评论进行展示，如果评论有回复，能点击回复数到该条评论页，也能跳转到全部评论页。通过底部工具栏，可以将这篇文章分享给朋友，也可以生成分享图片并保存。由于分享信息和小程序码只针对已发布的小程序，这部分功能暂未实现。
- singleCom: 单条评论页，上方展示该条文章评论，下方是该条评论的回复。
- allComs: 全部评论页，上方展示3条精彩评论，下方是全部评论，有无限加载功能。如果评论有回复，能点击回复数到该条评论页。
- matchList: 比赛列表页，可通过底部 *tabBar* 到达此页，展示从昨天开始的10天比赛概览，日期标题的相对日期显示“昨天、今天、明天或星期”，默认定位到第一场未结束的比赛（正在进行或未开始）。对于未开始的比赛，概览中显示比赛开始时间。对于已结束的比赛，还会显示最终比分。如果当前有正在进行的比赛，则显示当前比分和实时比赛时间，顶部会显示进球提示音的开关。每分钟自动更新一次数据，也可以通过点击右下角的更新图标手动刷新，获取数据时图标有旋转效果。当有进球发生时，默认播放提示音，该场比赛显示特殊的背景，直到下次更新数据没有进球时消失。点击每场比赛能跳转到比赛页。

## 心得体会&技术难点
> 制作过程中我主要参考了**懂球帝、pptv、粉色书城**，并加入了自己的理解调整功能。感觉微信小程序的代码是 *vue* 和 *react* 的结合体，可能更偏向于 vue。这是我第一次在一个完整的项目中使用 *less*，确实比 *css* 方便。微信方面提供一些常用的组件和接口，不过有的接口存在 bug，比如：*wx.pageScrollTo* 在执行时，固定定位的回顶部图标会消失，直到页面到达顶部才又显示……相信随着基础库的更新，可以变得更加完善。
