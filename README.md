# TAI
Multi-tenant SaaS platform with tenant isolation, identity governance, zero-trust access control

# To Run:
```cd \services\api-gateway\```
Postgres, Redis, RabbitMQ: ```docker-compose up```                            --> http://127.0.0.1:5432

FastAPI:                  ```python /services/api-gateway/start_simple.py```  --> http://127.0.0.1:8000

Fronend:                  ```.\Fontend\start.bat```                           --> http://127.0.0.1:3000
# Login:
>curl http://127.0.0.1:8000/auth/login -X POST -H "Content-Type:Application/Json" -d "{\"email\":\"amin@jsjs.cs\",\"password\":\"7amma\"}"
# Register
>curl http://127.0.0.1:8000/auth/register -X POST -H "Content-Type:Application/Json" -d "{\"tenant_name\":\"org\", \"email\":\"amin@jsjs.cs\",\"password\":\"7amm\"}"