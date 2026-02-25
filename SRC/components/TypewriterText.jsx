import { useState, useEffect } from 'react';

export default function TypewriterText({ text, speed = 40, onComplete }) {
  const [length, setLength] = useState(0);
  useEffect(() => {
    setLength(0);
    if (!text) return;
    const total = text.length;
    const id = setInterval(() => {
      setLength((n) => {
        if (n >= total) {
          clearInterval(id);
          onComplete?.();
          return total;
        }
        return n + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <span>
      {text.slice(0, length)}
      {length < text.length && <span className="typewriter-caret" />}
    </span>
  );
}
