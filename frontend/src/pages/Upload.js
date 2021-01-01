import { useState, useEffect } from 'react';

function Upload(props){
    const accounts = props.accounts;
    const [name,setname] = useState("")
    const [type,settype] = useState("")
    const [text,settext] = useState("")

    const submit = async () => {
        let yes = window.confirm('Are you sure to submit?');
        if(yes){
            if(document.getElementsByTagName("textarea")[0].value!==""){
                await props.contract.methods.updataAccContent(document.getElementsByTagName("textarea")[0].value,type).send({from:accounts[0]})
                let {0:_name, 1:_content, 2:_type} = await props.contract.methods.getAddrInfo(accounts[0]).call();
                settext(_content);
                document.getElementsByTagName("textarea")[0].value = "";
            }
            else{
                window.alert("You didn't type in anything!")
            }
        }
    }

    useEffect(()=>{
        async function fetchData(){
            let {0:name, 1:content, 2:type} = await props.contract.methods.getAddrInfo(props.accounts[0]).call();
            setname(name);
            settext(content);
            settype(type);
        }
        fetchData();
    });

    return (
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
                            {type? null:<li><a onClick={()=>props.setpage("Job")}>Job manager</a></li>}
                        </ul>
                    </nav>
                </div>
                <div className="left-box">
                    <textarea className="context-input" maxLength="400" placeholder={type? "type your resume...":"type company introduction..."} required></textarea>
                    <button className="context-submit" onClick={submit}>submit</button>
                </div>
                <div className="right-box">
                    <p className="context-output">{text}</p>
                </div>
            </div>
        </div>
    );
}

export default Upload;