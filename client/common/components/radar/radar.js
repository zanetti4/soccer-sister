let width = 750; // canvas的宽
let height = 750; // canvas的高

let angleNum = 6; // 角数，即多少个数据项 【3，10】
let angleAvg = 360 / angleNum; // 分角度平均值
let angleOffset = 13; // 角度偏移量
let layerNum = 10; // 层数，即环层数量
let layerWidth = 0; // 层宽
let bgLineColor = '#D6D6D6'; // 背景线条颜色
let bgLineWidth = 0; // 背景线条宽度
let centerPoint = [0, 0]; // 中心点坐标
let layerPoints = []; // 各层上的点

let wordColor = '#999'; // 字体颜色
let fontSize = 0; // 字体大小
let wordArr = ['射门', '封堵', '角球', '赛季胜率', '场均进球', '控球率']; // 字体数组
let wordOffset = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
let circleWidth = 0; // 圆点宽度

// 绘制的雷达比例数据
/* let dataArr = [5, 10, 1, 2, 4, 3];
let dataArr2 = [2, 4, 7, 2, 1, 9]; */

let context =null;
let windowWidth = 0;

let radar = {
    init: function() {
        centerPoint = [rpx(325), rpx(250)];
        layerWidth = rpx(20);
        bgLineWidth = rpx(1.6);
        fontSize = rpx(24);
        circleWidth = rpx(4);
        wordOffset = [
            [rpx(-30), rpx(40)], 
            [rpx(40), rpx(40)], 
            [rpx(65), rpx(0)], 
            [rpx(60), rpx(15)], 
            [rpx(-25), rpx(25)], 
            [rpx(15), rpx(10)]
        ];
    },
    draw: function(dataArr, dataArr2) {
        let n = 0, m = 0, k = 0;
        this.init();
        //画背景线条
        context = wx.createContext();
        context.setLineWidth(bgLineWidth);
        context.setStrokeStyle(bgLineColor);
        context.beginPath();
        context.setFontSize(fontSize);
        context.setFillStyle(wordColor);

        for(n = 0; n < layerNum; n++) {
            layerPoints[n] = [];

            for(k = 0; k < angleNum; k++) { 
                context.moveTo(centerPoint[0], centerPoint[1]);
                let offsetX = layerWidth * (n + 1) * getXParam(angleAvg * (k + 1) + angleOffset);
                let offsetY = layerWidth * (n + 1) * getYParam(angleAvg * (k + 1) + angleOffset);
                let distX = centerPoint[0] + offsetX;
                let distY = centerPoint[1] + offsetY;
                if(n == layerNum - 1) {
                    context.lineTo(distX, distY);
                    if(wordArr[k]) {
                        let wordOffsetX = offsetX >= 0 ? 1 : -1;
                        wordOffsetX = distX + wordOffsetX * wordOffset[k][0];
                        let wordOffsetY = offsetY >= 0 ? 1 : -1;
                        wordOffsetY = distY + wordOffsetY * wordOffset[k][1];
                        context.fillText(wordArr[k], wordOffsetX, wordOffsetY); 
                    }
                }
                layerPoints[n][k] = [distX, distY];
            }
        }

        for(m = 0; m < layerPoints.length; m++) {
            for(n = 0; n < layerPoints[m].length; n++) {
                context.moveTo(layerPoints[m][n][0], layerPoints[m][n][1]);
                if(n < layerPoints[m].length - 1) {
                    context.lineTo(layerPoints[m][n + 1][0], layerPoints[m][n + 1][1]);
                } else {
                    context.moveTo(layerPoints[m][n][0], layerPoints[m][n][1]);
                    context.lineTo(layerPoints[m][0][0], layerPoints[m][0][1]);
                }
            }
        }

        context.stroke();

        // 绘制比例:
        context.beginPath();
        context.setStrokeStyle("rgba(213, 204, 77, 0.7)");
        context.setFillStyle("rgba(213, 204, 77, 0.7)");

        let isFirstPoint = true;
        let tmpPoints = [];

        for(m = 0; m < angleNum; m++) {
            tmpPoints = centerPoint;

            if(dataArr[m] > 0) {
                for(n = 0; n < layerNum; n++) {
                    if(dataArr[m] == (n + 1)) {
                        tmpPoints = layerPoints[n][m];
                        break;
                    }
                }
            }

            if(isFirstPoint) {
                context.moveTo(tmpPoints[0], tmpPoints[1]);
                isFirstPoint = false;
            } else {
                context.lineTo(tmpPoints[0], tmpPoints[1]);
            }
        }

        context.fill();
        context.stroke();
        context.closePath();

        // 绘制比例2:
        context.beginPath();
        context.setStrokeStyle("rgba(54, 54, 54, 0.7)");
        context.setFillStyle("rgba(54, 54, 54, 0.7)");

        let isFirstPoint2 = true;
        let tmpPoints2 = [];

        for (m = 0; m < angleNum; m++) {
          tmpPoints2 = centerPoint;

          if (dataArr2[m] > 0) {
            for (n = 0; n < layerNum; n++) {
              if (dataArr2[m] == (n + 1)) {
                tmpPoints2 = layerPoints[n][m];
                break;
              }
            }
          }

          if (isFirstPoint2) {
            context.moveTo(tmpPoints2[0], tmpPoints2[1]);
            isFirstPoint2 = false;
          } else {
            context.lineTo(tmpPoints2[0], tmpPoints2[1]);
          }
        }

        context.fill();
        context.stroke();
        context.closePath();

        // 绘制圆点：
        for(m = 0; m < angleNum; m++) {
            tmpPoints = centerPoint;

            if(dataArr[m] > 0) {
                for(n = 0; n < layerNum; n++) {
                    if(dataArr[m] == (n + 1)) {
                        tmpPoints = layerPoints[n][m];
                        break;
                    }
                }
            }

            context.beginPath();
            context.setStrokeStyle("rgba(187, 179, 62, 0.7)");
            context.setFillStyle("rgba(187, 179, 62, 0.7)");
            context.closePath();
            context.arc(tmpPoints[0], tmpPoints[1], circleWidth, 0, 2 * Math.PI, false);
            context.closePath();
            context.fill();
            context.stroke();
        }

        // 绘制圆点2：
        for (m = 0; m < angleNum; m++) {
          tmpPoints2 = centerPoint;

          if (dataArr2[m] > 0) {
            for (n = 0; n < layerNum; n++) {
              if (dataArr2[m] == (n + 1)) {
                tmpPoints2 = layerPoints[n][m];
                break;
              }
            }
          }

          context.beginPath();
          context.setStrokeStyle("rgba(0, 0, 0, 0.7)");
          context.setFillStyle("rgba(0, 0, 0, 0.7)");
          context.closePath();
          context.arc(tmpPoints2[0], tmpPoints2[1], circleWidth, 0, 2 * Math.PI, false);
          context.closePath();
          context.fill();
          context.stroke();
        }

        wx.drawCanvas({
            canvasId: 'radarCanvas',
            actions: context.getActions()
        });
    }
};

let rpx = (param) => {
    if(windowWidth == 0) {
        wx.getSystemInfo({
            success: function (res) {
                windowWidth = res.windowWidth;
            }
        });
    }
    return Number((windowWidth / 750 * param).toFixed(2));
};

let getXParam = (angle) => {
    let param = 1;
    if(angle >= 0 && angle < 90) {
        param = 1;
    } else if(angle >= 90 && angle < 180) {
        param = -1;
        angle = 180 - angle;
    } else if(angle >= 180 && angle < 270) {
        param = -1;
        angle = angle - 180;
    } else if(angle >= 270 && angle <= 360) {
        param = 1;
        angle = 360 - angle;
    }

    let angleCos = Math.cos(Math.PI / 180 * angle);
    if(angleCos < 0) {
        angleCos = angleCos * -1;
    }
    return angleCos * param;
};

let getYParam = (angle) => {
    let param = 1;
    if(angle >= 0 && angle < 90) {
        param = 1;
    } else if(angle >= 90 && angle < 180) {
        param = 1;
        angle = 180 - angle;
    } else if(angle >= 180 && angle < 270) {
        param = -1;
        angle = angle - 180;
    } else if(angle >= 270 && angle <= 360) {
        param = -1;
        angle = 360 - angle;
    }

    let angleSin = Math.sin(Math.PI / 180 * angle);
    if(angleSin < 0) {
        angleSin = angleSin * -1;
    }
    return angleSin * param;
};

module.exports = {
    radar
};