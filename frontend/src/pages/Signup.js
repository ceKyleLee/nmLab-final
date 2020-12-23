function Signup (props){
    let accounts = props.accounts;

    const submit = async () => {
        let yes = window.confirm('Are you sure to submit the form?');
        if(yes){
            if(document.form.username.value!=="" && document.form.account_type.value!==""){
                await props.contract.methods.addAccount(document.form.username.value,parseInt(document.form.account_type.value)).send({from:accounts[0]});
                const valid = await props.contract.methods.isValidAccount(accounts[0]).call();
                props.validate(valid);
            }
            else{
                window.alert('Form is not complete!')
            }
        }
    }

    return (
        <div className="App">
            <h1>Register a New Account</h1>
            <br></br>
            <form name="form">
                <label>Username: </label>
                <input type="text" name="username" autoFocus required/>
                <br></br>
                <p>(The username is just for convenient usage, the real account will be built automatically by your ethereum address)</p>
                <br></br>
                <p>Please select one of account type</p>
                <input type="radio" id="personal" name="account_type" value="1" required></input>
                <label for="personal">Personal Account</label>
                <input type="radio" id="company" name="account_type" value="2" required></input>
                <label for="company">Company Account</label>
                <br></br>
                <br></br>
            </form>
            <button onClick={()=>submit()}>Submit</button>
        </div>
    );
}

export default Signup;