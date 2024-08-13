import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  Box,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import {
  $getSelection,
  $isRangeSelection,
  $isElementNode,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListNode,
} from "@lexical/list";
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from "@lexical/selection";
import { useCallback, useEffect, useState } from "react";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";

import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import { $isHeadingNode } from "@lexical/rich-text";
import { getSelectedNode } from "./util";

const blockTypes = {
  bullet: "Bulleted List",
  number: "Numbered List",
  paragraph: "Normal",
};

const fontSizes = {
  standard: "14px",
  large: "18px",
  extraLarge: "24px",
};

const alignItems = {
  left: "left",
  center: "center",
  right: "right",
};

type AlignmentDropDownProps = {
  selectedAlignment: ElementFormatType;
  onChange: (value: ElementFormatType) => void;
};

const AlignmentDropDown = ({
  selectedAlignment,
  onChange,
}: AlignmentDropDownProps) => {
  const AlignmentIcon = () => {
    switch (selectedAlignment) {
      case alignItems.left:
        return <FormatAlignLeftIcon />;
      case alignItems.center:
        return <FormatAlignCenterIcon />;
      case alignItems.right:
        return <FormatAlignRightIcon />;
      default:
        return <FormatAlignLeftIcon />;
    }
  };

  return (
    <Box>
      <FormControl>
        <Select
          sx={{ "& .MuiSelect-select": { padding: 0 } }}
          variant="standard"
          disableUnderline
          value={selectedAlignment}
          renderValue={() => (
            <IconButton disableRipple>
              <AlignmentIcon />
            </IconButton>
          )}
          onChange={(e) => onChange(e.target.value as ElementFormatType)}
        >
          <MenuItem value={alignItems.left}>
            <IconButton disableRipple>
              <FormatAlignLeftIcon />
            </IconButton>
          </MenuItem>
          <MenuItem value={alignItems.center}>
            <IconButton disableRipple>
              <FormatAlignCenterIcon />
            </IconButton>
          </MenuItem>
          <MenuItem value={alignItems.right}>
            <IconButton disableRipple>
              <FormatAlignRightIcon />
            </IconButton>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

type FontSizeDropdownProps = {
  selectedFontSize: string;
  onChange: (value: string) => void;
};

const FontSizeDropdown = ({
  selectedFontSize,
  onChange,
}: FontSizeDropdownProps) => {
  return (
    <Box>
      <FormControl>
        <Select
          variant="standard"
          disableUnderline
          value={selectedFontSize}
          renderValue={() => {
            return selectedFontSize === fontSizes.standard
              ? "standard"
              : selectedFontSize === fontSizes.large
              ? "large"
              : "extraLarge";
          }}
          sx={{ width: 120 }}
          onChange={(e) => onChange(e.target.value)}
        >
          <MenuItem value={fontSizes.standard}>{"standard"}</MenuItem>
          <MenuItem value={fontSizes.large}>{"large"}</MenuItem>
          <MenuItem value={fontSizes.extraLarge}>{"extraLarge"}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [blockType, setBlockType] = useState(blockTypes.paragraph);
  const [selectedFontSize, setSelectedFontSize] = useState(fontSizes.standard);
  const [selectedAlignment, setSelectedAlignment] =
    useState<ElementFormatType>("left");

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setSelectedFontSize(
        $getSelectionStyleValueForProperty(
          selection,
          "font-size",
          fontSizes.standard
        )
      );

      if ($isElementNode(node)) {
        if (node.getFormat() === 1) {
          setSelectedAlignment("left");
        } else if (node.getFormat() === 2) {
          setSelectedAlignment("center");
        } else if (node.getFormat() === 3) {
          setSelectedAlignment("right");
        } else {
          setSelectedAlignment("left");
        }
      } else {
        setSelectedAlignment(parent?.getFormatType() || "left");
      }

      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(
          anchorNode,
          ListNode
        );
        const type = parentList
          ? parentList.getListType()
          : element.getListType();
        setBlockType(type);
      } else {
        const type = $isHeadingNode(element)
          ? element.getTag()
          : element.getType();
        if (type in blockTypes) {
          setBlockType(type as keyof typeof blockTypes);
        }
      }
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor]);

  const formatList = (listType: keyof typeof blockTypes) => {
    if (listType === "number" && blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      setBlockType("number");
    } else if (listType === "bullet" && blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      setBlockType("bullet");
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      setBlockType("paragraph");
    }
  };

  const handleFontSizeChange = (value: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        $patchStyleText(selection, { "font-size": value });
      }
    });
    setSelectedFontSize(value);
  };

  const handleAlignmentChange = (value: ElementFormatType) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value);
      }
    });
    setSelectedAlignment(value);
  };

  return (
    <Stack direction={"row"} alignItems={"center"} px={0.5}>
      <IconButton
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
      >
        <UndoIcon />
      </IconButton>
      <IconButton
        disabled={!canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, undefined);
        }}
      >
        <RedoIcon />
      </IconButton>
      <Divider orientation="vertical" flexItem />
      <FontSizeDropdown
        selectedFontSize={selectedFontSize}
        onChange={handleFontSizeChange}
      />
      <Divider orientation="vertical" flexItem />
      <Box sx={isBold ? { background: "#ececec" } : null}>
        <IconButton
          disableRipple
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
        >
          <FormatBoldIcon />
        </IconButton>
      </Box>
      <Box sx={isItalic ? { background: "#ececec" } : null}>
        <IconButton
          disableRipple
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
        >
          <FormatItalicIcon />
        </IconButton>
      </Box>
      <Box sx={isUnderline ? { background: "#ececec" } : null}>
        <IconButton
          disableRipple
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          }}
        >
          <FormatUnderlinedIcon />
        </IconButton>
      </Box>
      <Box sx={isStrikethrough ? { background: "#ececec" } : null}>
        <IconButton
          disableRipple
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
          }}
        >
          <FormatStrikethroughIcon />
        </IconButton>
      </Box>
      <Divider orientation="vertical" flexItem />
      <AlignmentDropDown
        selectedAlignment={selectedAlignment}
        onChange={handleAlignmentChange}
      />
      <Box sx={blockType === "bullet" ? { background: "#ececec" } : null}>
        <IconButton disableRipple onClick={() => formatList("bullet")}>
          <FormatListBulletedIcon />
        </IconButton>
      </Box>
      <Box sx={blockType === "number" ? { background: "#ececec" } : null}>
        <IconButton disableRipple onClick={() => formatList("number")}>
          <FormatListNumberedIcon />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default ToolbarPlugin;
