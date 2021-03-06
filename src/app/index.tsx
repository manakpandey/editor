import React from "react";
import "./index.scss";
import Editor from "../component/Editor";
import Files from "../component/Files";
import { useState } from "react";
import Preview from "../component/Preview";
import Header from "../component/Header";
import generateLink from "../utils/generateLink";
import { useEffect } from "react";
import getDataFromLink from "../utils/getDataFromLink";
import Notification, { addNotification } from "../component/Notification";
import Preloader from "../component/Preloader";
import Helmet from "react-helmet";
import pathMaker from "../utils/pathMaker";
import Switch from "../icons/switch";

function App() {
  const [file, setFile] = useState<"html" | "css" | "javascript">("html");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    const res = await getDataFromLink({
      code: window.location.hash?.substring(1),
    });
    if (res) {
      setHtml(res.html);
      setCss(res.css);
      setJs(res.js);
    }
    setLoading(false);
  };

  const editorOnChange = (c: string) => {
    switch (file) {
      case "javascript":
        setJs(c);
        break;
      case "html":
        setHtml(c);
        break;
      case "css":
        setCss(c);
        break;
    }
  };

  const editorCode = () => {
    switch (file) {
      case "javascript":
        return js;
      case "html":
        return html;
      case "css":
        return css;
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    const code = await generateLink({ html, css, js });
    setIsSharing(false);

    if (code === -1) {
      addNotification({
        title: <div className="de-notif_title">All files are empty</div>,
        message: <div className={"de-notif_msg"}>Link cannot be generated</div>,
        type: "info",
      });
    } else if (code === -2) {
      addNotification({
        title: <div className="de-notif_title">Aw, snap!</div>,
        message: <div className={"de-notif_msg"}>Link cannot be generated</div>,
        type: "danger",
      });
    } else {
      const link = pathMaker(code as string);
      navigator.clipboard.writeText(link);
      addNotification({
        title: <div className="de-notif_title">Copied to clipboard!</div>,
        message: (
          <div className={"de-notif_msg"}>
            <div>Shareable link generated.</div>
            <code className={"de-notif_code"}>{link}</code>
          </div>
        ),
      });
    }
  };

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className={"de-dyteditor"}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Editor_</title>
        <meta
          name="description"
          content="Editor_ | A code editor with live preview."
        />
      </Helmet>
      <Notification />
      <Header onShare={() => handleShare()} isSharing={isSharing} />
      <div className="de-editor_window">
        <div className={`de-ide ${showPreview ? "hide" : ""}`}>
          <Files
            active={file}
            onChange={(f: "html" | "css" | "javascript") => {
              setFile(f);
            }}
          />
          <Editor
            language={file}
            text={editorCode()}
            onChange={editorOnChange}
          />
        </div>
        <div className={`de-preview ${!showPreview ? "hide" : ""}`}>
          <Preview html={html} css={css} js={js} />
        </div>
      </div>
      <div className="de-switch" onClick={() => setShowPreview(!showPreview)}>
        <Switch />
      </div>
    </div>
  );
}

export default App;
