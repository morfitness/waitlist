# Morfit Waitlist Landing Page

A modern, responsive Next.js landing page for the Morfit waitlist with personalized nutrition and fitness transformation features.

## Features

- **Modern Design**: Dark theme with primary green accents inspired by modern fitness apps
- **Responsive**: Mobile-first design that works on all devices
- **Interactive**: Smooth animations using Framer Motion
- **Form Validation**: Client-side and server-side validation for waitlist signups
- **TypeScript**: Full TypeScript support for better development experience
- **Tailwind CSS**: Utility-first styling with custom design system

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Utilities**: clsx for conditional styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd waitlist
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
waitlist/
  pages/
    api/
      waitlist.ts          # API endpoint for waitlist submissions
    index.tsx              # Main landing page
  styles/
    globals.css            # Global styles and Tailwind imports
  components/              # Reusable components (add as needed)
  public/                  # Static assets (add favicon, etc.)
  package.json
  next.config.js
  tailwind.config.js
  tsconfig.json
```

## API Endpoints

### POST /api/waitlist

Submit email to join the waitlist.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Successfully joined waitlist",
  "entry": {
    "name": "John Doe",
    "email": "john@example.com",
    "timestamp": "2024-04-18T20:37:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing or invalid input
- `409`: Email already registered
- `500`: Internal server error

## Customization

### Brand Colors

Update the brand colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Update primary color palette
      }
    }
  }
}
```

### Content

Update the main content in `pages/index.tsx`:
- Hero section text
- Feature descriptions
- Early access benefits
- Form messages

### Environment Variables

Create `.env.local` with your configuration:

```env
APP_NAME=Morfit
APP_URL=https://morfit.fit
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the application:

```bash
npm run build
npm start
```

The build output will be in the `.next` folder.

## Development

### Adding New Components

1. Create component in `components/` folder
2. Use TypeScript interfaces for props
3. Export as default export

### Styling Guidelines

- Use Tailwind utility classes
- Create custom components in `tailwind.config.js`
- Follow the existing color scheme
- Maintain responsive design principles

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Use semantic HTML elements
- Implement proper error handling

## Performance

The application is optimized for:
- Fast loading with Next.js optimizations
- Smooth animations with Framer Motion
- Efficient bundle size with tree-shaking
- Core Web Vitals compliance

## Security

- Input validation on both client and server
- XSS protection with Next.js built-in features
- CSRF protection for form submissions
- Rate limiting considerations for production

## Future Enhancements

- Database integration for persistent storage
- Email notifications for waitlist updates
- Analytics integration
- A/B testing framework
- Multi-language support

## License

MIT License - see LICENSE file for details.

---

Built with Next.js, TypeScript, and Tailwind CSS for Morfit.
