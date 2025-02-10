import React, { useRef, useCallback, useState, useEffect, Dispatch } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    SELECTION_CHANGE_COMMAND,
    FORMAT_TEXT_COMMAND,
    COMMAND_PRIORITY_LOW,
    $isRangeSelection,
} from 'lexical';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Link2,
    MessageSquare,
} from 'lucide-react';

import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { getDOMRangeRect } from './utils/getDomRangeRect';
import { getSelectedNode } from './utils/getSelectedNode';

import './FloatingTextToolbar.css';

interface FloatingTextToolbarProps {
    anchorElement?: HTMLElement;
    setIsLinkEditMode?: Dispatch<boolean>;
}

function FloatingTextToolbar({
    anchorElement = document.body,
    setIsLinkEditMode,
}: FloatingTextToolbarProps) {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Visibility and formatting states.
    const [visible, setVisible] = useState(false);
    const [isText, setIsText] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);
    const [isUppercase, setIsUppercase] = useState(false);
    const [isLowercase, setIsLowercase] = useState(false);
    const [isCapitalize, setIsCapitalize] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [isLink, setIsLink] = useState(false);

    // Update toolbar state and position
    const updateToolbar = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            const nativeSelection = window.getSelection();
            const rootElement = editor.getRootElement();
            if (
                editor.isComposing() ||
                !nativeSelection ||
                nativeSelection.isCollapsed ||
                !rootElement ||
                !rootElement.contains(nativeSelection.anchorNode)
            ) {
                setVisible(false);
                setIsText(false);
                return;
            }
            if (!$isRangeSelection(selection)) {
                setVisible(false);
                setIsText(false);
                return;
            }

            // Update formatting states
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
            setIsSubscript(selection.hasFormat('subscript'));
            setIsSuperscript(selection.hasFormat('superscript'));
            setIsUppercase(selection.hasFormat('uppercase'));
            setIsLowercase(selection.hasFormat('lowercase'));
            setIsCapitalize(selection.hasFormat('capitalize'));
            setIsCode(selection.hasFormat('code'));

            // (Optionally, if you want to support link toggling, you can check the node type)
            const node = getSelectedNode(selection);
            // In your full implementation you can import and use $isLinkNode to set isLink accordingly.
            setIsLink(false); // For now, default to false

            // Make sure there is actual text (avoid showing on images or empty selections)
            const rawTextContent = selection.getTextContent().replace(/\n/g, '');
            if (!selection.isCollapsed() && rawTextContent === '') {
                setIsText(false);
                setVisible(false);
                return;
            }
            setIsText(true);

            // Position the toolbar above the selection.
            const rangeRect = getDOMRangeRect(nativeSelection, rootElement);
            if (rangeRect && toolbarRef.current) {
                const toolbarHeight = toolbarRef.current.offsetHeight;
                toolbarRef.current.style.position = 'absolute';
                toolbarRef.current.style.top = `${rangeRect.top + window.scrollY - toolbarHeight - 8}px`;
                toolbarRef.current.style.left = `${rangeRect.left + window.scrollX + rangeRect.width / 2}px`;
                toolbarRef.current.style.transform = 'translate(-50%, 0)';
                toolbarRef.current.style.opacity = '1';
            }
            setVisible(true);
        });
    }, [editor]);

    // Listen for selection and editor updates.
    useEffect(() => {
        const unregisterUpdate = editor.registerUpdateListener(() => {
            updateToolbar();
        });
        const unregisterSelection = editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                updateToolbar();
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
        window.addEventListener('resize', updateToolbar);
        window.addEventListener('scroll', updateToolbar);
        return () => {
            unregisterUpdate();
            unregisterSelection();
            window.removeEventListener('resize', updateToolbar);
            window.removeEventListener('scroll', updateToolbar);
        };
    }, [editor, updateToolbar]);

    // Add mouse listeners to disable pointer events on drag.
    useEffect(() => {
        const mouseMoveListener = (e: MouseEvent) => {
            if (toolbarRef.current && (e.buttons === 1 || e.buttons === 3)) {
                if (toolbarRef.current.style.pointerEvents !== 'none') {
                    const x = e.clientX;
                    const y = e.clientY;
                    const elementUnderMouse = document.elementFromPoint(x, y);
                    if (elementUnderMouse && !toolbarRef.current.contains(elementUnderMouse)) {
                        toolbarRef.current.style.pointerEvents = 'none';
                    }
                }
            }
        };
        const mouseUpListener = () => {
            if (toolbarRef.current) {
                toolbarRef.current.style.pointerEvents = 'auto';
            }
        };
        document.addEventListener('mousemove', mouseMoveListener);
        document.addEventListener('mouseup', mouseUpListener);
        return () => {
            document.removeEventListener('mousemove', mouseMoveListener);
            document.removeEventListener('mouseup', mouseUpListener);
        };
    }, []);

    if (!visible || !isText) {
        return null;
    }

    return createPortal(
        <div ref={toolbarRef} className="floating-text-format-popup">
            {/* Bold */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                className={`popup-item spaced ${isBold ? 'active' : ''}`}
                title="Bold"
                aria-label="Bold"
            >
                <Bold size={16} />
            </button>
            {/* Italic */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                className={`popup-item spaced ${isItalic ? 'active' : ''}`}
                title="Italic"
                aria-label="Italic"
            >
                <Italic size={16} />
            </button>
            {/* Underline */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                className={`popup-item spaced ${isUnderline ? 'active' : ''}`}
                title="Underline"
                aria-label="Underline"
            >
                <Underline size={16} />
            </button>
            {/* Strikethrough */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
                className={`popup-item spaced ${isStrikethrough ? 'active' : ''}`}
                title="Strikethrough"
                aria-label="Strikethrough"
            >
                <Strikethrough size={16} />
            </button>
            {/* Subscript */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
                className={`popup-item spaced ${isSubscript ? 'active' : ''}`}
                title="Subscript"
                aria-label="Subscript"
            >
                <span className="text-sm">X<sub>₂</sub></span>
            </button>
            {/* Superscript */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
                className={`popup-item spaced ${isSuperscript ? 'active' : ''}`}
                title="Superscript"
                aria-label="Superscript"
            >
                <span className="text-sm">X<sup>²</sup></span>
            </button>
            {/* Uppercase */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'uppercase')}
                className={`popup-item spaced ${isUppercase ? 'active' : ''}`}
                title="Uppercase"
                aria-label="Uppercase"
            >
                <span className="text-sm">A</span>
            </button>
            {/* Lowercase */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'lowercase')}
                className={`popup-item spaced ${isLowercase ? 'active' : ''}`}
                title="Lowercase"
                aria-label="Lowercase"
            >
                <span className="text-sm">a</span>
            </button>
            {/* Capitalize */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize')}
                className={`popup-item spaced ${isCapitalize ? 'active' : ''}`}
                title="Capitalize"
                aria-label="Capitalize"
            >
                <span className="text-sm">Aa</span>
            </button>
            {/* Code */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
                className={`popup-item spaced ${isCode ? 'active' : ''}`}
                title="Code"
                aria-label="Code"
            >
                <Code size={16} />
            </button>
            {/* Link */}
            <button
                type="button"
                onClick={() => {
                    if (!isLink) {
                        setIsLinkEditMode?.(true);
                        editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
                    } else {
                        setIsLinkEditMode?.(false);
                        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                    }
                }}
                className={`popup-item spaced ${isLink ? 'active' : ''}`}
                title="Insert link"
                aria-label="Insert link"
            >
                <Link2 size={16} />
            </button>
        </div>,
        anchorElement
    );
}

export default FloatingTextToolbar;