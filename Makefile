build:
	cd apps/api && npm run build
	cd apps/web && npm run build

start:
	@echo "Starting API (http://localhost:3000) and Web (http://localhost:5174)..."
	@cd apps/api && npm run start:dev & \
	cd apps/web && npm run dev & \
	wait

test:
	cd apps/api && npm run test
	cd apps/web && npm run test

clean:
	rm -rf apps/api/dist apps/web/dist

db-up:
	docker compose up -d

db-down:
	docker compose down

db-restart:
	docker compose down
	docker compose up -d

db-logs:
	docker compose logs -f