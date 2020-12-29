import { useState, useEffect } from 'react';

function Profile(props){
    const accounts = props.accounts;
    const [name,setname] = useState("");
    const [type,settype] = useState("");
    const [text,settext] = useState("");
    const [status,setstatus] = useState(false);//false->close,true->open

    useEffect(()=>{
        async function fetchData(){
            let {0:name, 1:content, 2:type} = await props.contract.methods.getAddrInfo(props.accounts[0]).call();
            setname(name);
            settext(content);
            settype(type);
            if(type){
                let status = await props.contract.methods.getApplicantStatus(props.accounts[0]).call();
                setstatus(status===0);
            }
            else{

            }
        }
        fetchData();
    },[name,text,type]);
    
    const changeStatus = async () => {
        if(status){
            if(type){
                await props.contract.methods.updateApplicantStatus(1).send({from:accounts[0]});
            }
            else{

            }
            setstatus(false);
        }
        else{
            if(type){
                await props.contract.methods.updateApplicantStatus(0).send({from:accounts[0]});
            }
            else{

            }
            setstatus(true);
        }
    }

    return(
        <div className="App">
            <div className="header">
                <h1>去中心化人力銀行</h1>
                <h3>Username:{name} Account Type:{type? "Personal":"Company"}</h3>
            </div>
            <div className="body">
                <div className="nav">
                    <nav>
                        <ul>
                            <li><a onClick={()=>props.setpage("Profile")}>Profile</a></li>
                            <li><a onClick={()=>props.setpage("Applicant")}>Applicants' info</a></li>
                            <li><a onClick={()=>props.setpage("Company")}>Companies' info</a></li>
                            {type? <li><a onClick={()=>props.setpage("Upload")}>Upload resume</a></li>:<li><a onClick={()=>props.setpage("Upload")}>Upload intro</a></li>}
                        </ul>
                    </nav>
                </div>
                <div className="left-box">
                    <p className="profile-context">{text}</p>
                </div>
                <div className="right-box">
                    <span className="dot" style={status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span>
                    <h2>You are {status? "opened":"closed"} to {type? "interview and offer":"application"}.</h2>
                    <button onClick={changeStatus}>{status? "close":"open"}</button>
                </div>
            </div>
        </div>
    );
}

export default Profile;