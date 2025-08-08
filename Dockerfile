# Django IPSCO Application - Railway Deployment
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=gestion_vehicules.settings

# Run migrations and collect static files
RUN python manage.py migrate --noinput
RUN python manage.py collectstatic --noinput

# Create superuser (will only work if env vars are set)
RUN python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestion_vehicules.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@ipsco.com', 'admin123')
    print('Superuser created!')
else:
    print('Superuser already exists')
" || echo "Could not create superuser, will be created at runtime"

# Expose port
EXPOSE 8000

# Start application
CMD ["gunicorn", "gestion_vehicules.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
