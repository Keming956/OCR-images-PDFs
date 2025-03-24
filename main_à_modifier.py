from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request

import os
import base64
import io
from PIL import Image
import requests
import json

# uvicorn main:app --reload 

# 配置Mistral API密钥（需要替换成你自己的）
api_key = 't7kgjza3OdyO99TS0XyRoheK2xBzjeG8'

app = FastAPI(title="OCR Intelligent avec Mistral")

# 配置CORS，允许前端与API交互
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该限制来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 设置静态文件和模板
templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
templates = Jinja2Templates(directory=templates_dir)
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(templates_dir), "static")), name="static")

@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

def encode_image_to_base64(image):
    """将图像转换为base64编码"""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str

def encode_file_to_base64(file_bytes):
    """将文件直接转换为base64编码，无需处理内容"""
    return base64.b64encode(file_bytes).decode()

def call_mistral_for_ocr(image_base64):
    """调用Mistral API进行OCR识别"""
    try:
        response = requests.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistral-large",  # 使用支持视觉的模型
                "messages": [
                    {
                        "role": "user", 
                        "content": [
                            {"type": "text", "text": "请对这个图像进行OCR识别，提取所有可见文本:"},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                        ]
                    }
                ]
            }
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            raise Exception(f"Mistral API错误: {response.status_code} - {response.text}")
    except Exception as e:
        raise Exception(f"调用Mistral API失败: {str(e)}")

def call_mistral_for_pdf(pdf_base64):
    """调用Mistral API处理PDF文件"""
    try:
        response = requests.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistral-large",  # 使用支持文档处理的模型
                "messages": [
                    {
                        "role": "user", 
                        "content": [
                            {"type": "text", "text": "请从这个PDF文档中提取所有文本内容:"},
                            {"type": "file_data", "file_data": {"data": pdf_base64, "mime_type": "application/pdf"}}
                        ]
                    }
                ]
            }
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            raise Exception(f"Mistral API错误: {response.status_code} - {response.text}")
    except Exception as e:
        raise Exception(f"调用Mistral API失败: {str(e)}")

@app.post("/ocr/image")
async def ocr_image(file: UploadFile = File(...)):
    """处理上传的图片文件并使用Mistral进行OCR识别（对应index.html的图片上传功能）"""
    try:
        contents = await file.read()
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension in ['.jpg', '.jpeg', '.png', '.bmp', '.gif']:
            # 处理图像文件
            image = Image.open(io.BytesIO(contents))
            img_base64 = encode_image_to_base64(image)
            text = call_mistral_for_ocr(img_base64)
            return {"text": text}
        else:
            raise HTTPException(status_code=400, detail="不支持的图片类型")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR处理失败: {str(e)}")

@app.post("/ocr/file")
async def ocr_file(file: UploadFile = File(...)):
    """处理上传的文件（图片或PDF）并使用Mistral进行OCR识别"""
    try:
        contents = await file.read()
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension in ['.pdf']:
            # 处理PDF文件，直接将PDF文件编码为base64并发送给Mistral
            pdf_base64 = encode_file_to_base64(contents)
            text = call_mistral_for_pdf(pdf_base64)
        elif file_extension in ['.jpg', '.jpeg', '.png', '.bmp', '.gif']:
            # 处理图像文件
            image = Image.open(io.BytesIO(contents))
            img_base64 = encode_image_to_base64(image)
            text = call_mistral_for_ocr(img_base64)
        else:
            raise HTTPException(status_code=400, detail="不支持的文件类型")
        
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR处理失败: {str(e)}")

@app.post("/ocr/camera")
async def ocr_camera(data: dict):
    """处理来自相机照片的base64编码图片（对应index.html的相机功能）"""
    try:
        # 从base64字符串获取图像数据
        if "image" not in data:
            raise HTTPException(status_code=400, detail="未提供图像数据")
            
        image_data = data.get("image").split(",")[1] if "," in data.get("image") else data.get("image")
        
        # 直接调用Mistral API处理base64图像
        text = call_mistral_for_ocr(image_data)
        
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR处理失败: {str(e)}")

@app.post("/ocr/webcam")
async def ocr_webcam(data: dict):
    """处理来自网络摄像头的base64编码图片（对应index.html的网络摄像头功能）"""
    try:
        # 从base64字符串获取图像数据
        if "image" not in data:
            raise HTTPException(status_code=400, detail="未提供图像数据")
            
        image_data = data.get("image").split(",")[1] if "," in data.get("image") else data.get("image")
        
        # 直接调用Mistral API处理base64图像
        text = call_mistral_for_ocr(image_data)
        
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR处理失败: {str(e)}")

@app.post("/ocr/base64")
async def ocr_base64(data: dict):
    """处理base64编码的图片（通用接口，可用于各种来源的base64图像）"""
    try:
        # 从base64字符串获取图像数据
        image_data = data.get("image").split(",")[1] if "," in data.get("image") else data.get("image")
        
        # 直接调用Mistral API处理base64图像
        text = call_mistral_for_ocr(image_data)
        
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR处理失败: {str(e)}")

@app.post("/process/mistral")
async def process_with_mistral(data: dict):
    """使用Mistral AI处理OCR结果文本"""
    try:
        text = data.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="文本为空")
        
        response = requests.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistral-medium",
                "messages": [{"role": "user", "content": f"分析并改进以下OCR文本，修正可能的错误并保持原始格式: {text}"}]
            }
        )
        
        if response.status_code == 200:
            processed_text = response.json()["choices"][0]["message"]["content"]
        else:
            processed_text = f"Mistral处理错误: {response.status_code} - {response.text}"
        
        return {"processed_text": processed_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mistral处理失败: {str(e)}")

@app.get("/health")
async def health_check():
    """API健康检查端点"""
    return {"status": "ok"}