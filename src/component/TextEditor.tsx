import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import "react-quill/dist/quill.snow.css";
import "../App.css";
import {throttle} from "lodash"

function TextEditor() {
  const quillRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const isLocalChange = useRef(false);

  const docRef = doc(db, "documents", "simple-doc");

  const saveContent = throttle(() => {
    if (quillRef.current && isLocalChange.current) {
      const content = quillRef.current.getEditor().getContents();
      console.log("saving content to db", content);

      setDoc(docRef, { content: content.ops }, { merge: true })
        .then(() => console.log("content saved"))
        .catch(console.error);

      isLocalChange.current = false;
    }
  }, 1000)

  useEffect(() => {
    if (quillRef.current) {
      //load any initial content from db
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const savedContent = docSnap.data().content;
          if (savedContent) {
            quillRef.current.getEditor().setContents(savedContent);
          }
        } else {
          console.log("No doc found with empty editor");
        }
      });

      //listen to firestore for any updates and update locally in real time
      const unSubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const newContent = snapshot.data().content;

          if (!isEditing) {
            const editor = quillRef.current.getEditor();
            const currentCursorPosition = editor.getSelection()?.index || 0;

            editor.setContents(newContent, "silent");
            editor.setSelection(currentCursorPosition);
          }
        }
      });

      //listen for local text change and save it in db
      const editor = quillRef.current.getEditor();
      editor.on("text-change", (source: any) => {
        if (source === "user") {
          isLocalChange.current = true;
          ``;
          setIsEditing(true);
          saveContent();

          setTimeout(() => {
            setIsEditing(false);
          }, 5000);
        }
      });
      return () => {
        unSubscribe()
        editor.off("text-change")
      }
    }
  }, []);

  return (
    <div className="google-docs-editor">
      <ReactQuill ref={quillRef} />
    </div>
  );
}

export default TextEditor;
