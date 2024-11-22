import { useEffect } from "react";
import "./App.css";
import { auth } from "./firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import TextEditor from "./component/TextEditor";

function App() {

  useEffect(() => {
    signInAnonymously(auth)
    onAuthStateChanged(auth, user => {
      if(user) {
        console.log("logged in", user.uid)
      }
    })
  },[])

  return (
    <>
      <div className="app">
        <header>
          <h1>Google Docs Clone</h1>
        </header>
        <TextEditor/>
      </div>
    </>
  );
}

export default App;
