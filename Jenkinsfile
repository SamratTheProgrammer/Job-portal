pipeline {
    agent any

    environment {
        // Docker Hub Credentials ID configured in Jenkins (Manage Jenkins -> Credentials)
        DOCKER_HUB_CREDENTIALS = 'docker-hub-credentials'
        
        // Docker Hub username and image configuration
        DOCKER_HUB_USER        = 'samrattheprogrammer'
        IMAGE_NAME             = 'job-portal-frontend'
        IMAGE_TAG              = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code from Git repository...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} and :latest..."
                script {
                    if (isUnix()) {
                        sh "docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest ."
                    } else {
                        bat "docker build -t %DOCKER_HUB_USER%/%IMAGE_NAME%:%IMAGE_TAG% -t %DOCKER_HUB_USER%/%IMAGE_NAME%:latest ."
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Logging in to Docker Hub and pushing images...'
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_HUB_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    script {
                        if (isUnix()) {
                            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                            sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                            sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
                        } else {
                            bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                            bat "docker push %DOCKER_HUB_USER%/%IMAGE_NAME%:%IMAGE_TAG%"
                            bat "docker push %DOCKER_HUB_USER%/%IMAGE_NAME%:latest"
                        }
                    }
                }
            }
        }

        stage('Deploy Application') {
            steps {
                echo 'Deploying application using Docker Compose...'
                script {
                    if (isUnix()) {
                        sh 'docker compose down || true'
                        sh 'docker compose up -d'
                    } else {
                        bat 'docker compose down || echo Done'
                        bat 'docker compose up -d'
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up Docker session...'
            script {
                if (isUnix()) {
                    sh 'docker logout || true'
                } else {
                    bat 'docker logout || echo Done'
                }
            }
        }
        success {
            echo '====================================='
            echo '🎉 Pipeline execution succeeded!'
            echo '====================================='
        }
        failure {
            echo '====================================='
            echo '❌ Pipeline execution failed!'
            echo '====================================='
        }
    }
}

