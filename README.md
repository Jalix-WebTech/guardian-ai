# ResQ AI

ResQ AI is an AI-powered emergency and survival assistance platform designed to provide fast, structured guidance during emergencies, disasters, medical incidents, and low-connectivity situations.

The platform combines modern AI reasoning with offline-first emergency support principles to help users access critical assistance when it matters most.

---

## Features

* AI-powered emergency assistance
* Structured emergency response system
* Offline emergency mode
* Progressive Web App (PWA) support
* Mobile-responsive emergency interface
* Emergency severity classification
* Low-connectivity support
* Real-time emergency chat interaction
* Installable app experience
* Emergency fallback response system

---

## Technology Stack

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* OpenRouter API
* Progressive Web App (PWA)
* next-pwa

---

## Project Architecture

```text
User Emergency Request
        ↓
ResQ AI Interface
        ↓
AI Emergency Processing
        ↓
Structured Emergency Response
        ↓
Offline Fallback System
        ↓
Emergency Guidance Delivery
```

---

## Getting Started

### Prerequisites

Before running the project locally, ensure you have:

* Node.js installed
* npm or yarn installed
* OpenRouter API key

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/resq-ai.git
```

Navigate into the project directory:

```bash
cd resq-ai
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENROUTER_API_KEY=your_api_key_here
```

---

## Running the Development Server

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

in your browser.

---

## Build for Production

```bash
npm run build
npm start
```

---

## Progressive Web App (PWA)

ResQ AI includes Progressive Web App functionality, allowing users to:

* Install the application
* Access cached resources offline
* Use emergency fallback mode during network failure
* Launch the platform like a native mobile app

---

## Offline Emergency Mode

The platform includes an offline emergency response mode that continues providing limited emergency guidance even when internet connectivity is unavailable.

This feature is designed for:

* Disaster environments
* Rural areas
* Network outages
* Emergency fallback scenarios
* Critical low-connectivity conditions

---

## Folder Structure

```text
resq-ai/
│
├── app/
│   ├── api/
│   ├── chat/
│   ├── layout.tsx
│   └── page.tsx
│
├── public/
├── types/
├── package.json
├── next.config.ts
└── README.md
```

---

## API Integration

ResQ AI uses AI APIs through OpenRouter for emergency reasoning and response generation.

The system processes user emergency prompts and returns:

* Emergency severity level
* Condition assessment
* Actionable survival steps

---

## Example Emergency Response

```text
Emergency Level: HIGH

Condition:
Possible severe bleeding detected

Steps:
• Apply direct pressure to the wound
• Elevate the injured area
• Seek immediate medical assistance
```

---

## Future Improvements

Planned future enhancements include:

* Voice emergency interaction
* GPS emergency support
* Real-time disaster alerts
* Multi-language support
* Medical specialization modules
* Cached emergency knowledge base
* Advanced offline AI support
* Emergency contact integration

---

## Deployment

The application can be deployed using:

* Vercel
* Netlify
* Docker
* Self-hosted Node.js environments

Recommended deployment platform:

* Vercel

---

## Security Notes

* API keys should never be committed to Git repositories
* `.env.local` is ignored via `.gitignore`
* Sensitive credentials should remain server-side only

---

## Contributing

Contributions, improvements, and feature suggestions are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

---

## License

This project is licensed under the MIT License.

---

## Author

Developed by Jalixon.

---

## Inspiration

ResQ AI was inspired by the need for accessible emergency assistance during disasters, unstable connectivity situations, and critical emergency conditions where rapid access to guidance can make a meaningful difference.
