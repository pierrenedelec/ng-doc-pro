#!/bin/bash

# Configuration
GITHUB_USERNAME="${1:-}"
GITHUB_REPO="${2:-ng-doc-pro}"
IMAGE_TAG="${3:-latest}"

if [ -z "$GITHUB_USERNAME" ]; then
  echo "Usage: ./build-and-push.sh <github-username> [repo-name] [image-tag]"
  echo ""
  echo "Example: ./build-and-push.sh pierre-pr ng-doc-pro latest"
  exit 1
fi

# Construct the image URL
REGISTRY="ghcr.io"
IMAGE_NAME="${REGISTRY}/${GITHUB_USERNAME}/${GITHUB_REPO}"
IMAGE_URL="${IMAGE_NAME}:${IMAGE_TAG}"

echo "Building Docker image: ${IMAGE_URL}"
docker build -t "${IMAGE_URL}" .

if [ $? -ne 0 ]; then
  echo "Docker build failed"
  exit 1
fi

echo ""
echo "Authenticating with GitHub Container Registry..."
echo "Make sure you have a GitHub Personal Access Token (PAT) with 'write:packages' scope"
echo ""
read -p "Enter your GitHub username (for PAT login): " docker_username
echo "Enter your GitHub PAT (password will be hidden):"
read -s docker_token

# Login to GitHub Container Registry
echo "$docker_token" | docker login ghcr.io -u "$docker_username" --password-stdin

if [ $? -ne 0 ]; then
  echo "Docker login failed"
  exit 1
fi

echo ""
echo "Pushing image to GitHub Container Registry..."
docker push "${IMAGE_URL}"

if [ $? -ne 0 ]; then
  echo "Docker push failed"
  exit 1
fi

echo ""
echo "✅ Successfully pushed image to: ${IMAGE_URL}"
echo ""
echo "To pull this image, use:"
echo "  docker pull ${IMAGE_URL}"
echo ""
echo "To run the container locally:"
echo "  docker run -p 3000:3000 ${IMAGE_URL}"
