import logging
from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.
    Ensures that unhandled exceptions (500 errors) return a structured JSON response
    instead of falling through to default HTML error pages.
    """
    response = exception_handler(exc, context)

    if response is None:
        logger.error(f"Unhandled backend server exception: {exc}", exc_info=True)
        payload = {
            "detail": "A server error occurred (500).",
            "error": "An internal server error occurred on the backend server."
        }
        if getattr(settings, 'DEBUG', False):
            payload["debug_message"] = str(exc)

        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response

def custom_handler500(request):
    """
    Custom Django 500 handler to return JSON error response instead of standard HTML page.
    """
    return JsonResponse(
        {
            "detail": "Server Error (500)",
            "error": "An internal server error occurred on the backend server."
        },
        status=500
    )

def custom_handler404(request, exception=None):
    """
    Custom Django 404 handler to return JSON error response instead of standard HTML page.
    """
    return JsonResponse(
        {
            "detail": "Not found.",
            "error": "The requested resource or endpoint was not found on this server."
        },
        status=404
    )
