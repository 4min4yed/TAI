# TAI
Multi-tenant SaaS platform with tenant isolation, identity governance, zero-trust access control

# To Run:
docker-compose up
python start simple

# Login:
>curl http://127.0.0.1:8000/auth/login -X POST -H "Content-Type:Application/Json" -d "{\"email\":\"amin@jsjs.cs\",\"password\":\"7amma\"}"
# Register
>curl http://127.0.0.1:8000/auth/register -X POST -H "Content-Type:Application/Json" -d "{\"tenant_name\":\"org\", \"email\":\"amin@jsjs.cs\",\"password\":\"7amm\"}"