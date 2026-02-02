# 🎯 Itesiwaju Community Club

> **A modern, multilingual web platform for community management**

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📖 Overview

Itesiwaju (meaning "Progress" in Yoruba) is a comprehensive community club management platform supporting **English, Yoruba, French, and German**. Built with modern web technologies, it features role-based access control, financial tracking, event management, and member administration.

## ✨ Features

### 🌍 Multilingual Support
- **4 Languages:** English, Yoruba, French, German
- Dynamic language switching
- Fully translated UI and content

### 🎨 Modern Design
- **Light & Dark Mode**
- Responsive design (Mobile, Tablet, Desktop)
- African/Yoruba cultural design elements
- Clean, accessible UI with Shadcn components

### 👥 User Management
- Role-based access control (Admin, Executive, Member)
- Member profiles and status tracking
- Secure JWT authentication

### 📅 Event Management
- Create, edit, delete events
- Event status tracking
- Calendar integration
- Attendance management

### 💰 Financial Tracking
- Loan and payment management
- Payment history
- Fine calculations
- Account status monitoring

### 📊 Dashboard
- Real-time statistics
- Quick actions
- Activity feed
- Upcoming events widget

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/itesiwaju-frontend.git
cd itesiwaju-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
itesiwaju-frontend/
├── app/                    # Next.js App Router
│   └── [locale]/          # Internationalized routes
├── components/            # React components
│   ├── common/           # Shared components
│   ├── ui/               # Shadcn UI components
│   ├── landing/          # Landing page components
│   ├── dashboard/        # Dashboard components
│   ├── events/           # Event components
│   ├── members/          # Member components
│   └── account-status/   # Financial components
├── messages/             # Translation files
│   ├── en.json          # English
│   ├── yo.json          # Yoruba
│   ├── fr.json          # French
│   └── de.json          # German
├── lib/                  # Utilities and helpers
├── providers/            # Context providers
├── public/               # Static assets
└── i18n/                 # i18n configuration
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.x (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.x
- **Components:** Shadcn UI
- **i18n:** next-intl
- **Theme:** next-themes
- **Forms:** react-hook-form + zod
- **Notifications:** sonner
- **Icons:** lucide-react

### Backend (Planned)
- **Framework:** NestJS
- **Database:** Convex
- **Authentication:** JWT

## 📚 Documentation

Comprehensive documentation is available in the following files:

- **[QUICK_START.md](QUICK_START.md)** - Get started quickly with code examples
- **[TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)** - Detailed technical implementation guide
- **[IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)** - Complete development roadmap
- **[FIGMA_AI_PROMPTS.md](FIGMA_AI_PROMPTS.md)** - Design specifications and Figma AI prompts
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview and current status

## 🌐 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English  | `en` | ✅ Complete |
| Yoruba   | `yo` | ✅ Complete (Default) |
| French   | `fr` | ✅ Complete |
| German   | `de` | ✅ Complete |

## 🎨 Design System

### Colors
- **Primary:** Orange (#FF6B35) - Energy and progress
- **Secondary:** Teal (#006B7D) - Community and trust
- **Accent:** Gold (#FFB703) - Prosperity
- **Status Colors:**
  - 🟢 Green: Good standing
  - 🟡 Yellow: Pending/Warning
  - 🔴 Red: Overdue/Error

### Typography
- **Font:** Montserrat, Geist Sans, Geist Mono
- **Scale:** Responsive, hierarchical headings

## 👤 User Roles

### Admin
- Full system access
- Manage members and events
- Financial operations
- System configuration

### Executive
- Create and manage events
- View member information
- Record payments
- View reports

### Member
- View own profile
- View events
- View own account status
- Update personal information

## 🔐 Security

- JWT-based authentication
- Role-based access control
- Protected API routes
- Secure password hashing
- Environment variable protection

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## 📦 Build & Deploy

### Build for Production

```bash
# Build
npm run build

# Start production server
npm run start
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/itesiwaju-frontend)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🗺️ Roadmap

- [x] Project setup and configuration
- [x] Translation system (4 languages)
- [x] Documentation
- [ ] Landing page implementation
- [ ] Authentication system
- [ ] Dashboard
- [ ] Events management
- [ ] Members management
- [ ] Account status tracking
- [ ] Testing
- [ ] Deployment

See [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) for detailed roadmap.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Shadcn UI](https://ui.shadcn.com/) - UI Components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [next-intl](https://next-intl-docs.vercel.app/) - Internationalization

## 📞 Support

For support, email support@itesiwaju.com or join our Slack channel.

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with ❤️ for the Itesiwaju Community**
