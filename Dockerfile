FROM python:3.13-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY --chmod=444 server.py index.html styles.css app.js ./

USER 65532:65532

EXPOSE 8000

CMD ["python", "server.py"]
