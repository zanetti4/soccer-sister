# soccer-sister

## 前言
第一次做微信小程序，想了想做什么：网上有不少足球网站，但是似乎还没有针对女球迷的，所以我就做这个吧:)参考了一些足球网站，配色大多是绿色、蓝色，既然是给女球迷用的，就做个粉色的吧。还有其它想做的功能，以后我再陆续加上去。

## 技术栈
``` bash
wxss-cli: 小程序中将less编译成wxss。
```

## 路由设计及功能
- Index: 首页，展示焦点图、最近的两场比赛预告、新闻列表，其中焦点图、新闻列表没有链接。点击比赛预告可以跳转到比赛页，新闻列表有触底无限加载功能。点击右下角的向上箭头，不但能回到顶部，也能获取到最新的新闻和比赛预告。
- Match: 比赛页，顶部显示这场比赛的概览信息，包括两队名称、队标、比赛类型等。如果是为开始的比赛，显示到开始时间的倒计时。如果是进行中的比赛，则显示当前比赛时间、比分、进球提示音开关，每分钟更新信息，当出现进球时播放提示音。如果是已结束的比赛，则显示比赛的开始时间和比分。下方选项卡分为**赛事数据、相关资讯**，默认显示赛事数据。其中包括球队对比、数据王、近期交战、近期战绩，对于正在进行和已结束的比赛，还有数据对比、技术统计、两队球员，前两项每分钟进行更新。相关资讯里显示本场比赛的相关新闻，可跳转到新闻页。
- News: 新闻页，点击文中图片有放大效果，由于不知道怎么解析 *swf* 格式的视频，所以没有展示。点赞数前三的评论作为精彩评论进行展示，如果评论有回复，能点击回复数到该条评论页，也能跳转到全部评论页。通过底部工具栏，可以将这篇文章分享给朋友，也可以生成分享图片并保存。由于分享信息和小程序码只针对已发布的小程序，这部分功能暂未实现。
- singleCom: 单条评论页，上方展示该条文章评论，下方是该条评论的回复。
- allComs: 全部评论页，上方展示3条精彩评论，下方是全部评论，有无限加载功能。如果评论有回复，能点击回复数到该条评论页。
- matchList: 比赛列表页，可通过底部 *tabBar* 到达此页，展示从昨天开始的10天比赛概览，日期标题的相对日期显示“昨天、今天、明天或星期”，默认定位到第一场未结束的比赛（正在进行或未开始）。对于未开始的比赛，概览中显示比赛开始时间。对于已结束的比赛，还会显示最终比分。如果当前有正在进行的比赛，则显示当前比分和实时比赛时间，顶部会显示进球提示音的开关。每分钟自动更新一次数据，也可以通过点击右下角的更新图标手动刷新，获取数据时图标有旋转效果。当有进球发生时，默认播放提示音，该场比赛显示特殊的背景，直到下次更新数据没有进球时消失。当关闭提示音时，离开该页面，则不再自动更新数据。点击每场比赛能跳转到比赛页。

## 项目结构
``` bash
│  project.config.json // 项目配置文件
│  README.md // 开发文档
│  tree.txt // 项目结构
│  
├─client // 客户端代码
│  │  app.js // 注册小程序
│  │  app.json // 小程序配置
│  │  app.less // 小程序样式，可应用于每一个页面
│  │  app.wxss
│  │  package-lock.json // 用以记录当前状态下实际安装的各个npm package的具体来源和版本号
│  │  package.json // 定义了项目所需要的各种模块,以及项目的配置信息
│  │  
│  ├─common // 通用文件
│  │  ├─components // 组件
│  │  │  ├─comImg // 评论图片
│  │  │  │      comImg.js
│  │  │  │      comImg.json // 注册组件
│  │  │  │      comImg.less // 组件样式
│  │  │  │      comImg.wxml // 组件结构
│  │  │  │      comImg.wxss
│  │  │  │      
│  │  │  ├─onlyRefresh // tabBar:比赛 刷新
│  │  │  │      onlyRefresh.js
│  │  │  │      onlyRefresh.json
│  │  │  │      onlyRefresh.less
│  │  │  │      onlyRefresh.wxml
│  │  │  │      onlyRefresh.wxss
│  │  │  │      
│  │  │  ├─radar // 雷达图
│  │  │  │      .DS_Store
│  │  │  │      radar.js
│  │  │  │      radar.less
│  │  │  │      radar.wxml
│  │  │  │      radar.wxss
│  │  │  │      
│  │  │  └─refresh // tabBar:首页 刷新及回顶部
│  │  │          refresh.js
│  │  │          refresh.json
│  │  │          refresh.less
│  │  │          refresh.wxml
│  │  │          refresh.wxss
│  │  │          
│  │  ├─img // 本地图片
│  │  │      fail.png
│  │  │      home-active.png
│  │  │      home.png
│  │  │      match-active.png
│  │  │      match.png
│  │  │      portrait.png
│  │  │      
│  │  ├─style // 通用样式
│  │  │      comment.less // 评论
│  │  │      comment.wxss
│  │  │      iconfont.less // 图标
│  │  │      iconfont.wxss
│  │  │      
│  │  └─voice // 音频
│  │          enHeng.wav // 进球提示音
│  │          
│  ├─pages // 页面
│  │  ├─allComs // 全部评论
│  │  │      allComs.js
│  │  │      allComs.json
│  │  │      allComs.less
│  │  │      allComs.wxml
│  │  │      allComs.wxss
│  │  │      
│  │  ├─index // 首页
│  │  │      index.js
│  │  │      index.json
│  │  │      index.less
│  │  │      index.wxml
│  │  │      index.wxss
│  │  │      
│  │  ├─match // 比赛页
│  │  │      match-template.wxml // 页面中用到的模板
│  │  │      match.js
│  │  │      match.json
│  │  │      match.less
│  │  │      match.wxml
│  │  │      match.wxss
│  │  │      
│  │  ├─matchList // tabBar:比赛
│  │  │      matchList.js
│  │  │      matchList.json
│  │  │      matchList.less
│  │  │      matchList.wxml
│  │  │      matchList.wxss
│  │  │      
│  │  ├─news // 相关新闻
│  │  │      news.js
│  │  │      news.json
│  │  │      news.less
│  │  │      news.wxml
│  │  │      news.wxss
│  │  │      
│  │  └─singleCom // 单一评论页
│  │          singleCom.js
│  │          singleCom.json
│  │          singleCom.less
│  │          singleCom.wxml
│  │          singleCom.wxss
│  │          
│  ├─utils // 工具
│  │      tool.wxs
│  │      util.js
│  │      watch.js // 监听数据
│  │      
│  └─wxParse // 解析 html/markdown
│      │  html2json.js
│      │  htmlparser.js
│      │  showdown.js
│      │  wxDiscode.js
│      │  wxParse.js
│      │  wxParse.wxml
│      │  wxParse.wxss
│      │  
│      └─emojis
│              
└─serve-demo // 服务端代码
```

## 心得体会&技术难点
> 制作过程中我主要参考了**懂球帝、pptv、粉色书城**，并加入了自己的理解调整功能。感觉微信小程序的代码是 *vue* 和 *react* 的结合体，可能更偏向于 vue。在发请求时不会因为跨域而报错，这点很便利。这是我第一次在一个完整的项目中使用 *less*，确实比 *css* 方便。另外对于弹性盒模型，使用的比以前更加熟练了。微信方面提供一些常用的组件和接口，不过有的接口存在 bug，比如：*wx.pageScrollTo* 在执行时，固定定位的回顶部图标会消失，直到页面到达顶部才又显示……相信随着基础库的更新，可以变得更加完善。
1. 页面载入时发请求，成功后处理数据时有时会出现 *undefined*。  
**解决办法：**  
利用 *if* 进行判断：
```javascript
if (data.data){
  //获取到数据
}
```
2. 如何将日期对象转换为字符串？  
**解决办法：**  
使用 *toLocaleDateString()* 方法，但是在微信开发者工具得到的格式为2019/1/14，真机调试时得到2019-1-14，上传为体验版得到 Fri Jan 18 2019，所以还需分类讨论，进行下一步格式化。
3. 在行间做判断，只能写**三目运算**，不能写其它更复杂的 js 代码。
4. 如何使用 *iconfont* 图标？  
**解决办法：**  
以 *fontclass* 形式引入，而非 unicode。
5. 有时候不能引入本地资源。  
**解决办法：**  
    1. less 中的背景图需要改为 *base64* 编码。
    2. js 中播放音频的资源需用线上地址。
6. 可以通过样式调整图片。  
**解决办法：**  
利用 *filter* 滤镜可以调整图片的亮度、模糊等，就不用在 ps 中调整了。
7. 如何制作选项卡？  
**解决办法：**  
利用 *swiper* 和 *scroll-view* 组件布局，再用可视区的高度减去选项卡内容之外的高度，将此数值赋给这两个组件。
8. 尝试使用 *canvas*。  
**解决办法：**  
在制作雷达图、控球率圆环、生成分享图片时，用到了 *canvas*，通过 *beginPath, stroke, fill, fillText, draw* 等进行绘制。以后可以更详细地进行学习。
9. 如何调整 *switch* 组件的大小？  
**解决办法：**  
通过 *zoom* 调整。
10. js 中如何判断中文？  
**解决办法：**  
由于直接判断中文字符串不安全，所以先用 *encodeURIComponent()* 进行编码，再判断。
11. 如何制作数据王角落图片的遮盖效果？  
**解决办法：**  
主要利用边框、相对定位进行实现。
12. 两个数字字符串之间如何比较？  
**解决办法：**  
把其中一个转换为数字，再比较，否则 '9'>'11'，因为只比较第一位。
13. 跳转页面时如何传递数据？  
**解决办法：**  
字符串数据中如果含有 ? = &，需要先进行转换。如果要传递的数据是数组或对象，则先用 *JSON.stringify()* 转换为字符串，在目标页的 *options* 中拿到后，用 *JSON.parse()* 解析后再使用。
14. 如何渲染 *html* 格式内容？  
**解决办法：**  
使用 *wxParse* 插件。
15. 如何修改 *button* 组件的样式？  
**解决办法：**  
```css
button::after {
  border-radius: 0;
  -webkit-border-radius: 0;
  border: none;
}
```
另外，当 button 组件和其它可以点击的组件并排时，保留默认的**相对定位**。如果改为静态，那么点击右侧组件时，依然会触发 button 事件。  
16. 如何阻止页面滚动？  
**解决办法：**  
页面结构：
```bash
<scroll-view class='container' scroll-y="{{!isShowShare}}">页面的静态定位内容</scroll-view>
```
设置样式：
```css
page {
	padding: 20rpx 20rpx 80rpx;
	width: auto;
	height: 100%;
	box-sizing: border-box;
	overflow-y: hidden;
}
.container {
	height: 100%;
}
```
17. *wx.createSelectorQuery()* 是异步的，所以 *boundingClientRect* 中获取到的信息，需要在其回调函数中进行后续操作。
18. *app.less* 的样式不能应用于组件，要在组件自己的样式文件中写。
19. 一段话中包含 html 实体汉字（&\#26368;），如何进行转换？  
**解决办法：**  
```javascript
let sentence = '&#22914;&#65306;1:0&#65307;'; //如：1:0；
let reEntity = /&#\d{5};/g;
let hasEntity = reEntity.test(sentence);

if(hasEntity){
	//包含 html 实体
	let result = sentence.replace(reEntity, entity => {
		let num = entity.substr(2, 5);

		return String.fromCharCode(num);
	});

	console.log(result); //如：1:0；
}
```
20. 默认字号和行高设置为多少比较合适？  
**解决办法：**  
**28rpx** 比较合适，24rpx 在真机调试时作为文章正文有点儿小。**1.8**倍的行高看起来更舒服。
