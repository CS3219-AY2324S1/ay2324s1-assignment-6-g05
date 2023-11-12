[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/UxpU_KWG)

# Setting up our environment locally

<strong>Note: Ensure you have installed [Docker Compose](https://docs.docker.com/compose/).</strong>

### Local Deployment Architecture

![cs3219_overall_architecture-local deployment drawio](https://github.com/CS3219-AY2324S1/ay2324s1-course-assessment-g05/assets/70256674/5b0dbbf4-ecf1-40be-bb72-cf19b103b8d2)

### Instructions on setting up local deployment

1. Download the environment variables from the folder on Canvas.

2. Create a new .env file in the root directory `/` and paste all the contents into this file. (Location of .env file is illustrated below)

![image](https://github.com/CS3219-AY2324S1/ay2324s1-course-assessment-g05/assets/70256674/ee7ad5b8-d861-40ff-9e34-7e012442bb24)

3. In the root directory `/`, run `docker compose -p peerprep up` to launch the backend services.

4. Wait for the containers to stabilize before proceeding with the application.

Console: (Fully deployed state)

![image](https://github.com/CS3219-AY2324S1/ay2324s1-course-assessment-g05/assets/70256674/c0182291-479d-4165-9e9a-f1cb2bbb5cf6)

The last container should indicate that frontend is live at [http://localhost:3000](http://localhost:3000).
