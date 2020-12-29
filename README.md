# Checkpoint
## 1. 建立帳號系統(個人與公司)
- 個人帳號: 姓名
- 公司帳號: 公司名稱
### Frontend
- 確認帳號是否註冊
- 無帳號則跳出註冊頁面，輸入名稱與type(可顯示metamask blockchain 帳號)
- 有帳號則跳進資料頁面，與contract要求帳號內資料

### Contract
- Mapping of address and account struct
- Interface for register and login(Retreive account data)

function:
- isValidAccount(address) ( 確認帳號是否註冊 )
- addAccount(name, type) ( 新增帳號(兩種type: 個人與公司, 名稱) )
- getAccount(address) ( 要求帳號內資料 )

## 2. 上傳個人基本資料、履歷與公司資料
表格形式(固定或可新增欄位)或純文字形式(限制字數)

#### 個人:
- 聯絡方式
- 期望薪資
- 學歷
- 應徵工作

#### 公司:
- 介紹
- 聯絡方式

### Frontend
編輯資料並發送給contract

~~固定時間render一次頁面重要一次data~~
接收到event(OnAccountUpdate)後重新getAccount

### Contract
- Storage for data and resume(IPFS maybe?)
- Interface for retrieve all data in account struct
- Interface for update the data in struct

function:
- updataAccount(content)

## 3. 建立交易系統

### Frontend
- 取得所有其他個人與公司帳戶資料
    * 個人: Name, resume, application history(optional)
    * 公司: Name, introduction, opened job list, offers and interview invitations history(optional)

- 取得帳戶所有交易紀錄與狀態(status)
    * 個人: offers and interview invitations from company, application sent from account
    * 公司: application to opened job from applicants, offers and interview invitations from account

- 更新上傳功能
    * 公司: Add and update opened job list 
        - Title
        - Description
        - Number/Remain
        - status(open/close)

- 發起交易
    * 個人: Send application to opened job, accept/reject offer/interview invitation
    * 公司: Send offer/interview invitation to applicant, accecpt/reject application


### Contract

##### Struct 
1. Account
- Applicant:
    * Name
    * Resume
    * Status: Open/Close

        When Closed, no offer can be sent to this account.

    Action: 
    - Send Application 
    - Check/Reject interview invitation
    - Check/Reject offer (If check auto reject all other offers)

- Company:
    * Name
    * Intro
    * Job list(array)
        - Job
            * Title
            * ID
            * Description
            * Number/Remain
            * Status: Open/Close
    
        Action:
        - Send interview invitation
        - Send Offer
        - Check/Reject application 

2. Transaction
- Offer
    * Payment
    * Applicant address
    * Company address
    * JobID
    * ID
    * Message
    * Status(Wait/Accept/Reject)
    * Timestamp

- Application/Interview
    * Applicant address
    * Company address
    * JobID
    * ID
    * Message
    * From (company/applicant)
    * Status(Wait/Accept/Reject)
    * createTime
    * lastUpdateTime


##### Array:
Offer
Application/Interview


##### Mapping:
address -> Offer idx
address -> Application/Interview idx


# Usage

## 1.Prerequisite
- cd frontend
- yarn

## 2.Steps
- open ganache gui
- truffle migrate
- cp build to frontend/src/build
- open metamask and connect to the account
- cd frontend
- yarn start
