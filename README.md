# EPLQ - Privacy-Preserving Location Queries

EPLQ (Efficient Privacy-Preserving Location-Based Query) is a secure system for handling geospatial data using predicate-only encryption. This system allows users to perform location-based queries while maintaining the privacy and security of sensitive location data.

## 🌟 Features

- **Secure Authentication**
  - Firebase Authentication integration
  - JWT-based session management
  - Role-based access control (User/Admin roles)

- **Privacy-Preserving Location Queries**
  - Predicate-only encryption for location data
  - Secure coordinate encryption/decryption
  - Protected location-based searches

- **User Management**
  - User registration and login
  - Profile management
  - Role-based dashboard access

- **POI (Points of Interest) Management**
  - Add, edit, and delete POIs
  - Category-based organization
  - Secure storage of location data

- **Modern UI/UX**
  - Responsive design using Tailwind CSS
  - Interactive maps using Leaflet
  - Real-time feedback with toast notifications
  - Smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form handling
- Leaflet for map integration
- Axios for API communication
- React Toastify for notifications

### Backend
- Node.js with Express
- Firebase for authentication and storage
- JWT for session management
- Crypto-js for encryption
- CORS enabled for cross-origin requests

### Development & Deployment
- Docker and Docker Compose for containerization
- Environment-based configuration
- Development and production builds

## 📋 Prerequisites

Before running this project, ensure you have the following installed:
- Node.js (v20 or higher)
- Docker and Docker Compose
- Git
- A Firebase account and project

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/eplq.git
cd eplq
```

### 2. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Get your Firebase configuration:
   - Go to Project Settings
   - Find your web app configuration
   - Note down the configuration values

### 3. Environment Configuration

#### Frontend (.env)
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend (.env)
Create a `.env` file in the backend directory:
```env
NODE_ENV=production
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
PORT=5000
CORS_ORIGIN=http://localhost:4173
```

### 4. Running with Docker

#### Build and Start
```bash
# Build and start all services
docker compose up --build

# Run in detached mode
docker compose up -d --build
```

#### Access the Application
- Frontend: http://localhost:4173
- Backend API: http://localhost:5000

### 5. Development Setup (Without Docker)

#### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Backend
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Project Structure

```
eplq/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── context/          # React context providers
│   ├── pages/            # Page components
│   ├── services/         # API and utility services
│   ├── types/            # TypeScript type definitions
│   └── App.tsx           # Main application component
├── backend/              # Backend source code
│   ├── services/        # Business logic services
│   ├── routes/          # API routes
│   └── server.js        # Express server
├── Dockerfile           # Frontend Docker configuration
├── docker-compose.yml   # Docker services configuration
└── package.json         # Project dependencies
```

## 🔒 Security Features

- JWT-based authentication
- Encrypted location data
- Protected API endpoints
- Role-based access control
- Secure environment variables
- CORS protection
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Sreeraj A

## 🙏 Acknowledgments

- Firebase for authentication and storage
- Leaflet for map integration
- The open-source community for various tools and libraries

## 📞 Support

For support, please open an issue in the GitHub repository or contact [sreerajkasaragod007@gmail.com]. 
