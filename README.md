# 微信小程序生成二维码分享图前台+后台

### 后台
因为小程序后台不能添加微信相关的域名，所以我用了后台进行调用   
#### 1.从后台查看APPID、APPSECRET  
#### 2.获取token  
```
get:https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+APPID+"&secret="+APPSECRET
```

官网：    
https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/access-token/auth.getAccessToken.html

#### 3.利用获取的生成小程序二维码  
```
post: https://api.weixin.qq.com/wxa/getwxacode?access_token="+token   
data = {
    "path":path 
}
```

将生成的二进制的内容直接返回给前端  
官网：         
https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.createQRCode.html  

### 前端(小程序内部文件)
#### 4.拿到的二进制数据需要做一下处理  
（1）想通过src直接渲染到image展示的话 把src = `data:image/png;base64,${qrcode}`  
（2）如果想会知道canvas上需要保存到本地生成一个虚拟的文件再去渲染  
```
    const fsm = wx.getFileSystemManager();
    
    let showImgData = qrcode;
    showImgData = showImgData.replace(/\ +/g, ""); // 去掉空格方法
    showImgData = showImgData.replace(/[\r\n]/g, "");
    
    const buffer = wx.base64ToArrayBuffer(showImgData);
    const timestamp = Date.parse(new Date());  
    const fileName = `${wx.env.USER_DATA_PATH}/share_img_${timestamp}.png`;
    fsm.writeFileSync(fileName, buffer, 'binary'); // 写入文件
```
#### 5.绘制图片到canvas上
```
ctx.drawImage(fileName, 0, 0, 180, 180);
```
