import logging
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, filters, ContextTypes
from github import Github
import requests
import base64
import json
import os

# ---------------------------------------------------------
# CONFIGURACIÓN (Railway usa variables de entorno)
# ---------------------------------------------------------

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_NAME = "Legend7792/Glow-Site"
JSON_FILE_PATH = "productos.json"
IMG_FOLDER = "img"

# ---------------------------------------------------------
# LOGS
# ---------------------------------------------------------

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# ---------------------------------------------------------
# FUNCIONES DE GITHUB
# ---------------------------------------------------------

def github_client():
    return Github(GITHUB_TOKEN)

def upload_image_to_github(image_bytes, image_name):
    repo = github_client().get_repo(REPO_NAME)
    img_path = f"{IMG_FOLDER}/{image_name}"

    try:
        # Si ya existe
        file = repo.get_contents(img_path)
        repo.update_file(file.path, "Updating image", image_bytes, file.sha)
    except:
        # Si no existe
        repo.create_file(img_path, "Adding image", image_bytes)

    return img_path


def append_product_to_json(product):
    repo = github_client().get_repo(REPO_NAME)

    try:
        file = repo.get_contents(JSON_FILE_PATH)
        data_text = base64.b64decode(file.content).decode("utf-8")
        data = json.loads(data_text)
        file_sha = file.sha
    except:
        data = []
        file_sha = None

    data.append(product)
    new_json = json.dumps(data, indent=4)

    if file_sha:
        repo.update_file(JSON_FILE_PATH, "Updating products", new_json, file_sha)
    else:
        repo.create_file(JSON_FILE_PATH, "Creating JSON", new_json)

# ---------------------------------------------------------
# TELEGRAM - PROCESAR MENSAJE
# ---------------------------------------------------------

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):

    if not update.message.photo:
        await update.message.reply_text("Envía una FOTO + DESCRIPCIÓN del producto.")
        return

    photo = update.message.photo[-1]
    file = await photo.get_file()
    image_bytes = requests.get(file.file_path).content
    image_name = f"producto_{file.file_unique_id}.jpg"

    github_img_path = upload_image_to_github(image_bytes, image_name)
    description = update.message.caption if update.message.caption else "Sin descripción"

    product = {
        "nombre": "Producto agregado automáticamente",
        "descripcion": description,
        "imagen": github_img_path,
        "categoria": "Pendiente"
    }

    append_product_to_json(product)
    await update.message.reply_text("Producto añadido correctamente a la web.")

# ---------------------------------------------------------
# INICIO DEL BOT
# ---------------------------------------------------------

async def main():
    app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    app.add_handler(MessageHandler(filters.PHOTO, handle_message))

    print("BOT ENCENDIDO...")
    await app.run_polling()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
