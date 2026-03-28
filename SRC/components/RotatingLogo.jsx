import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoMain from "../assets/logo.png";
import logoAlt from "../assets/logo_alt.png"; // User provided logo should be named logo_alt.png

export default function RotatingLogo({ size = 42, style = {} }) {
    const [isMain, setIsMain] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsMain(prev => !prev);
        }, 8000); // 8 seconds interval
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ 
            width: size, 
            height: size, 
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...style 
        }}>
            <AnimatePresence mode="wait">
                <motion.img
                    key={isMain ? "main" : "alt"}
                    src={isMain ? logoMain : logoAlt}
                    initial={{ rotateY: -90, opacity: 0, scale: 0.8 }}
                    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                    exit={{ rotateY: 90, opacity: 0, scale: 0.8 }}
                    transition={{ 
                        duration: 0.8, 
                        ease: "easeInOut"
                    }}
                    style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain",
                        position: "absolute"
                    }}
                    alt="Nar Logo"
                    onError={(e) => {
                        // Fallback to main logo if alt logo is missing
                        if (!isMain) {
                            setIsMain(true);
                        }
                    }}
                />
            </AnimatePresence>
        </div>
    );
}
