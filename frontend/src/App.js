import './App.css';
import React from 'react';
import getWeb3 from "./utils/getWeb3";
import AgencyAppContract from "./build/contracts/AgencyApp.json"
import Signup from "./pages/Signup"
import Home from "./pages/Home"

class App extends React.Component {
  constructor (props) {
    super(props);
    //this.checkaccount = this.checkaccount.bind(this);
    this.state = {web3: null, accounts: null, contract: null, valid: false};
  }

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AgencyAppContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AgencyAppContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const valid = await instance.methods.isValidAccount().call();
      this.setState({ web3, accounts, contract: instance, valid: valid});
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  render(){
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    else{
      if(this.state.valid===true){
        return <Home contract={this.state.contract} accounts={this.state.accounts}></Home>;
      }
      else{
        return <Signup contract={this.state.contract} accounts={this.state.accounts} validate={(e)=>this.setState({valid:e})}></Signup>;
      }
    }
  }
}

export default App;
