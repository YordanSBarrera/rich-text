import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { Card, Divider, Stack } from "@mui/material";
import { useEffect } from "react";
import { LexicalEditor, TextNode } from "lexical";
import { HeadingNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import ToolbarPlugin from "./util/ToolBarPlugin";
import { ExtendedTextNode } from "./components/RichTextInput/ExtendedTextNode";
import GenerateHtmlPlugin from "./util/GenerateHtmlPlugin";

export const SetEditorPlugin = ({
  setEditor,
}: {
  setEditor: (editor: LexicalEditor) => void;
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!setEditor) return;
    setEditor(editor);
  }, [editor]);

  return null;
};

function onError(error: Error) {
  console.error(error);
}

const initialConfig = {
  namespace: "Rich Text",
  theme: {
    ltr: "ltr",
    rtl: "rtl",
    placeholder: "editor-placeholder",
    paragraph: "editor-paragraph",
    quote: "editor-quote",
    heading: {
      h1: "editor-heading-h1",
      h2: "editor-heading-h2",
      h3: "editor-heading-h3",
      h4: "editor-heading-h4",
      h5: "editor-heading-h5",
    },
    list: {
      nested: {
        listitem: "editor-nested-listitem",
      },
      ol: "editor-list-ol",
      ul: "editor-list-ul",
      listitem: "editor-listitem",
    },
    image: "editor-image",
    link: "editor-link",
    text: {
      bold: "editor-text-bold",
      italic: "editor-text-italic",
      overflowed: "editor-text-overflowed",
      hashtag: "editor-text-hashtag",
      underline: "editor-text-underline",
      strikethrough: "editor-text-strikethrough",
      underlineStrikethrough: "editor-text-underlineStrikethrough",
    },
  },
  onError,
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    ExtendedTextNode,
    {
      replace: TextNode,
      with: (node: TextNode) => new ExtendedTextNode(node.__text),
    },
  ],
};

type RichTextCardProps = {
  html: string;
  setHTML?: (value: string) => void;
  isViewMode?: boolean;
};

type WrapperProps = {
  children: React.ReactNode;
  isViewMode?: boolean;
};

const Wrapper = ({ children, isViewMode }: WrapperProps) => {
  if (isViewMode) {
    return <div>{children}</div>;
  }
  return (
    <Card sx={{ width: "100%" }} variant="outlined">
      {children}
    </Card>
  );
};

const RichTextCard = ({ html, setHTML, isViewMode }: RichTextCardProps) => {
  return (
    <Wrapper isViewMode={isViewMode}>
      <LexicalComposer
        initialConfig={{ editable: !isViewMode, ...initialConfig }}
      >
        <Stack width="100%">
          {!isViewMode && (
            <>
              <ToolbarPlugin />
              <Divider />
            </>
          )}
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={
                  isViewMode
                    ? undefined
                    : {
                        height: "200px",
                        maxHeight: "200px",
                        paddingInlineStart: "5px",
                        paddingInlineEnd: "5px",
                        overflow: "auto",
                        border: `1px solid rgba(0,0,0,0.12)`,
                        outlineColor: "#0074a7",
                      }
                }
              />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </Stack>
        {!isViewMode && (
          <>
            <ListPlugin />
            <HistoryPlugin />
          </>
        )}
        <GenerateHtmlPlugin
          onHtmlChanged={(html) => setHTML && setHTML(html)}
          initialHtml={html}
        />
      </LexicalComposer>
    </Wrapper>
  );
};
export default RichTextCard;
