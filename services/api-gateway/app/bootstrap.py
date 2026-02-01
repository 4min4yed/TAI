"""Application assembly: middleware, routes and docs registration."""
from fastapi import FastAPI


def create_app() -> FastAPI:
    app = FastAPI(title="API Gateway")
    # register middleware and routers here
    return app
