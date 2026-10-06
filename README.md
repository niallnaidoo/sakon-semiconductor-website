# Sakon Semiconductors website

**Live site:** https://niallnaidoo.github.io/sakon-semiconductor-website/

A static, single-page site for Sakon Semiconductors, the Wi-Fi HaLow (IEEE 802.11ah) SoC spin-out from UCT.
It has no build step and no dependencies. Open `index.html` or host the folder on any static host
(Netlify, Vercel, GitHub Pages, cPanel, etc.).

## Structure
The site is one HTML file split into pages: Home, Technology, Products, Applications, Progress, Field demo,
Market, Team and Contact. Each page is a `<div class="page">`, and the menu switches between them by URL hash
(for example `#team`), so every page has its own shareable link.

- `index.html` has all the page content
- `assets/css/styles.css` has the styling (colours and fonts are set in `:root` at the top)
- `assets/js/main.js` handles the mobile menu, scroll effects and the contact form
- `assets/img/` holds the logo, photos and team headshots (taken from the Evergreen pitch deck)

## Opening logo animation
- `assets/video/sakon-intro.mp4` and `.webm` hold the logo animation, compressed from the original 1.5 MB file
  to about 0.4 MB and 0.26 MB.
- It plays once per browser session. Visitors can skip it with the button or the Esc key, and it is skipped
  entirely for visitors who have turned off animations in their device settings.
- The site fades in at 6.3 s, just before the video's own fade to black. Change `HANDOFF` in `assets/js/main.js`
  to adjust this.
- To see it again while testing, open a new tab or run `sessionStorage.clear()` in the browser console.

## Before going live
1. **Contact inbox**: set `CONTACT_EMAIL` at the top of `assets/js/main.js`. The form opens the visitor's
   email app addressed to that inbox. To collect enquiries without email, swap in a form service
   such as Formspree or Netlify Forms.
2. **Collaborators strip**: confirm that UCT, Siemens, UCT Civil Engineering and Rorschach
   are happy to be named publicly before publishing. Siemens in particular may have brand-usage terms.
3. **Team**: confirm that everyone consents to their photo and details going online, and add a photo for Niall Naidoo
   (the card currently shows "NN" initials).
4. **Domain / social preview**: after choosing a domain, make the `og:image` meta tag an absolute URL.

## Content scope
This is a public site. Commercial and financial detail belongs in the investor data room and stays off it.
