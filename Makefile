
run-app:
	npm run dev

run-api:
	cd proxy_api \
	&& uvicorn main:app --reload
