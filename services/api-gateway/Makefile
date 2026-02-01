.PHONY: build up down test lint migrate

build:
	docker build -t api-gateway:local .

up:
	docker-compose up -d --build

down:
	docker-compose down -v

migrate:
	alembic upgrade head

test:
	pytest -q

lint:
	# Add linting commands here (flake8/ruff)
	@echo "No linter configured"
