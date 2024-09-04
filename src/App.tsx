import React, { useEffect, useState } from 'react';
import './App.css';
import { connectOrbisDidPkh, connectOrbisDidKey, autoConnect, userLogout, getMostRecentDataFromTable, insert, select, update, insertProfileType } from '../utils/orbisUtil'; 
function App() {

  const [user, setUser] = useState<any>();
  const [recentRow, setRecentRow] = useState<any>();
  const [rows, setRows] = useState<any>();


  useEffect(() => {
      let res = autoConnect();
      if (res) 
        setUser(res);
  }, [])


  
  async function connectDidPkh() {
    let res = await connectOrbisDidPkh();
    if (res) {
      setUser(res);
    }
  }
  
  async function connectDidKey() { 
    let res =  await connectOrbisDidKey();
    if (res) {
      console.log("Setting user with did key");
      setUser(res);
    }
  }
  
  async function showRows() {
    let res = await select();
    console.log(res);
    setRows(res);
  }
  
  async function showMostRecentRow() {
    let res = await getMostRecentDataFromTable(user.did);
    setRecentRow(res);
  }

  async function updateRows() {
    let stream_id = recentRow.stream_id;
    let res = await update(recentRow.stream_id);
    setRecentRow(res);
  }

  async function logout() {
    let res = await userLogout();
    if (res == "done") {
      setUser("");
      setRecentRow("");
      setRows("");
    }
  }




  return (
    <div className="App">
      <h1>Orbis Demo</h1>
        <button onClick={connectDidPkh}>Connect did:pkh</button>
        <button onClick={connectDidKey}>Connect did:key</button>
        <button onClick={insert}>Add Row</button>
        <button onClick={insertProfileType}>Insert Profile Type</button>
        <button onClick={showRows}>Get All Rows</button>
        <button onClick={showMostRecentRow}>Get Last Row</button>
        <button onClick={updateRows}>Update Rows</button>
        <button onClick={logout}>Logout</button>
        <br />
        <h2>Connected user</h2><p> {JSON.stringify(user)} </p>
        <h2>Connected user's last entry</h2>
        <p> {JSON.stringify(recentRow)} </p>

        <h2>Current table state</h2>
        <p> {JSON.stringify(rows)} </p>

    </div>
  );
}

export default App;
