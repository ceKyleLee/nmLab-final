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
      const valid = await instance.methods.isRegistered(accounts[0]).call();
      this.setState({ web3, accounts, contract: instance, valid: valid});
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

    this.state.contract.events.OnAccountAdd().on("data",function(event){
      let user = event.returnValues;
      console.log("A new account!",user.userAddr,user.userType);
    }).on("error",console.error);

    this.state.contract.events.OnAccountUpdate().on("data",function(event){
      let user = event.returnValues;
      console.log("An account updated!",user.userAddr,user.userType);
    }).on("error",console.error);

    this.state.contract.events.OnApplicantStatusChange().on("data",function(event){
      let user = event.returnValues;
      console.log("An user status updated!",user.userAddr,user.newStatus);
    }).on("error",console.error);

    this.state.contract.events.OnJobAdd().on("data",function(event){
      let job = event.returnValues;
      console.log("A job added!",job.userAddr,job.jobIdx);
    }).on("error",console.error);

    this.state.contract.events.OnJobUpdate().on("data",function(event){
      let job = event.returnValues;
      console.log("A job updated!",job.userAddr,job.jobIdx);
    }).on("error",console.error);

    this.state.contract.events.OnJobStatusChange().on("data",function(event){
      let job = event.returnValues;
      console.log("A job status changed!",job.userAddr,job.jobIdx,job.newStatus);
    }).on("error",console.error);

    this.state.contract.events.OnInvitationAdd().on("data",function(event){
      let inv = event.returnValues;
      console.log("An invitation added!",inv.applicant,inv.company,inv.jobIdx,inv.direction);
    }).on("error",console.error);

    this.state.contract.events.OnInvitationUpdate().on("data",function(event){
      let inv = event.returnValues;
      console.log("An invitation updated!",inv.applicant,inv.company,inv.jobIdx,inv.direction,inv.status);
    }).on("error",console.error);

    this.state.contract.events.OnOfferAdd().on("data",function(event){
      let off = event.returnValues;
      console.log("An offer added!",off.applicant,off.company,off.jobIdx,off.payment);
    }).on("error",console.error);

    this.state.contract.events.OnOfferUpdate().on("data",function(event){
      let off = event.returnValues;
      console.log("An offer updated!",off.applicant,off.company,off.jobIdx,off.payment,off.status);
    }).on("error",console.error);
    
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
