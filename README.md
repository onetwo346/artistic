# Artistic Hair Design - Serverless Real-Time Booking System

A modern hair salon booking system with real-time updates between the chatbot and admin dashboard using **GunDB** (peer-to-peer, serverless, works on any static host including GitHub Pages).

## Features

- **Truly Serverless**: No backend server required
- **Peer-to-Peer Real-Time Sync**: Bookings sync instantly between all open dashboards and chatbots
- **Admin Dashboard**: Real-time view of all bookings and appointments
- **Smart Chatbot**: AI-powered booking assistant
- **Works on GitHub Pages**: Just upload your files, no server setup needed

## Quick Start

1. **Upload all files to your static host** (e.g., GitHub Pages, Netlify, Vercel, etc.)
2. **Open your site in multiple tabs or devices**
3. **Book an appointment through the chatbot**
4. **See it appear instantly on the admin dashboard!**

## How It Works

- Uses [GunDB](https://gun.eco/) for real-time, decentralized data sync
- All browsers connected to your site share booking data directly
- No server, no database, no deployment headaches

## File Structure

```
artisan/
├── index.html         # Main website with chatbot
├── admin.html         # Admin dashboard
├── script.js          # Main website functionality + chatbot
├── admin.js           # Admin dashboard functionality
├── styles.css         # Main website styles
├── admin.css          # Admin dashboard styles
├── bookings.json      # (legacy, not used)
└── README.md          # Project documentation
```

## How to Deploy

- **GitHub Pages**: Just push your files to the `gh-pages` branch or enable Pages in your repo settings
- **Netlify/Vercel**: Drag and drop your folder or connect your repo
- **Any static host**: Upload your files

## How to Use

- Open `index.html` to access the main site and chatbot
- Open `admin.html` to access the admin dashboard
- Bookings made in one tab/device will appear in real time in all others

## Technology

- **GunDB**: Decentralized, peer-to-peer database for browsers
- **Pure HTML/CSS/JS**: No frameworks, no build step, no server

## Customization

- Update `script.js` and `admin.js` for custom booking logic or UI
- Style with `styles.css` and `admin.css`

## License

MIT License - see LICENSE file for details. 