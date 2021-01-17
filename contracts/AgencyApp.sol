pragma solidity ^0.5.0;
import "./Applicant.sol";
import "./Company.sol";

contract AgencyApp is ApplicantApp, CompanyApp  {


    // Account managing
    // Modifier
    modifier Registered(address _addr) {
        require(isRegistered(_addr), "Address must be registered.");
        _;
    }

    function isRegistered(address _addr) public view returns(bool) {
        return (isApplicant(_addr) || isCompany(_addr));
    }

    //// Action
    function addAcc(string memory _name, bool _type) public {
        require(!isRegistered(msg.sender), "Address is registered.");
        if (_type) { // Applicant
            addAPPAcc(_name);
        }
        else { // Company
            addCOMAcc(_name);
        }
    }

    function updataAccContent(string memory _content, bool _type) public 
    Registered(msg.sender) {
        if (_type) { // Applicant
            updateAPPAcc(_content);
        } else { // Company
            updateCOMAcc(_content);
        }
    }

    //// View
    function getAddrInfo(address _addr) public view 
    Registered(_addr) returns(string memory _name, string memory _content, bool _type) {
        string memory name;
        string memory content;
        if (isApplicant(_addr)) { // Applicant
            (name, content) = getAPPAcc(_addr);
            return (name, content, true);
        } else { // Company
            (name, content) = getCOMAcc(_addr);
            return (name, content, false);
        }
    } 

    // Invitation
    //// Struct
    enum InvStatus{
        Open,
        Accept,
        Reject,
        Last
    }
    
    struct Invitation {
        address App;
        address Com;
        uint    JobIdx;
        string  Msg;
        bool    Dir; // true: from applicant, false: from company
        uint16  Status;

        uint    idx;
        uint256 createTime;
    }

    uint256 constant inv_Expire   = 7 days;

    Invitation[] invitations;

    //// Modifier
    modifier ActiveInv(uint _invIdx, address _addr) {
        Invitation storage _inv = invitations[_invIdx];
        require(isActiveInv(_inv), "This invitaiton is locked!");
        if (_inv.Dir) { // From applicant
            // require(_inv.Com == _addr, "Only company can update this invitation!");
            require(_inv.Com == _addr);
        } else {       // From company
            // require(_inv.App == _addr, "Only applicant can update this invitation!");
            require(_inv.App == _addr);
        }
        _;
    }

    function existActiveInv(address _applicant, address _company, uint _jobIdx ) public view 
    APPAccout(_applicant) COMAccout(_company) returns(bool) {
        Job storage _job = getJob(_company, _jobIdx);
        uint _invIdx;
        for(uint i=0;i < _job.invitations.length;i++){
            _invIdx = _job.invitations[i];
            if (( invitations[_invIdx].App == _applicant ) && ( isActiveInv(invitations[_invIdx]) )) {
                return true;
            }
        }
        return false;
    }

    function isActiveInv(Invitation memory _inv) internal view returns(bool) {
        if ((_inv.Status == uint16(InvStatus.Open)) && 
            (!isExpired(_inv.createTime, inv_Expire))) { return true; }
        else { return false; }
    }

    //// Action
    function sendInvitation(address _tarAddr, uint _jobIdx, string memory _msg, bool _dir) public {
        address _ComAddr;
        address _AppAddr;
        if (_dir) { // From Applicant
            _ComAddr = _tarAddr;
            _AppAddr = msg.sender;
        } else { // From company
            _ComAddr = msg.sender;
            _AppAddr = _tarAddr;
        }
        // require(!existActiveInv(_AppAddr, _ComAddr, _jobIdx), "Exist active invitation!");
        require(!existActiveInv(_AppAddr, _ComAddr, _jobIdx));

        Job storage _job = getJob(_ComAddr, _jobIdx);
        Applicant storage _applicant = applicants[_AppAddr];

        // require((_applicant.Status == uint16(AppStatus.Open)), "Applicant is in close Status!");
        // require((_job.Status == uint16(JobStatus.Open)), "Job is in close Status!");
        // require((_job.Employee.length < _job.Number) || (_job.Status == uint16(JobStatus.Close)), "Job is closed!");

        require((_applicant.Status == uint16(AppStatus.Open)));
        require((_job.Status == uint16(JobStatus.Open)));
        require((_job.Employee.length < _job.Number) || (_job.Status == uint16(JobStatus.Close)));

        Invitation memory new_inv = Invitation({
            App:    _AppAddr,
            Com:    _ComAddr,
            JobIdx: _jobIdx,
            Msg:    _msg,
            Dir:    _dir,
            Status: uint16(InvStatus.Open),
            idx:    0,
            createTime: now
        });
        new_inv.idx = invitations.push(new_inv)-1;

        _job.invitations.push(new_inv.idx);
        _applicant.invitations.push(new_inv.idx);

        emit OnInvitationAdd(_AppAddr, _ComAddr, _jobIdx, _dir);
    }

    function updateInvitationStatus(uint _invIdx, uint _newStatus) public 
    ValidIdx(invitations.length,_invIdx) ActiveInv(_invIdx, msg.sender) ValidStatus(uint(InvStatus.Last), _newStatus){
        Invitation storage _inv = invitations[_invIdx];
        _inv.Status = uint16(_newStatus);
        
        emit OnInvitationUpdate(_inv.App, _inv.Com, _inv.JobIdx, _inv.Dir, _inv.Status);
    }

    //// View
    function getInvitationInfo(uint _invIdx) public view ValidIdx(invitations.length,_invIdx)
    returns (address _applicants, address _company, uint _jobIdx, 
    string memory _msg, bool _dir, uint _status, uint256 _createtime, uint _dur) {
        Invitation memory _inv = invitations[_invIdx];
        return (_inv.App, _inv.Com, _inv.JobIdx,_inv.Msg, _inv.Dir, 
                uint(_inv.Status), _inv.createTime, inv_Expire);
    }

    function isExpiredInv(uint _invIdx) public view 
    ValidIdx(invitations.length,_invIdx) returns(bool) {
        if (isExpired(invitations[_invIdx].createTime, inv_Expire)) { return true; } 
        return false;
    }

    // Offer
    //// Struct
    enum OffStatus{
        Open,
        Accept,
        Reject,
        Negotiate,
        Close, 
        Last
    }
    struct Offer {
        uint    Payment;
        address App;
        address Com;
        uint    JobIdx;
        string  Msg;
        uint16  Status;

        uint    idx;
        uint256 createTime;
        uint256 updateTime;
    }
    uint256 constant off_Expire   = 7 days;
    uint256 constant off_Cooldown = 7 days;

    Offer[] offers;

    //// Modifier
    modifier APPModifiableOff(uint _offIdx, address _addr) {
        // Offer storage _offer = offers[_offIdx];
        // require((_offer.App == _addr), "Only applicant can check offer.");
        // require((_offer.Status == uint16(OffStatus.Open)), "Offer is locked!");
        // require(isExpired(_offer.createTime, off_Expire), "Offer is expired!");
        require((offers[_offIdx].App == _addr));
        require((offers[_offIdx].Status == uint16(OffStatus.Open)));
        require(!isExpired(offers[_offIdx].createTime, off_Expire));

        _;
    }

    modifier COMModifiableOff(uint _offIdx, address _addr) {
        // Offer storage _offer = offers[_offIdx];
        // require((_offer.Com == _addr), "Only Company can update offer.");
        // require((_offer.Status == uint16(OffStatus.Open) || _offer.Status == uint16(OffStatus.Reject)), "Offer is locked!");
        // require(isExpired(_offer.createTime, off_Expire), "Offer is expired!");
        // require(!inCoolDown(_offer.updateTime, off_Cooldown), "Offer is in cool down!");
        require((offers[_offIdx].Com == _addr));
        require((offers[_offIdx].Status == uint16(OffStatus.Open) || offers[_offIdx].Status == uint16(OffStatus.Negotiate)));
        require(!isExpired(offers[_offIdx].createTime, off_Expire));
        require(!inCoolDown(offers[_offIdx].updateTime, off_Cooldown));
        _;
    }

    function canSendOffer(address _applicant, address _company, uint _jobIdx ) public view
    APPAccout(_applicant) COMAccout(_company) returns(bool){
        Job storage _job = getJob(_company, _jobIdx);
        for(uint j=0;j < _job.Employee.length; j++) {
            if (_job.Employee[j] == _applicant) {
                return false;
            }
        }

        uint offerIdx;
        for(uint i=0;i < _job.offers.length;i++){
            offerIdx = _job.offers[i];
            if (offers[offerIdx].App == _applicant && 
                isActiveOffer(offers[offerIdx])) {
                    return true;
            }
        }
        return false;
    }

    function isActiveOffer(Offer memory _offer) internal view returns(bool) {
        if (((_offer.Status == uint16(OffStatus.Open))
            || (_offer.Status == uint16(OffStatus.Reject))) && 
            !isExpired(_offer.createTime, off_Expire) ) {
            return true;
        }
        return false;
    }

    function getJobActiveOfferNum(Job storage _job) internal view returns(uint) {
        uint _offIdx;
        uint activeOffNum = 0;
        for(uint i=0;i < _job.offers.length;i++){
            _offIdx = _job.offers[i];
            if (isActiveOffer(offers[_offIdx])) {
                activeOffNum += 1;
            }
        }
        return activeOffNum;
    }

    //// Action
    function sendOffer(address _tarAddr, uint _jobIdx, uint _payment, string memory _msg) public 
    APPAccout(_tarAddr) COMAccout(msg.sender) {
        address _comAddr = msg.sender;
        address _appAddr = _tarAddr;

        Job storage _job = getJob(_comAddr, _jobIdx);
        Applicant storage _applicant = applicants[_appAddr];

        // require(!canSendOffer(_appAddr, _comAddr, _jobIdx), "Exist active offer!");
        // require((_applicant.Status == uint16(AppStatus.Open)), "Applicant is in close Status!");
        // require((_job.Status == uint16(JobStatus.Open)), "Job is in close Status!");
        // require((_job.Employee.length >= _job.Number), "No vacancy for this job!");

        require(!canSendOffer(_appAddr, _comAddr, _jobIdx));
        require((_applicant.Status == uint16(AppStatus.Open)));
        require((_job.Status == uint16(JobStatus.Open)));
        require((_job.Employee.length <= _job.Number));

        uint sendedOfferNum = getJobActiveOfferNum(_job);
        require((sendedOfferNum <= (_job.Number - _job.Employee.length)));

        Offer memory new_offer = Offer({
            Payment: _payment,
            App:     _appAddr,
            Com:     _comAddr,
            JobIdx:  _jobIdx,
            Msg:     _msg,
            Status:  uint16(InvStatus.Open),
            idx:     0,
            createTime: now,
            updateTime: 0
        });
        new_offer.idx = offers.push(new_offer)-1;

        _job.offers.push(new_offer.idx);
        _applicant.offers.push(new_offer.idx);

        emit OnOfferAdd(_appAddr, _comAddr, _jobIdx, _payment);
    }

    function updateOfferStatus(uint _offIdx, uint _newStatus) public 
    ValidIdx(offers.length, _offIdx) ValidStatus(uint(OffStatus.Last), _newStatus) APPModifiableOff(_offIdx, msg.sender) 
    {
        Offer storage _offer = offers[_offIdx];
        _offer.Status = uint16(_newStatus);

        if (uint16(_newStatus) == uint16(OffStatus.Accept)) {
            // TODO
            // Job
            Job storage _job = getJob(_offer.Com, _offer.JobIdx);
            _job.Employee.push(_offer.App);
            // Applicant
            Applicant storage _applicant = applicants[_offer.App];
            _applicant.Status = uint16(AppStatus.Close);
            for(uint i=0;i<_applicant.offers.length;i++) {
                if (isActiveOffer(offers[_applicant.offers[i]])) {
                    offers[_applicant.offers[i]].Status = uint16(OffStatus.Close);
                }
            }
        }
        
        emit OnOfferUpdate(_offer.App, _offer.Com, _offer.JobIdx, _offer.Payment, _offer.Status);
    }

    function updateOfferPayment(uint _offIdx, uint _newPayment) public 
    ValidIdx(offers.length, _offIdx) COMModifiableOff(_offIdx, msg.sender) {
        Offer storage _offer = offers[_offIdx];
        _offer.Payment = _newPayment;
        _offer.Status = uint16(OffStatus.Open);

        emit OnOfferUpdate(_offer.App, _offer.Com, _offer.JobIdx, _offer.Payment, _offer.Status);
    }

    function closeOffer(uint _offIdx) public 
    ValidIdx(offers.length, _offIdx){
        Offer storage _offer = offers[_offIdx];
        // require(_offer.Com == msg.sender, "Only Company can close offer!");
        // require(isActiveOffer(_offer), "Offer is not active!");
        require(_offer.Com == msg.sender);
        require(isActiveOffer(_offer));
        _offer.Status = uint16(OffStatus.Close);

        emit OnOfferUpdate(_offer.App, _offer.Com, _offer.JobIdx, _offer.Payment, _offer.Status);
    }

    //// View
    function getOfferInfo(uint _offIdx) external view ValidIdx(offers.length, _offIdx)
    returns (address _applicants, address _company, uint _jobIdx, string memory _msg, uint _payment, 
    uint _status, uint256 _createTime, uint256 _updateTime) {
        Offer storage _offer = offers[_offIdx];
        return (_offer.App, _offer.Com, _offer.JobIdx, _offer.Msg, _offer.Payment, 
                uint(_offer.Status), _offer.createTime, _offer.updateTime);
    }

    function isExpiredOff(uint _offIdx) public view 
    ValidIdx(offers.length, _offIdx) returns(bool) {
        if (isExpired(offers[_offIdx].createTime, off_Expire)) { return true; } 
        return false;
    }

    function inCooldownOff(uint _offIdx) public view 
    ValidIdx(offers.length, _offIdx) returns(bool) {
        Offer storage _offer = offers[_offIdx];
        if (inCoolDown(_offer.updateTime, off_Cooldown)) { return true; } 
        return false;
    }
}