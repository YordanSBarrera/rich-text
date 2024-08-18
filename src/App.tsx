import { useState } from "react";
import RichTextCard from "./RichTextCard";
import { Card, Stack } from "@mui/material";

const App = () => {
  const [text, setText] = useState<string>("");

  return (
    <Card variant="outlined">
      <Stack width="100%" alignItems="center">
        <h2>Play with text</h2>
        <Stack width="90%" p={3}>
          <RichTextCard html={text} setHTML={(value) => setText(value)} />
        </Stack>
      </Stack>
    </Card>
  );
};

export default App;
