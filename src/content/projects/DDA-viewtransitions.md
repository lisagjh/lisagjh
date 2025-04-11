---
id: 3
title: "DDA - View Transition"
date: "November 2024"
livesite: "https://user-needs-ivory.vercel.app/"
description: "Creative Spike focused on using your creativitiy to create a view transition."
image:
  url: "/work-showcase/dda-view.webp"
  alt: "Mockup of my creative spike focused on implementing view transitions in the Dutch Digital Agencies website,"
notes: "This project uses an API that is still being used and worked on/with by other students. This means that this project may not work anymore."
tags: ["Sveltekit", "FDND", "P5js", "View transitions"]
relatedPosts:
  - dda
  - dda-scroll
---

At FDND we had a special sprint where we got to let our creativity run free, build fun stuff, and let go of the styleguide of our client. Each week we got a new random prompt, focused on a certain new(-ish) feature or technology.

This week my prompt was <em>Glitzy Brutalist View Transitions</em>. I loved this prompt, since I have always been interested in brutalism, and instantly had some cool ideas of how to implement this into this website.

I started out analysing the prompt. I did end up kind of ignoring the glitzy part, leaning into brutalism. So what does brutalism mean? In architecture it's raw materials, visible structure, and no unnecessary decorations. When you look at brutalism in webdesign, it tends to be mostly black and white, with one or two colors as accent, simple fonts, often big headings, minimal to no decorative elements.

So how do I translate this to a view transition? I decided to go big and bold, and created an interactive screen with `P5.js` and the <a href="https://p5-svelte.netlify.app/">svelte library</a>. On their website,I saw <a href="https://p5-svelte.netlify.app/examples/wavemaker">this</a> example and was inspired to create something similar, but with the text "DDA" - Dutch Digital Agencies.

Before diving into that, I wanted to understand how view transitions actually worked. I started small, adding an animated active state indicator to the menu item using the `::before` pseudo-element. To my surprise, it was super straightforward:

```css
.active::before {
  view-transition-name: active-link;
}
```

That one line already gave me a nice animation between active links—way easier than I expected, and a fun first win before tackling the more complex stuff.


Once I got the hang of basic transitions, I deciced to dive into the transition I had in mind. I turned the interactive graphic into a component, and imported it in the `Layout.svelte`. Here I used a boolean variable called `isTransitioning` to toggle it's visibility during page transitions. This component fades in when a transition is happening, and fades out when it's done. It sits on top of everything with `position: fixed`. 

I used a boolean variable called `isTransitioning` to toggle its visibility during page transitions. This component fades in while a transition is happening and fades out when it’s done. It sits on top of everything using position: fixed.

```html
<div class="bg" class:show-transition={isTransitioning}>
  <Graphic />
</div>
```

As you can see, the `show-transition` class gets applied when `isTransitioning = true`.

```css
div.bg {
  position: fixed;
  width: 110vw;
  height: 110vh;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease;
}

div.bg.show-transition {
  opacity: 1;
  pointer-events: auto;
}
```

For the page transitions themselves, I used the ::view-transition-old(root) and ::view-transition-new(root) selectors to define slide-in/out animations:

```css
@keyframes slide-out {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(-20%); opacity: 0; }
}

@keyframes slide-in {
  from { transform: translateX(20%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
```

These gave the whole page a nice, smooth transition that felt deliberate and "designed". It turned out way better than I expected! 
This is still one of my favourite projects I made in school. Definitely gonna make a cool transition screen for this website using this method.