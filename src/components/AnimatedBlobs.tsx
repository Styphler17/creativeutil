import { useEffect, useRef } from 'react';

export const AnimatedBlobs = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create animated blobs
    const createBlob = (index: number) => {
      const blob = document.createElement('div');
      blob.className = `absolute rounded-full blur-3xl opacity-20 animate-pulse`;
      blob.style.width = `${Math.random() * 200 + 100}px`;
      blob.style.height = `${Math.random() * 200 + 100}px`;
      blob.style.left = `${Math.random() * 100}%`;
      blob.style.top = `${Math.random() * 100}%`;
      blob.style.animationDelay = `${Math.random() * 3}s`;
      blob.style.animationDuration = `${Math.random() * 3 + 4}s`;

      // Random gradient colors
      const colors = [
        'from-blue-400 to-purple-500',
        'from-pink-400 to-red-500',
        'from-green-400 to-blue-500',
        'from-yellow-400 to-orange-500',
        'from-indigo-400 to-pink-500',
        'from-teal-400 to-green-500',
        'from-cyan-400 to-blue-500',
        'from-violet-400 to-purple-500'
      ];
      blob.className += ` bg-gradient-to-r ${colors[index % colors.length]}`;

      container.appendChild(blob);

      // Animate position
      const animate = () => {
        const newLeft = Math.random() * 100;
        const newTop = Math.random() * 100;
        blob.style.transform = `translate(${newLeft - 50}%, ${newTop - 50}%)`;
        setTimeout(animate, Math.random() * 10000 + 5000);
      };
      animate();
    };

    // Create multiple blobs
    for (let i = 0; i < 8; i++) {
      createBlob(i);
    }

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ zIndex: -1 }}
    />
  );
};
