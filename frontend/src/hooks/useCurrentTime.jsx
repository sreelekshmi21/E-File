import { useEffect, useState } from "react";

export function useCurrentTime(locale = "en-US", options) {
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const formatOptions =
            options ||
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            };

        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleString(locale, formatOptions));
        };

        updateTime(); // initial run
        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);
    }, [locale, options]);

    return currentTime;
}