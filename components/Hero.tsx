"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const carouselItems = [
    {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB714WIhZ9p_KwN73Gap25A4b-H8Dj1cDDhnZ1MtU9AMQn2dRzcGQQMKDowqYcAQzvDOCOAjifl1a-wflhtza8Y61E-SfjcgU9CpP2_A9THNimp54h-sHXnCKLfwu4A_IxyKolcCQeZqbILIOLFsg68xFYFowumyYAau-B4gZrG7-uTBsjtuqqkKiinIicE_c-ryLmdhE7Q6maxnvayYk_2CWpUQulIPB0pu-41so0M6_sWWfJ7zcBM0Cr3THbo6H2Nve4DafMWfVzA",
        badge: "Heritage Recipe",
        title: "Authentic Royal <br /> Flavors",
        subtitle: "Experience the Nizami Legacy"
    },
    {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALHxVeoQp135l5733t5CcKGVriNpq8fo5pfnxtQfm4b4GpQ1VK3T6GrQUfCajgFCSwcf6YjzK-AceYZ4CL8l7oj-i-GuoGYm0H2tf9gIj31D5ZuxjZWA8efiohaZXP2hNgIJhirSIMvug9_ifNa1CQY_rO8LV3rz4wK9_r0bd6uldyM7gLBXgrzQKau2pmw_FWOyu7KWJ5L6jt_s40ARQ8DDRUi-UtVRvsA8hfz9BzmrnVVncgQihyr-1QX-aGOsIF0vao25sjeNq9",
        badge: "Chef's Special",
        title: "Savor the <br /> Spice Blend",
        subtitle: "A symphony of flavors in every bite"
    },
    {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTSTaAtWpvk57WUrC3rRzL1mZhiwmD8OVBx5PqaSI3nLdVfEiSjUHZ4GEx1-4hoxLKXiSf3aArh-zu1g7NYf8y5j2n7gD1T9MJD8BO6kNeOkCsHrdb4OTQYZH6cmMEBMfh2COZtxwsX9ry-NURYUhTDYy4HK79uhDfeOXrMH5qN_toN8HVf5Y4CZDPYiUuOWz9wqkmtz-S3Yy6iZ47FMhXBx_8GYK_JHbh9mcoh-XjNO0KpoOurWU39FMvLNLsF7l4Kuy5o0cv5vfn",
        badge: "Sweet Endings",
        title: "Decadent <br /> Desserts",
        subtitle: "The perfect finish to a royal meal"
    }
];

export default function Hero() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
    const imageOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, []);


    return (
        <motion.section
            ref={ref}
            className="relative w-full h-[420px] overflow-hidden"
        >
            {/* Parallax Image Carousel */}
            <motion.div
                style={{ scale: imageScale, opacity: imageOpacity }}
                className="absolute inset-0 will-change-transform"
            >
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentIndex}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url("${carouselItems[currentIndex].image}")`,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                    />
                </AnimatePresence>
            </motion.div>

            {/* Dark gradient to ensure text readability against any image */}
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 pb-12 z-10">
                <AnimatePresence mode="wait">
                    <div key={currentIndex}>
                        <motion.span
                            exit={{ opacity: 0, x: 30, filter: "blur(4px)" }}
                            transition={{ duration: 0.4 }}
                            className="inline-block bg-primary text-royal-blue text-[10px] font-black px-3 py-1.5 rounded-md mb-3 uppercase tracking-[0.2em] shadow-lg shadow-primary/30"
                        >
                            {carouselItems[currentIndex].badge}
                        </motion.span>
                        <motion.h2
                            exit={{ opacity: 0, y: -30, filter: "blur(6px)" }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="text-white text-5xl font-extrabold leading-[1.05] mb-3 drop-shadow-2xl"
                            dangerouslySetInnerHTML={{ __html: carouselItems[currentIndex].title }}
                        />
                        <motion.p
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="text-white/90 text-lg mb-6 font-medium drop-shadow-md"
                        >
                            {carouselItems[currentIndex].subtitle}
                        </motion.p>
                    </div>
                </AnimatePresence>

                {/* Floating CTA */}
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-5 bg-white backdrop-blur text-royal-blue px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider shadow-xl shadow-black/20 flex items-center gap-2"
                >
                    <span>Order Now</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </motion.button>
            </div>
        </motion.section>
    );
}
