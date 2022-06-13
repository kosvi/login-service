#!/bin/sh

docker run -v $(pwd)/db:/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=tester -e POSTGRES_PASSWORD=test_password -e POSTGRES_DB=test_db postgres
