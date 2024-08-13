import { useState } from "react";
import RichTextCard from "./RichTextCard";
import { Card, Stack } from "@mui/material";

const App = () => {
  const [text, setText] = useState<string>("");

  return (
    <Card sx={{ width: "100%", alignContent: "center" }} variant="outlined">
      <h2>Play with text</h2>
      <Stack maxWidth="80%" alignItems="center">
        <RichTextCard html={text} setHTML={(value) => setText(value)} />;
      </Stack>
    </Card>
  );
};

export default App;
