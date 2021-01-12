function Signup (props){
    const accounts = props.accounts;
    const submit = async () => {
        let yes = window.confirm('Are you sure to submit the form?');
        if(yes){
            if(document.form.username.value!=="" && document.form.account_type.value!==""){
                let value = document.form.account_type.value === "true" ? true : false;
                await props.contract.methods.addAcc(document.form.username.value,value).send({from:accounts[0]});
                let valid = await props.contract.methods.isRegistered(accounts[0]).call();
                props.validate(valid);
            }
            else{
                window.alert('Form is not complete!')
            }
        }
    }

    return (
        <div className="App">
            <div className="Signup">
                <form name="form" class="w3-container w3-card-4">
                    <h1 class="w3-text-blue">Register a New Account</h1>
                    <br></br>
                    <label for="username" class="w3-text-blue">Username: </label>
                    <input id="username" type="text" name="username" autoFocus required/>
                    <br></br>
                    <p class="w3-text-gray">(The username is just for convenient usage, the real account will be built automatically by your ethereum address)</p>
                    <br></br>
                    <p class="w3-text-blue">Please select one of account type</p>
                    <input type="radio" class="w3-radio" id="personal" name="account_type" value="true" required></input>
                    <label for="personal"> Personal Account</label>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="radio" class="w3-radio" id="company" name="account_type" value="false" required></input>
                    <label for="company"> Company Account</label>
                    <br></br>
                    <br></br>
                </form>
                <button class="w3-btn w3-blue" onClick={submit}>Register</button>
            </div>
        </div>
    );
}

export default Signup;