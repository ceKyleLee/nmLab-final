import './App.css';
import { useState,useEffect } from 'react';
import getWeb3 from "./utils/getWeb3";

function App() {
  const [page, setPage] = useState("Home");
  const [web3, setWeb3] = useState(null);
  const [accouts, setAccouts] = useState(null);
  const [contract, setContract] = useState(null);

  /*useEffect(()=>{
    const connect = async () => {
      try {
        const web3_tmp = await getWeb3();
        const accounts_tmp = await web3_tmp.eth.getAccounts();
        const networkId = await web3_tmp.eth.net.getId(); 
        const deployedNetwork = TodoAppContract.networks[networkId];
        const instance = new web3_tmp.eth.Contract(
          TodoAppContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        setWeb3(web3_tmp);
        setAccouts(accounts_tmp);
        setContract(instance);
      } catch (error){
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }
    connect();
  });

  if(!web3){
    return (
      <div className="App">Loading Web3, accounts, and contract...</div>
    )
  }*/

  if(page=="Home"){
    return (
      <div className="App">
        <div>
          <h1>去中心化人力銀行</h1>
        </div>
        <div>
          <button onClick={()=>setPage("signin")}>sign in</button>
          <button onClick={()=>setPage("signup")}>sign up</button>
        </div>
      </div>
    );
  }

  if(page=="signin"){
    return (
      <div className="App">
        <h1>This is sign in page.</h1>
      </div>
    )
  }

  if(page=="signup"){
    return (
      <div className="App">
        <h1>Sign up an account</h1>
        <form>
        <label>Username: </label>
        <input type="text" name="username" autoFocus required/>
        <br></br>
        <br></br>
        <label>Password: </label>
        <input type="password" name="password" required/>
        <br></br>
        <br></br>
        <input type="submit" value="提交"/>
        </form>
      </div>
    )
  }
}

export default App;
