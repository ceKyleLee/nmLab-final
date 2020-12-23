pragma solidity ^0.5.0;

contract AgencyApp {

    event OnAccountAdd(address userAddr);
    event OnAccountUpdate(address userAddr);

    struct Account {
        string name;
        uint64 acc_type;
        string content;
        // Data[] data_block;
        uint idx;
        bool isValid;
    }

    struct Data {
        string content;
    }

    mapping(address => Account) public accounts;
    address[] personal;
    address[] company;

    // Modifier
    modifier isValid(address addr) {
        require(isValidAccount(addr), "Address must be registered.");
        _;
    }

    function isValidAccount(address addr) public view returns(bool) {
        return accounts[addr].isValid;
    }

    function addAccount(string memory _name, uint64 _acc_type) public {
        require(!isValidAccount(msg.sender), "Address should not be registered.");
        accounts[msg.sender].name = _name;
        accounts[msg.sender].acc_type = _acc_type;
        accounts[msg.sender].content = "";
        accounts[msg.sender].isValid = true;
        if (_acc_type == 1) {
            accounts[msg.sender].idx = personal.push(msg.sender)-1;
        }
        else {
            accounts[msg.sender].idx = company.push(msg.sender)-1;
        }

        emit OnAccountAdd(msg.sender);
    }

    function getAccount(address _userAddr) public view isValid(_userAddr)
    returns(string memory _name, string memory _content,uint64 _acc_type) {
        Account memory acc = accounts[_userAddr];
        return(acc.name, acc.content, acc.acc_type);
    } 
    
    function updataAccount(string memory _content) public isValid(msg.sender) {
        Account storage acc = accounts[msg.sender];
        acc.content = _content;
        emit OnAccountUpdate(msg.sender);
    }

    function checkMsgsender() public view returns(address){
        return msg.sender;
    }

}