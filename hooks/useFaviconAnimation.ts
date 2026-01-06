import { useEffect } from 'react';

export const useFaviconAnimation = () => {
    useEffect(() => {
        const canvas = document.createElement('canvas');
        const size = 64; // Higher resolution for better quality
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = '/icon.svg';

        let x = 0;
        let lastTime = 0;
        const fps = 20;
        const interval = 1000 / fps;

        let animationFrame: number;

        const animate = (time: number) => {
            if (time - lastTime >= interval) {
                lastTime = time;

                ctx.clearRect(0, 0, size, size);

                // Draw the truck moving from left to right
                // Scale the truck to fill more of the favicon space
                const truckSize = 48;
                const yOffset = (size - truckSize) / 2;

                ctx.drawImage(img, x, yOffset, truckSize, truckSize);
                ctx.drawImage(img, x - size, yOffset, truckSize, truckSize);

                x = (x + 1.5) % size;

                const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                if (link) {
                    link.href = canvas.toDataURL('image/png');
                }
            }

            animationFrame = requestAnimationFrame(animate);
        };

        img.onload = () => {
            animationFrame = requestAnimationFrame(animate);
        };

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (link) {
                link.href = '/icon.svg';
            }
        };
    }, []);
};
