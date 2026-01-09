"""
Cloudinary utility functions for file uploads.
"""
import cloudinary
import cloudinary.uploader
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions


def upload_image(file, folder="products", public_id=None):
    """
    Upload an image to Cloudinary.
    
    Args:
        file: File object or base64 string
        folder: Folder name in Cloudinary
        public_id: Optional custom public ID
    
    Returns:
        dict with url and public_id, or None on error
    """
    try:
        upload_params = {
            'folder': f'ecommerce/{folder}',
            'resource_type': 'image',
            'transformation': [
                {'quality': 'auto'},
                {'fetch_format': 'auto'}
            ]
        }
        
        if public_id:
            upload_params['public_id'] = public_id
        
        result = cloudinary.uploader.upload(file, **upload_params)
        
        return {
            'url': result['secure_url'],
            'public_id': result['public_id'],
            'width': result.get('width'),
            'height': result.get('height'),
            'format': result.get('format'),
        }
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None


def upload_video(file, folder="products"):
    """
    Upload a video to Cloudinary.
    
    Args:
        file: File object
        folder: Folder name in Cloudinary
    
    Returns:
        dict with url and public_id, or None on error
    """
    try:
        result = cloudinary.uploader.upload(
            file,
            folder=f'ecommerce/{folder}',
            resource_type='video',
            eager=[
                {'format': 'mp4', 'quality': 'auto'}
            ]
        )
        
        return {
            'url': result['secure_url'],
            'public_id': result['public_id'],
            'duration': result.get('duration'),
            'format': result.get('format'),
        }
    except Exception as e:
        print(f"Cloudinary video upload error: {e}")
        return None


def delete_media(public_id, resource_type='image'):
    """
    Delete a file from Cloudinary.
    
    Args:
        public_id: The public ID of the file to delete
        resource_type: 'image' or 'video'
    
    Returns:
        bool indicating success
    """
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False


class IsAdminOrShopOwner(permissions.BasePermission):
    """Permission for admin and shop owner access."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'profile'):
            return request.user.profile.role in ['admin', 'shop_owner', 'co_shop_owner']
        return request.user.is_superuser


class CloudinaryUploadView(APIView):
    """API endpoint for uploading files to Cloudinary."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def post(self, request):
        file = request.FILES.get('file')
        folder = request.data.get('folder', 'products')
        media_type = request.data.get('type', 'image')
        
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check file size (max 10MB for images, 100MB for videos)
        max_size = 100 * 1024 * 1024 if media_type == 'video' else 10 * 1024 * 1024
        if file.size > max_size:
            return Response(
                {'error': f'File too large. Max size: {max_size // (1024*1024)}MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if media_type == 'video':
            result = upload_video(file, folder)
        else:
            result = upload_image(file, folder)
        
        if result:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'error': 'Upload failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CloudinaryDeleteView(APIView):
    """API endpoint for deleting files from Cloudinary."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def delete(self, request):
        public_id = request.data.get('public_id')
        resource_type = request.data.get('type', 'image')
        
        if not public_id:
            return Response(
                {'error': 'No public_id provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = delete_media(public_id, resource_type)
        
        if success:
            return Response({'message': 'File deleted successfully'})
        else:
            return Response(
                {'error': 'Delete failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
