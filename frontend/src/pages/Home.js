import { useState, useEffect } from 'react';

function Home (props){
    let accounts = props.accounts;
    const [text,settext] = useState("")

    const submit = async () => {
        let yes = window.confirm('Are you sure to submit?');
        if(yes){
            if(document.getElementsByTagName("textarea")[0].value!==""){
                await props.contract.methods.updataAccount(document.getElementsByTagName("textarea")[0].value).send({from:accounts[0]})
                let result = await props.contract.methods.getAccount(accounts[0]).call();
                settext(result._content);
                document.getElementsByTagName("textarea")[0].value = "";
            }
            else{
                window.alert("You didn't type in anything!")
            }
        }
    }

    useEffect(()=>{
        async function fetchData(){
            let result = await props.contract.methods.getAccount(props.accounts[0]).call();
            settext(result._content);
        }
        fetchData();
    },[]);

    return (
        <div className="App">
            <div className="header">
                <h1>去中心化人力銀行</h1>
            </div>
            <div className="body">
                <div className="left-box">
                    <textarea className="context-input" maxLength="200" placeholder="type here" required></textarea>
                    <button className="context-submit" onClick={submit}>submit</button>
                </div>
                <div className="right-box">
                    <p className="context-output">{text}</p>
                </div>
            </div>
        </div>
    );
}

export default Home;