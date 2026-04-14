from fastapi import APIRouter

router = APIRouter(prefix="/v1")

from .admin import router as admin_router
from .api_keys import router as api_keys_router
from .auth import router as auth_router
from .documents import router as documents_router
from .search import router as search_router
from .tenders import router as tenders_router
from .tenants import router as tenants_router
from .test_db import router as test_db_router
from .users import router as users_router

router.include_router(auth_router)
router.include_router(documents_router)
router.include_router(users_router)
router.include_router(admin_router)
router.include_router(api_keys_router)
router.include_router(search_router)
router.include_router(tenders_router)
router.include_router(tenants_router)
router.include_router(test_db_router)
