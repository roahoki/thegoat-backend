import os

# FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# celery
from celery_config.tasks import wait_and_return, sum_to_n_job
from models import Number, BetInfo

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir cualquier origen
    allow_credentials=True,
    allow_methods=["*"],  # Permitir cualquier método
    allow_headers=["*"],  # Permitir cualquier encabezado
)

@app.get("/")
def read_root():
    return {"message": "WORKERS THE GOAT BACKEND"}

@app.get("/heartbeat")
def read_root():
    return {"message": "doing good"}



# https://docs.celeryq.dev/en/stable/getting-started/first-steps-with-celery.html
@app.get("/wait_and_return")
def get_publish_job():
    job = wait_and_return.delay()
    return {
        "message": "job published",
        "job_id": job.id,
    }

@app.get("/wait_and_return/{job_id}")
def get_job(job_id: str):
    job = wait_and_return.AsyncResult(job_id)
    print(job)
    return {
        "ready": job.ready(),
        "result": job.result,
    }

# REQUISITO FUNCIONAL 1 esto se envía al comprar
@app.post("/sum")
def post_publish_job(number: Number):
    job = sum_to_n_job.delay(number.number)
    return {
        "message": "job published",
        "job_id": job.id,
    }

# REQUISITO FUNCIONAL 2 esto se envía al entrar a la página HOT BETS
@app.get("/sum/{job_id}")
def get_job(job_id: str):
    job = sum_to_n_job.AsyncResult(job_id)
    print(job)
    # puntito rojo
    return {
        "ready": job.ready(),  
        "result": job.result,
    }



@app.post("/recommendation")
def post_publish_job_recommendation(data: BetInfo):
    job = recommendation.delay(bets_results=data.bets_results, upcoming_fixtures=data.upcoming_fixture)
    return {
        "message": "recommendation job published",
        "job_id": job.id,
    }


@app.get("/recommendation/{job_id}")
def get_job_recommendation(job_id: str):
    job = recommendation.AsyncResult(job_id)
   # puntito rojo state ? ready 
    return {
        "ready": job.ready(), 
        "result": job.result,
    }


# MODELO JOB EN POSTGRES
# |job id  |   state    |  result | date
# |abc12d  |   false    |   null  | null
# |kdf323  |   true     |   999   | 25-10-2024