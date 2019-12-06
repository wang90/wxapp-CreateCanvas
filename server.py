# pythone
import ujson
import base64
import re
import urllib.request
from urllib.error import  URLError
import aiohttp
import ujson as json

# 小程序后台查询
APPID = "***"
APPSECRET ="***"
HEADERS = {
    "Content-Type":"application/json"
}


# 生成小程序二维码接口
@router.post('/weixincode')
async def weixin_qrcode(
    request:Request
):  
    content = await request.json()
    url = content['url']
    if url is None :
        return {"status":-1,"msg":"没有传url"}
    access_token = await getToken()
    if access_token is None:
        return{"status":-1,"msg":"获取token失败"}
    base_data = await getQrcode(access_token,url)
    qr =   base64.b64encode(base_data)
    return {"status":0,"data":{"image":qr}}

async def getToken():
    URL =  "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+APPID+"&secret="+APPSECRET
    headers = HEADERS
    async with aiohttp.ClientSession() as session:
        async with session.get(URL, headers=headers) as resp:
            if resp.status != 200:
                return None
            result_text = await resp.text()
            result = json.loads(result_text)
            access_token = result['access_token']
            if access_token is None:
                return None
            return access_token
    return None

async def getQrcode(token,scene,width=430):
    URL =  "https://api.weixin.qq.com/wxa/getwxacode?access_token="+token
    headers = HEADERS
    payload = {
        "path":scene
    }
    data = json.dumps(payload)
    async with aiohttp.ClientSession() as session:
        async with session.post(URL, 
            data=data,headers=headers) as resp:
            if resp.status != 200:
                return None
            result = await resp.content.read()
            return result
    return None 