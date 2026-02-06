## Portfolio Analytics (Python FastAPI)

Backend service providing portfolio analytics for the mobile and web clients.

### Run locally

```bash
cd services/portfolio-analytics
python -m venv .venv
source .venv/bin/activate  # On Windows use .venv\\Scripts\\activate
pip install -r requirements.txt

uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

Then the mobile app can call:

- `GET http://localhost:8080/api/v1/portfolio`

