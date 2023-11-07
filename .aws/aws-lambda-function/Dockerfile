FROM public.ecr.aws/lambda/python:3.10

# Install PostgreSQL development packages and psycopg2-binary
RUN yum install -y postgresql postgresql-devel python3-devel gcc libpq-dev
RUN pip install psycopg2-binary --use-pep517

# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install the specified packages
RUN pip install -r requirements.txt --use-pep517

# Get from .env
ARG OPENAI_API_KEY

# Set environment variable
ENV OPENAI_API_KEY=$OPENAI_API_KEY

# Copy all files in ./src
COPY src/* ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler.
CMD [ "main.handler" ]