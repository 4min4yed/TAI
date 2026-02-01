# Multi-stage Dockerfile (production)
FROM python:3.11-slim as builder
WORKDIR /app
COPY pyproject.toml requirements.txt ./
RUN pip install --upgrade pip && pip wheel -r requirements.txt -w /wheels

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /wheels /wheels
COPY . /app
RUN pip install --no-index --find-links=/wheels -r requirements.txt

ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
