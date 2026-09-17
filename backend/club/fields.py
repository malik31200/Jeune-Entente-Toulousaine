"""Champ image qui compresse/redimensionne automatiquement à l'upload.

Évite que l'admin doive compresser une photo à la main avant de l'uploader
(les photos de smartphone dépassent régulièrement la limite Cloudinary de
10 Mo par fichier). On limite la plus grande dimension et on recompresse
en JPEG avant que le fichier ne parte vers le storage (Cloudinary).
"""
from io import BytesIO

from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import models
from PIL import Image, ImageOps


def compress_image_file(field_file, max_dimension=2000, quality=85):
    """Retourne un nouveau fichier image compressé, ou None si échec/inutile."""
    try:
        field_file.seek(0)
        image = Image.open(field_file)
        image = ImageOps.exif_transpose(image)  # respecte l'orientation EXIF

        img_format = 'JPEG' if image.format in (None, 'JPEG', 'MPO') else image.format
        if img_format == 'JPEG' and image.mode not in ('RGB', 'L'):
            image = image.convert('RGB')

        width, height = image.size
        if max(width, height) > max_dimension:
            ratio = max_dimension / float(max(width, height))
            image = image.resize((max(1, int(width * ratio)), max(1, int(height * ratio))), Image.LANCZOS)

        buffer = BytesIO()
        save_kwargs = {'quality': quality, 'optimize': True} if img_format == 'JPEG' else {'optimize': True}
        image.save(buffer, format=img_format, **save_kwargs)
        buffer.seek(0)

        name = field_file.name or 'image'
        if img_format == 'JPEG' and not name.lower().endswith(('.jpg', '.jpeg')):
            name = name.rsplit('.', 1)[0] + '.jpg'

        return InMemoryUploadedFile(
            buffer, None, name, f'image/{img_format.lower()}',
            buffer.getbuffer().nbytes, None,
        )
    except Exception:
        # Fichier corrompu/non-image : on laisse passer tel quel, la
        # validation normale du champ image se chargera de le rejeter.
        return None


class CompressedImageField(models.ImageField):
    def __init__(self, *args, max_dimension=2000, quality=85, **kwargs):
        self.max_dimension = max_dimension
        self.quality = quality
        super().__init__(*args, **kwargs)

    def pre_save(self, model_instance, add):
        file = getattr(model_instance, self.attname)
        if file and not file._committed:
            compressed = compress_image_file(file, self.max_dimension, self.quality)
            if compressed is not None:
                file.file = compressed
                file.name = compressed.name
        return super().pre_save(model_instance, add)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs['max_dimension'] = self.max_dimension
        kwargs['quality'] = self.quality
        return name, path, args, kwargs
