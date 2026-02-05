"use client";

import React, { memo } from "react";
import "katex/dist/katex.min.css";
import katex from "katex";
import { cn } from "@/lib/utils";

interface LatexContentProps {
    content: string;
    block?: boolean;
    className?: string;
}

const LatexContent = memo(({ content, block = false, className }: LatexContentProps) => {
    // If content is empty/null, return null
    if (!content) return null;

    // Simple parser to separate LaTeX from text
    // Matches $...$ for inline and $$...$$ for block (though our data mainly uses $)
    const parts = content.split(/(\$[^$]+\$)/g);

    return (
        <span
            className={cn("latex-content", block ? "block" : "inline", className)}
            style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}
        >
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    // Remove $ delimiters
                    const math = part.slice(1, -1);
                    try {
                        const html = katex.renderToString(math, {
                            throwOnError: false,
                            displayMode: block, // True creates block math, False is inline
                            output: "html", // optimization
                        });
                        return (
                            <span
                                key={index}
                                dangerouslySetInnerHTML={{ __html: html }}
                                className="mx-0.5"
                            />
                        );
                    } catch (e) {
                        console.error("KaTeX rendering error:", e);
                        return (
                            <span key={index} className="text-red-500 font-mono text-xs">
                                {part}
                            </span>
                        );
                    }
                }
                // Render regular text, allowing HTML (for images preserved from Word)
                return (
                    <span
                        key={index}
                        dangerouslySetInnerHTML={{ __html: part }}
                    />
                );
            })}
        </span>
    );
});

LatexContent.displayName = "LatexContent";

export { LatexContent };
