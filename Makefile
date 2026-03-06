db-start:
	docker compose up -d

db-stop:
	docker compose down

db-remove:
	docker compose down -v

db-restart:
	docker compose restart

db-logs:
	docker compose logs -f