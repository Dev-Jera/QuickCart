FROM python:3.11

WORKDIR /app

COPY backend/ /app/

RUN pip install --upgrade pip
RUN pip install django djangorestframework psycopg2-binary python-dotenv

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]