import { delHtmlTag, delNbsp } from "../filter/str.js";
const w = 750;
const h = 1014;
const x = 45;
const t_lineheight = 30;
const d_lineheight = 18;
const t_font = 38;
const d_font = 28;
const m = 25;
const t_color = "#000000";
const d_color = "#6d6a6a";
const maxWidth = w - 2 * x;
const logo_height = 155;
const logo_top = h - logo_height - 2.5 * m;
const l_font = 28;
const d_qr_w = (w * 150) / 360;
const d_qr_h = d_qr_w;

const D_logo1 = `XX`;
const D_logo2 = `xxxx`;
const D_logo3 = `xxx`;
const D_logo1_x = x;
const D_logo2_x = x + l_font * 2;
const D_logo3_x = x + l_font * 12;
const D_logo2_y = logo_top + logo_height / 2 + 1.5 * l_font;

const CanvasId = "shareCanvas";

Component({
  properties: {
    qrcode: {
      type: String,
      value: ""
    }
  },
  data: {
    height: h * 2,
    width: w * 2,
    image: "../../images/img-loading.gif", //为了好看的loading
    isDrawing: false
  },
  methods: {
    info: function(obj) {
      if (this.data.isDrawing) {
        return;
      }
      this.setData({
        isDrawing: true
      });
      const title = obj["title"] || "";
      const poster = obj["poster"] || "";
      const qrcode = obj["qrcode"] || "";
      const des = obj["des"] || "";

      if (title && poster && qrcode) {
        const qr = `data:image/png;base64,${qrcode}`;
        const ctx = wx.createCanvasContext(CanvasId, this);
        const dh = (w * 9) / 16;
        const dw = w;
        const fsm = wx.getFileSystemManager();

        let showImgData = qrcode;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);

        showImgData = showImgData.replace(/\ +/g, ""); //去掉空格方法

        showImgData = showImgData.replace(/[\r\n]/g, "");

        const buffer = wx.base64ToArrayBuffer(showImgData);
        const timestamp = Date.parse(new Date());
        const fileName = `${wx.env.USER_DATA_PATH}/share_img_${timestamp}.png`;

        fsm.writeFileSync(fileName, buffer, "binary");

        //绘制title
        ctx.setFontSize(t_font);
        ctx.setFillStyle(t_color);
        const titleHeight =
          this.drawText(
            ctx,
            title,
            x,
            dh + 2 * m + t_font,
            t_lineheight * 2,
            maxWidth,
            t_font
          ) || 40;
        //详情
        if (des) {
          ctx.setTextAlign("left");
          ctx.setFontSize(d_font);
          ctx.setFillStyle(d_color);
          let draw_des = des.replace(/<\/p>/g, "&html");
          draw_des = draw_des.replace(/&hellip;/g, "...");
          draw_des = draw_des.replace(/[\n]/g, "&html");
          draw_des = draw_des.replace(/&middot;/g, "!");
          draw_des = delHtmlTag(draw_des);
          draw_des = delNbsp(draw_des);
          const draw_arr = draw_des.split("&html");
          let draw_des_height = titleHeight + dh + 3 * m + d_font;
          let _d = 0;
          const draw_length = draw_arr.length > 2 ? 2 : draw_arr.length;
          for (let ii = 0; ii < draw_length; ii++) {
            _d = this.drawText(
              ctx,
              `${draw_arr[ii]}`,
              x,
              draw_des_height,
              d_lineheight * 2,
              maxWidth,
              d_font,
              2
            );
            draw_des_height += _d;
          }
        } else {
          ctx.setTextAlign("left");
          ctx.setFontSize(d_font);
          ctx.setFillStyle(d_color);
          const des_arr = [`xxxx`, `xxxx`, `xxxxxxx`];
          des_arr.map((v, i) => {
            ctx.fillText(
              `${v}`,
              x,
              titleHeight + dh + (3 + i * 2) * m + d_font
            );
          });
        }

        //绘制分享标语
        ctx.setFillStyle("#f5f5f5");
        ctx.fillRect(0, logo_top, dw, logo_height);
        ctx.setFontSize(l_font);
        ctx.setFillStyle("#333");
        ctx.fillText(
          "长按小程序码",
          x,
          logo_top + logo_height / 2 - l_font / 2
        );
        ctx.fillText(D_logo1, D_logo1_x, D_logo2_y);
        ctx.fillText(D_logo2, D_logo2_x, D_logo2_y - 0.5);
        ctx.fillText(D_logo2, D_logo2_x - 0.5, D_logo2_y);
        ctx.fillText(D_logo2, D_logo2_x, D_logo2_y);
        ctx.fillText(D_logo2, D_logo2_x, D_logo2_y + 0.5);
        ctx.fillText(D_logo2, D_logo2_x + 0.5, D_logo2_y);

        ctx.fillText(D_logo3, D_logo3_x, D_logo2_y);

        ctx.drawImage(
          `../../images/share-image-box.png`,
          w - d_qr_w,
          h - d_qr_h,
          d_qr_w,
          d_qr_h + 1
        );
        ctx.drawImage(fileName, w - d_qr_w + 65, h - d_qr_h + 80, 180, 180);
        wx.downloadFile({
          url: poster,
          success: res => {
            if (res.statusCode === 200) {
              wx.getImageInfo({
                src: res.tempFilePath,
                success: _res => {
                  ctx.drawImage(_res.path, 0, 0, dw, dh);
                  ctx.draw(false, () => {
                    this.saveCanvas();
                  });
                }
              });
            }
          },
          fail: err => {
            this.errorAlert();
          }
        });
      }
    },
    saveCanvas: function() {
      wx.canvasToTempFilePath(
        {
          x: 0,
          y: 0,
          width: w,
          height: h,
          fileType: "png",
          canvasId: CanvasId,
          success: res => {
            const tempFilePath = res.tempFilePath;
            this.setData({
              image: res.tempFilePath
            });
            wx.saveImageToPhotosAlbum({
              filePath: tempFilePath,
              success: res => {
                wx.showToast({
                  title: "图片已保存到相册",
                  icon: "success",
                  duration: 2000
                });
                setTimeout(() => {
                  this.setData({
                    isDrawing: false
                  });
                }, 500);
              },
              fail: err => {
                this.errorAlert();
              }
            });
          },
          fail: err => {
            this.errorAlert();
          }
        },
        this
      );
    },
    clickSave: function() {
      if (this.data.isDrawing) {
        wx.showToast({
          title: "正在绘制图片中，请稍等...",
          icon: "none",
          duration: 2000
        });
      } else {
        this.setData({
          isDrawing: true
        });
        this.saveCanvas();
      }
    },
    closeCanvas: function() {
      if (this.data.isDrawing) {
        wx.showToast({
          title: "正在绘制图片中，请稍等...",
          icon: "none",
          duration: 2000
        });
      } else {
        this.triggerEvent("closeCanvas", true);
        wx.hideToast();
      }
    },
    drawText: function(
      ctx,
      str,
      leftWidth,
      initHeight,
      titleHeight,
      canvasWidth,
      fontSize,
      lineHeight
    ) {
      let lineWidth = 0;
      let lastSubStrIndex = 0; //每次开始截取的字符串的索引
      let column_num = 0;
      ctx.setFontSize(fontSize);
      for (let i = 0; i < str.length; i++) {
        lineWidth += ctx.measureText(str[i]).width;
        if (lineWidth > canvasWidth) {
          //绘制截取部分
          column_num++;
          const str_substring =
            lineHeight && lineHeight <= column_num
              ? `${str.substring(lastSubStrIndex, i - 2)}...`
              : str.substring(lastSubStrIndex, i);
          console.log(str_substring);
          ctx.fillText(str_substring, leftWidth, initHeight);
          // this.fillTextLetterSpacing(ctx, str_substring, leftWidth, initHeight, fontSize);
          initHeight += fontSize + 10; //16为字体的高度
          lineWidth = 0;
          lastSubStrIndex = i;
          titleHeight += fontSize;
          if (lineHeight && lineHeight && lineHeight <= column_num) {
            break;
          }
        }
        if (i == str.length - 1) {
          //绘制剩余部分
          // this.fillTextLetterSpacing(ctx, str.substring(lastSubStrIndex, i + 1), leftWidth, initHeight, fontSize);
          ctx.fillText(
            str.substring(lastSubStrIndex, i + 1),
            leftWidth,
            initHeight
          );
        }
      }
      // 标题border-bottom 线距顶部距离
      titleHeight = titleHeight + 10;
      return titleHeight;
    },
    errorAlert: function() {
      wx.showToast({
        title: `图片保存失败`,
        icon: "none",
        duration: 2000
      });
      this.setData({
        isDrawing: false
      });
    }
  }
});
