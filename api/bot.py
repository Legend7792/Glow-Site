import os
import json
import base64
import requests
from github import Github
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes

# -------------------------------------------------
# VARIABLES DE ENTORNO
# -------------------------------------------------

TELEGRAM_TOKEN = os.environ["TELEGRAM_TOKEN"]
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
REPO_NAME = os.environ["REPO_NAME"]

IMG_FOLDER = "img"
JSON_FILE = "productos.json"

# -------------------------------------------------
# GITHUB
# -------------------------------------------------

gh = Github(GITHUB_TOKEN)
repo = gh.get_repo(REPO_NAME)

def subir_imagen(bytes_img, nombre):
    ruta = f"{IMG_FOLDER}/{nombre}"
    try:
        f = repo.get_contents(ruta)
        repo.update_file(f.path, "update image", bytes_img, f.sha)
    except:
        repo.create_file(ruta, "new image", bytes_img)
    return ruta

def guardar_producto(producto):
    try:
        f = repo.get_contents(JSON_FILE)
        data = json.loads(base64.b64decode(f.content))
        sha = f.sha
    except:
        data = []
        sha = None

    data.append(producto)
    nuevo = json.dumps(data, indent=4)

    if sha:
        repo.update_file(JSON_FILE, "add product", nuevo, sha)
    else:
        repo.create_file(JSON_FILE, "create products", nuevo)

# -------------------------------------------------
# HANDLER PRINCIPAL
# -------------------------------------------------

async def procesar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message or not update.message.photo:
        return

    photo = update.message.photo[-1]
    file = await photo.get_file()
    img_bytes = requests.get(file.file_path).content

    nombre_img = f"producto_{file.file_unique_id}.jpg"
    ruta = subir_imagen(img_bytes, nombre_img)

    descripcion = update.message.caption or "Sin descripción"

    producto = {
        "nombre": "Producto automático",
        "descripcion": descripcion,
        "imagen": ruta
    }

    guardar_producto(producto)
    await update.message.reply_text("Producto agregado correctamente.")

# -------------------------------------------------
# ENTRYPOINT PARA VERCEL
# -------------------------------------------------

async def handler(request):
    app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    app.add_handler(
        app.add_handler
    )
    update = Update.de_json(await request.json(), app.bot)
    await procesar(update, app.bot)
    return {
        "statusCode": 200,
        "body": "ok"
    }
