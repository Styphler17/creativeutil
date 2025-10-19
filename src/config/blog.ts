export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  image: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "mastering-css-animations",
    title: "Mastering CSS Animations: From Basics to Advanced Techniques",
    excerpt: "Learn how to create stunning CSS animations with our CSS Animation Generator tool. Discover keyframes, transitions, and performance optimization tips.",
    author: "CreativeUtil Team",
    date: "2024-01-15",
    readTime: "8 min read",
    tags: ["CSS", "Animation", "Web Development"],
    image: "/assets/blog/css-animations.jpg",
    content: `# Mastering CSS Animations

CSS animations bring life to your web projects. Our CSS Animation Generator makes it easy to create complex animations without writing code from scratch.

## Key Concepts

- **Keyframes**: Define animation stages
- **Transitions**: Smooth property changes
- **Performance**: Use transform and opacity for smooth animations

## Using Our Tool

The CSS Animation Generator provides:
- Live preview
- Preset animations
- Custom keyframe editor
- CSS export

[Try the CSS Animation Generator](/tools/css-animation-generator)

## Best Practices

1. Use hardware acceleration
2. Minimize repaints
3. Test on real devices

## Conclusion

Master CSS animations to create engaging user experiences.`
  },
  {
    id: "responsive-design-guide",
    title: "Complete Guide to Responsive Web Design in 2024",
    excerpt: "Build mobile-first websites with our Responsive Layout Builder. Learn CSS Grid, Flexbox, and media queries for perfect cross-device experiences.",
    author: "CreativeUtil Team",
    date: "2024-01-10",
    readTime: "12 min read",
    tags: ["Responsive Design", "CSS", "Mobile"],
    image: "/assets/blog/responsive-design.jpg",
    content: `# Responsive Web Design Guide

Responsive design ensures your site looks great on all devices. Our Responsive Layout Builder helps you prototype layouts quickly.

## Mobile-First Approach

Start with mobile styles, then enhance for larger screens.

## CSS Grid vs Flexbox

- **Grid**: Two-dimensional layouts
- **Flexbox**: One-dimensional layouts

## Media Queries

\`\`\`css
@media (min-width: 768px) {
  .container { display: grid; }
}
\`\`\`

[Build responsive layouts](/tools/responsive-layout-builder)

## Testing

Use browser dev tools and real devices for testing.
`
  },
  {
    id: "color-theory-web-design",
    title: "Color Theory in Web Design: Creating Harmonious Palettes",
    excerpt: "Understand color psychology and accessibility. Use our Color Palette Generator to create WCAG-compliant color schemes for your projects.",
    author: "CreativeUtil Team",
    date: "2024-01-05",
    readTime: "6 min read",
    tags: ["Color Theory", "Design", "Accessibility"],
    image: "/assets/blog/color-theory.jpg",
    content: `# Color Theory in Web Design

Colors evoke emotions and guide user behavior. Our Color Palette Generator helps create accessible color schemes.

## Color Psychology

- Blue: Trust and professionalism
- Green: Growth and nature
- Red: Energy and urgency

## Accessibility

Ensure sufficient contrast ratios for readability.

[Generate color palettes](/tools/color-palette)

## Color Harmonies

- Complementary
- Analogous
- Triadic

Experiment with our tool to find the perfect palette.
`
  }
];
