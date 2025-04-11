---
id: 1
title: "Dutch Digital Agencies"
livesite: "https://dutchdigitalagencies.vercel.app/"
date: "September 2024 - januari 2025"
description: "Redesign the DDA website - the dutch bond of digital agencies"
bodyText: "Labore esse in aute ipsum sint eu veniam. Consectetur nostrud Lorem mollit est ad. Officia eiusmod ea minim esse id voluptate. Pariatur non labore elit voluptate minim enim. Laboris quis nisi dolor veniam mollit tempor ea quis aliqua cupidatat anim reprehenderit. Exercitation velit cupidatat Lorem nostrud adipisicing eiusmod ut aliqua id anim ullamco tempor excepteur ut."
image:
  url: "/work-showcase/dda-original.webp"
  alt: ""
notes: "This project uses an API that is still being used and worked on/with by other students. This means that this project may not work anymore."
tags: ["Sveltekit", "FDND"]
relatedPosts:
  - dda-scroll
  - dda-viewtransitions
---

During my final year at FDND, I worked on this project with two classmates. It was a collaboration with <a href="https://www.voorhoede.nl/nl/">De Voorhoede</a>, who developed the actual new website for <a href="https://dutchdigitalagencies.com/">Dutch Digital Agencies</a>. We had the chance to work directly with their team lead, Declan—an expert in his field. Each sprint review, he gave us valuable feedback, which really helped me grow as a developer.

Declan encouraged us to make some creative decisions of our own to improve the design, and I definitely took that opportunity. You can compare our version with the official one and see the differences—especially in the menu and the banner carousel on the homepage.

One of the biggest challenges was designing the banner carousel in a way that all logos would look good. Honestly, I still prefer our version over the real one, since some logos in the official design are barely visible.

For the menu, I chose to move it into a sidebar rather than keeping it in the header. In the original design, they kind of cheated by using a super small font-size (around 12px), which I wasn’t a fan of. I believe accessibility and readability come first, so I looked for a better solution.

Along with the sidebar, I added a `view-transition` on the active state to make axtive state animation smoother. I also implemented scroll-driven animations on the homepage for a more dynamic experience.

The project was built using SvelteKit, shortly after the release of Svelte 5. At the time, we were just starting to learn how to work with JavaScript frameworks—so jumping straight into the newest version of Svelte was both exciting and a little overwhelming. It meant a steep learning curve, a lot of trial and error, and frequent refactoring as we learned better ways to structure and write our code.

That said, it also gave us a great opportunity to dive into some of the latest features right away. We quickly started working with the new "Runes Mode", using `$state` and `$derived`, combined with things like `$effect()`. Looking back, it was quite challenging, but also super rewarding. I came out of it with more developed skills in problem solving and learning new skills.