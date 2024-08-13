import { useState, useEffect } from "react";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes } from "lexical";
import { emojiRegExp } from "./util";
import { useDebouncedCallback } from "use-debounce";

interface GenerateHtmlPluginProps {
  initialHtml?: string;
  onHtmlChanged: (html: string) => void;
}

const GenerateHtmlPlugin = ({
  initialHtml,
  onHtmlChanged,
}: GenerateHtmlPluginProps) => {
  const [editor] = useLexicalComposerContext();
  const [isFirstRender, setIsFirstRender] = useState(true);

  const debounced = useDebouncedCallback((editorState) => {
    editorState.read(() => {
      const normalizedHtml = $generateHtmlFromNodes(editor).replace(
        emojiRegExp,
        ""
      );
      onHtmlChanged(normalizedHtml);
    });
  }, 1000);

  useEffect(() => {
    if (!initialHtml || !isFirstRender) return;

    setIsFirstRender(false);

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      $insertNodes(nodes);
    });
  }, []);

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          debounced(editorState);
        });
      }}
    />
  );
};

export default GenerateHtmlPlugin;
