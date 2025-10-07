# Verve - Online Clothing Store

[Live Site](https://online-clothing-store-umber.vercel.app/)

## Project Overview

Verve is a full-stack online clothing store built with **.NET Core** for the backend and **React** for the frontend. It allows customers to browse products, manage orders, and get AI-based clothing suggestions tailored to their specific occasions. Users can input prompts like "I have a birthday party, my size is XL," and the system will suggest matching outfits.

The application uses **Google Authentication**, integrates the **Gemini AI API** for recommendations, and stores data in **MongoDB Atlas**. The backend is deployed on **Azure Web App** using **Docker**, while the frontend is deployed on **Vercel**.

---

## Features

* Browse and filter products by category
* Customer registration and authentication via **Google OAuth**
* AI-based clothing suggestions using **Gemini API**
* Shopping cart and order management
* Responsive design for desktop and mobile
* Secure storage of user and product data in **MongoDB Atlas**
* Health and test endpoints for API verification

---

## Architecture

```
┌─────────────────────────────────────────────┐
│ Development Machine                          │
│  ┌──────────────────────────────────────┐   │
│  │ ClothStoreApi (.NET Core)            │   │
│  │ - Controllers, Models, Services     │   │
│  │ - Dockerfile                        │   │
│  └──────────────────────────────────────┘   │
│           ↓ docker build & push              │
└─────────────┬───────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Azure Container Registry (ACR)               │
│  - Stores Docker image                       │
│  - Private registry                          │
└─────────────┬───────────────────────────────┘
              ↓ pull image
┌─────────────────────────────────────────────┐
│ Azure Web App (App Service)                  │
│  - Runs Docker container with API           │
│  - Environment variables:                    │
│    - MongoDbSettings__ConnectionString       │
│    - MongoDbSettings__DatabaseName           │
│    - Authentication__Google__ClientId       │
│    - Authentication__Google__ClientSecret   │
│    - Gemini__ApiKey                          │
└─────────────┬───────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Frontend (React) on Vercel                   │
│  - Connects to API endpoints                 │
│  - Live site: https://online-clothing-store-umber.vercel.app/ │
└─────────────────────────────────────────────┘
```

---

## Technologies Used

* **Backend:** ASP.NET Core (.NET 6/7)
* **Frontend:** React, React Router, Tailwind CSS
* **Database:** MongoDB Atlas
* **Authentication:** Google OAuth 2.0
* **AI Integration:** Gemini API for clothing suggestions
* **Deployment:** Azure Web App (Docker container)
* **Frontend Hosting:** Vercel
* **Containerization:** Docker

---

## Getting Started

### Prerequisites

* [.NET 6/7 SDK](https://dotnet.microsoft.com/download)
* [Node.js & npm](https://nodejs.org/)
* [Docker](https://www.docker.com/)
* [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas)

### Setup Backend

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/verve.git
cd verve/backend
```

2. Configure environment variables:

```env
MONGODB_CONNECTION_STRING=<your MongoDB connection string>
MONGODB_DATABASE_NAME=ClothStoreDb
Authentication__Google__ClientId=<your Google client ID>
Authentication__Google__ClientSecret=<your Google client secret>
Gemini__ApiKey=<your Gemini API key>
```

3. Run the backend locally:

```bash
dotnet run
```

### Setup Frontend

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

---

## Docker Deployment

1. Build Docker image:

```bash
docker build -t clothstoreapi .
```

2. Push to Azure Container Registry:

```bash
docker tag clothstoreapi <your-acr-name>.azurecr.io/clothstoreapi:latest
docker push <your-acr-name>.azurecr.io/clothstoreapi:latest
```

3. Deploy on Azure Web App using the image.

---

## Netlify Frontend Deployment

1. Build React app:

```bash
npm run build
```

2. Deploy folder `build` on Netlify.

---

## AI Clothing Suggestion Feature

* Customers can provide details about the occasion and clothing preferences.
* The **Gemini API** processes the input and suggests suitable clothing items.
* Personalized recommendations improve the shopping experience.

---

## License

This project is licensed under the MIT License.

---

## Author

**Your Name** – [GitHub](https://github.com/YOUR_USERNAME) – [Portfolio](https://your-portfolio-site.com)
