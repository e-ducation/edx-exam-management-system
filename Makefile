.PHONY: help

help: ## display help message
	@echo "Please user 'make <target>' where <target> is one of"
	@perl -nle'print $& if m{^[\.a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m  %-25s\033[0m %s\n", $$1, $$2}'

install: ## Install Python requirements
	pip install -r requirements.txt
	python manage.py makemigrations
	python manage.py migrate

dev.run: ## run develop server
	python manage.py runserver 0.0.0.0:8111
