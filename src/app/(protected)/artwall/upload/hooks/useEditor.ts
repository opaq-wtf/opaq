import { useCallback, useEffect, useState } from 'react';

interface UseEditorReturn {
    wordCount: number;
    charCount: number;
    updateCounts: () => void;
}

export function useEditor(title: string, getEditorContent: () => string): UseEditorReturn {
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);

    const updateCounts = useCallback(() => {
        const content = getEditorContent().replace(/<[^>]*>/g, '');
        const titleContent = title || '';
        const totalContent = titleContent + ' ' + content;

        setCharCount(titleContent.length + content.length);
        setWordCount(totalContent.trim().split(/\s+/).filter(Boolean).length);
    }, [title, getEditorContent]);

    useEffect(() => {
        updateCounts();
    }, [title, updateCounts]);

    return {
        wordCount,
        charCount,
        updateCounts
    };
}
