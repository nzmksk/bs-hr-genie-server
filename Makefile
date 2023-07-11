log-db:
	sudo docker logs hr-db

log-redis:
	sudo docker logs hr-cache

log-server:
	sudo docker logs hr-server

node-terminal:
	sudo docker exec -it hr-server sh

psql-cli:
	sudo docker exec -it hr-db psql -U postgres -d hr-genie

redis-cli:
	sudo docker exec -it hr-cache redis-cli

server-down:
	sudo docker-compose down -v ; \
	sudo rm -r data

server-up:
	sudo docker-compose up --build -d
