"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
    children: React.ReactNode;
    container?: HTMLElement | null;
}

export function Portal({ children, container }: PortalProps) {
    const [mounted, setMounted] = useState(false);

    const isMountedRef = useRef(false);

    useEffect(() => {
        Promise.resolve().then(() => {
            if (!isMountedRef.current) {
                isMountedRef.current = true;
                setMounted(true);
            }
        });
    }, []);

    if (!mounted) return null;

    const targetContainer = container ?? document.body;
    return createPortal(children, targetContainer);
}