import cloudinary
import cloudinary.uploader
from PIL import Image
import io

def resize_image(image_path, width, height):
    """
    Resize the image to the specified width and height
    """
    with Image.open(image_path) as img:
      img = img.resize((width,height))
      buffer = io.BytesIO()
      img.save(buffer, format="JPEG")
      buffer.seek()
      return buffer

def upload_image_to_cloudinary(image_path, width=800, height=800):
   resized_image = resize_image(image_path, width, height)
   response = cloudinary.uploader.upload(resized_image, resource_type="image")
   return response["url"]