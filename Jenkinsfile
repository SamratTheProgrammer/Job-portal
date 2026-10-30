pipeline {
    agent any

    environment {
        CONTAINER_NAME = 'job-portal-frontend'
        IMAGE_NAME     = 'job-portal-frontend'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code from Git...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image locally with Docker Compose...'
                script {
                    if (isUnix()) {
                        sh 'docker compose build'
                    } else {
                        bat 'docker compose build'
                    }
                }
            }
        }

        stage('Deploy Local Container') {
            steps {
                echo 'Deploying application locally using Docker Compose...'
                script {
                    if (isUnix()) {
                        sh 'docker compose down || true'
                        sh 'docker compose up -d'
                    } else {
                        bat 'docker compose down || echo Stopped previous container'
                        bat 'docker compose up -d'
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                echo 'Verifying running container status...'
                script {
                    if (isUnix()) {
                        sh 'docker compose ps'
                    } else {
                        bat 'docker compose ps'
                    }
                }
            }
        }
    }

    post {
        success {
            echo '=================================================='
            echo '🎉 Fullstack Build & Deployment Succeeded!'
            echo '🌐 Frontend is live at: http://localhost:5173'
            echo '🌐 Backend API is live at: http://localhost:5000'
            echo '=================================================='
        }
        failure {
            echo '=================================================='
            echo '❌ Pipeline execution failed!'
            echo '=================================================='
        }
    }
}
